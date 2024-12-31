from itertools import cycle
from random import shuffle
from fastapi import Depends, WebSocket
from database.database_client import DatabaseClient
from models.db_models import League, LeagueTeam
from models.draft_models import DraftMessage, DraftStatus, PlayerSelected, StartDraft, TimeExpired, TurnChange, PlayerConnect, Positions

    
class DraftService:
    # TODO: maintining connections in this class this will not work in a distributed environment. Implement a queue
    connections: dict[int, list[WebSocket]] = {}
    
    def __init__(self, db_client: DatabaseClient = Depends(DatabaseClient)):
        self.db_client = db_client
        # self.connections = set()
    
    async def connect(cls, league_id: int, websocket: WebSocket):
        cur_connections = cls.connections.get(league_id, [])
        if websocket not in cur_connections:
            cur_connections.append(websocket)
        cls.connections[league_id] = cur_connections
        
    async def disconnect(cls, websocket, league_id: int):
        cur_connections = cls.connections.get(league_id, [])
        if websocket in cur_connections:
            cur_connections.remove(websocket)
        cls.connections[league_id] = cur_connections
    
    async def broadcast(cls, message: DraftMessage, league_id: int):
        for connection in cls.connections[league_id]:
            await connection.send_json(message.model_dump(by_alias=True))
    
    def _update_turn(
            self, 
            league: League, 
            message: TimeExpired | PlayerSelected,
            league_teams: dict[int, LeagueTeam]
        ) -> TurnChange:
        if not league.draft_order:
            raise Exception("draft has not been started")
        draft_cycle = cycle(league.draft_order)
        current_index = league.draft_order.index(league.draft_turn)
        for _ in range(current_index + 1):
            next(draft_cycle)
        next_player = next(draft_cycle)
        turn_update = TurnChange(
                next_user_id=next_player,
                league_teams=league_teams,
            )
        league.draft_turn = next_player
        self.db_client.update_league(league.model_dump(by_alias=True))
        return turn_update

    def handle_message(
            self, 
            raw_message: dict[str, any], 
            league_id: int
        ) -> DraftMessage:
        message = DraftMessage.model_validate(raw_message).root
        league = self.db_client.get_league_model(league_id)
        league_users = self.db_client.get_league_users(league_id)
        players = self.db_client.get_all_players()
        league_teams: dict[int, LeagueTeam] = {}
        for user in league_users:
            league_teams[user.id] = self.db_client.get_league_team(user.id, league_id)
        
        if isinstance(message, TimeExpired):
            turn_update = self._update_turn(league, message, league_teams)
            return turn_update
        if isinstance(message, PlayerConnect):
            # TODO validate player is part of the league
            if league.draft_started:
                current_user_turn = next((user for user in league_users if user.id == league.draft_turn), None)
                if not current_user_turn:
                    raise Exception("users turn not found")
                return DraftStatus(
                    message_type="draftStatus",
                    draft_state=league.draft_started,
                    league_users=league_users,
                    player_list=players,
                    user_turn=current_user_turn,
                    league_teams=league_teams,
                )
            else:
                return message
        if isinstance(message, StartDraft):
            # TODO validate player is part of the league
            league.draft_started = True
            order = [user.id for user in league_users]
            shuffle(order)
            league.draft_order = order
            current_user_turn = next((user for user in league_users if user.id == league.draft_order[0]), None)
            league.draft_turn = current_user_turn.id
            self.db_client.update_league(league.model_dump())
            if not current_user_turn:
                raise Exception("users turn not found")
            return DraftStatus(
                    message_type="draftStatus",
                    draft_state=league.draft_started,
                    league_users=league_users,
                    player_list=players,
                    user_turn=current_user_turn,
                    league_teams=league_teams,
                )
        if isinstance(message, PlayerSelected):
            turn_update = self._update_turn(league, message, league_teams)
            team = league_teams[message.user_id]
            match message.player_position:
                case Positions.Goalkeeper:
                    team.goalkeepers.append(message.player_id)
                case Positions.Defender:
                    team.defenders.append(message.player_id)
                case Positions.Midfielder:
                    team.midfielders.append(message.player_id)
                case Positions.Forward:
                    team.forwards.append(message.player_id)
            turn_update.league_teams[message.user_id] = team
            self.db_client.update_team(
                league_id,
                message.user_id,
                team.goalkeepers,
                team.defenders,
                team.midfielders,
                team.forwards,
                team.subs
            )
            return turn_update
            
