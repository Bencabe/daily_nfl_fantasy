import asyncio
from itertools import cycle
from random import shuffle
from fastapi import Depends, WebSocket
from database.database_client import DatabaseClient
from models.db_models import League, LeagueTeam, Player
from models.draft_models import DraftMessage, DraftStatus, PlayerSelected, StartDraft, TimeExpired, TurnChange, PlayerConnect, Positions

TURN_TIME_LIMIT = 62
class DraftService:
    # TODO: maintining connections in this class this will not work in a distributed environment. Could potentially use redis to solve this
    connections: dict[int, list[WebSocket]] = {}
    league_timers: dict[int, asyncio.Task] = {}
    
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
    
    async def _start_timer(self, league_id: int):
        if league_id in self.league_timers:
            self.league_timers[league_id].cancel()
        
        async def timer_expired():
            await asyncio.sleep(TURN_TIME_LIMIT)
            time_expired_message = {"message_type": "timeExpired"}
            response = self.handle_message(time_expired_message, league_id)
            await self.broadcast(response, league_id)
            await self._start_timer(league_id)

        self.league_timers[league_id] = asyncio.create_task(timer_expired())
    
    def _update_turn(
            self, 
            league: League,
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
        asyncio.create_task(self._start_timer(league.id))
        return turn_update

    def _select_random_player(self, league_teams: dict[int, LeagueTeam], league: League, players: list[Player]) -> LeagueTeam:
        # Get current user's team before changing turn
        if not league.draft_turn:
            raise(Exception("draft has not been started"))
        current_team = league_teams[league.draft_turn]
        
        # Get all selected players across all teams
        selected_players = []
        for team in league_teams.values():
            selected_players.extend(team.goalkeepers)
            selected_players.extend(team.defenders)
            selected_players.extend(team.midfielders)
            selected_players.extend(team.forwards)
        
        # Filter available players based on position limits and not already selected
        available_players: list[Player] = []
        if len(current_team.goalkeepers) < 2:
            available_players.extend([p for p in players if p.position_category == Positions.Goalkeeper and p.id not in selected_players])
        if len(current_team.defenders) < 5:
            available_players.extend([p for p in players if p.position_category == Positions.Defender and p.id not in selected_players])
        if len(current_team.midfielders) < 5:
            available_players.extend([p for p in players if p.position_category == Positions.Midfielder and p.id not in selected_players]) 
        if len(current_team.forwards) < 3:
            available_players.extend([p for p in players if p.position_category == Positions.Forward and p.id not in selected_players])

        shuffle(available_players)
        random_player: Player = available_players[0]

        if not random_player or not isinstance(random_player, Player):
            raise Exception("No available players")
        
        # Add player to appropriate position list
        match random_player.position_category:
            case Positions.Goalkeeper:
                current_team.goalkeepers.append(random_player.id)
            case Positions.Defender:
                current_team.defenders.append(random_player.id)
            case Positions.Midfielder:
                current_team.midfielders.append(random_player.id)
            case Positions.Forward:
                current_team.forwards.append(random_player.id)
        
        return current_team
                

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
            updated_team = self._select_random_player(league_teams, league, players)
            league_teams[league.draft_turn] = updated_team
            self.db_client.update_team(
                league_id,
                league.draft_turn,
                updated_team.goalkeepers,
                updated_team.defenders,
                updated_team.midfielders,
                updated_team.forwards,
                updated_team.subs
            )
            turn_update = self._update_turn(league, league_teams)
            return turn_update
        if isinstance(message, PlayerConnect):
            # TODO validate player is part of the league
            if league.draft_started:
                current_user_turn = next((user for user in league_users if user.id == league.draft_turn), None)
                if not current_user_turn:
                    raise Exception("users turn not found")
                if not self.league_timers.get(league_id):
                    asyncio.create_task(self._start_timer(league_id))
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
            asyncio.create_task(self._start_timer(league_id))
            return DraftStatus(
                    message_type="draftStatus",
                    draft_state=league.draft_started,
                    league_users=league_users,
                    player_list=players,
                    user_turn=current_user_turn,
                    league_teams=league_teams,
                )
        if isinstance(message, PlayerSelected):
            turn_update = self._update_turn(league, league_teams)
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
            
