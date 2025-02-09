from fastapi import Depends
from pydantic import BaseModel, ConfigDict, Field
# from pydantic import BaseModel
from database.database_client import DatabaseClient
from models.auth_models import PublicUser, User
from services.team_management import TeamManagementService
from models.db_models import  League, LeagueFixture, LeagueTeamExtended, NewLeague
from constants import Season


class GameweekFixtureResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    user_1: PublicUser = Field(alias="user1")
    user_1_score: int = Field(alias="user1Score")
    user_2: PublicUser = Field(alias="user2")
    user_2_score: int = Field(alias="user2Score")
    gameweek_id: int = Field(alias="gameweekId")
    gameweek_number: int = Field(alias="gameweekNumber")
    odd_player: bool = Field(alias="oddPlayer")

class LeagueFixtureResults(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    gameweek_fixtures: list[GameweekFixtureResult] = Field(alias="gameweekFixtures")
    league_id: int = Field(alias="leagueId")

class LeagueManagementService:
    def __init__(self, db_client: DatabaseClient, team_management: TeamManagementService):
        self.db_client = db_client
        self.team_management = team_management

    def join_league(self, league_id: int, user_id: int, password: int, team_name: str):
        league = self.db_client.get_league_model(league_id)
        if league.draft_completed or league.password != password:
            return False
        self.db_client.join_league(league_id, user_id, team_name)
        return True

    def create_league(self, new_league: NewLeague, team_name: str):
        league_id = self.db_client.create_league(
            new_league.name,
            new_league.password,
            new_league.admin,
            new_league.player_limit,
            new_league.type,
            new_league.private,
        )
        self.join_league(league_id, new_league.admin, new_league.password, team_name)
    
    def update_active_league(self, user_id: int, new_league_id: int):
        self.db_client.update_active_league(user_id, new_league_id)
    
    def get_user_leagues(self, user_id: int) -> list[League]:
        user_teams = self.db_client.get_user_teams(user_id)
        leagues: list[League] = []
        for team in user_teams:
            league = self.db_client.get_league_model(team.league_id)
            leagues.append(league)
        return leagues
    
    def get_league_teams(self, league_id: int) -> LeagueTeamExtended:
        return self.db_client.get_extended_league_team(league_id)
    
    def get_fixtures(self, league_id: int) -> list[LeagueFixture]:
        return self.db_client.get_league_fixtures(league_id)

    def _get_user_gameweek_score(self, league_id:int, user_id: int, gameweek_id: int) -> int:
        team = self.team_management.get_gameweek_stats(league_id, user_id, gameweek_id, False)
        return team.total_player_points + team.total_team_points
    

    def get_league_fixture_results(self, league_id: int) -> LeagueFixtureResults:
        fixtures = self.get_fixtures(league_id)
        gameweeks = self.db_client.get_all_gameweeks(Season.ID)
        current_gameweek = next(gameweeks for gameweeks in gameweeks if gameweeks.current)
        gameweek_fixtures: list[GameweekFixtureResult] = []
        users: dict[int, User] = {}
        gameweek_totals: dict[int, int] = {}
        for fixture in fixtures:
            user_1 = users.get(fixture.user_1, self.db_client.get_user_by_id(fixture.user_1))
            users[fixture.user_1] = user_1
            user_1_score = self._get_user_gameweek_score(league_id, fixture.user_1, fixture.gameweek_id)
            odd_player = False
            gameweek_totals[fixture.gameweek_id] = gameweek_totals.get(fixture.gameweek_id, 0) + user_1_score
            gameweek = next(gameweeks for gameweeks in gameweeks if gameweeks.id == fixture.gameweek_id)
            if gameweek.number > current_gameweek.number:
                break
            if fixture.user_1 == fixture.user_2:
                # will replace user_2 score with gameweek average in this case
                user_2_score = 0
                user_2 = user_1
                odd_player = True
            else:
                user_2_score = self._get_user_gameweek_score(league_id, fixture.user_2, fixture.gameweek_id)
                user_2 = users.get(fixture.user_2, self.db_client.get_user_by_id(fixture.user_2))
                users[fixture.user_2] = user_2
                gameweek_totals[fixture.gameweek_id] += user_2_score
            
            gameweek_fixtures.append(
                GameweekFixtureResult(
                    user_1=user_1.get_public(),
                    user_1_score=user_1_score,
                    user_2=user_2.get_public(),
                    user_2_score=user_2_score,
                    gameweek_id=fixture.gameweek_id,
                    gameweek_number=gameweek.number,
                    odd_player=odd_player
                )
            )
            
            for gameweek_fixture in gameweek_fixtures:
                if gameweek_fixture.odd_player:
                    gameweek_fixture.user_2_score = gameweek_totals[gameweek_fixture.gameweek_id] // (len(users.keys()))

        return LeagueFixtureResults(
            gameweek_fixtures=gameweek_fixtures,
            league_id=league_id
        )

         

    def create_fixtures(self, league_id: int):
        users = self.db_client.get_league_users(league_id)
        user_ids = [user.id for user in users]
        gameweeks = self.db_client.get_all_gameweeks(Season.ID)

            
        fixtures: list[LeagueFixture] = []
        rounds = 38  # Premier League season rounds
        
        for round in range(rounds):
            pairs = [user_ids[i:i+2] for i in range(0, len(user_ids), 2)]
            gameweek = next(gw for gw in gameweeks if gw.number == round + 1)
            for pair in pairs:
                player_2 = pair[0] if len(pair) < 2 else pair[1]
                fixture = LeagueFixture(
                    id=0,
                    user_1=pair[0],
                    user_2=player_2,
                    gameweek_id=gameweek.id,
                    league_id=league_id
                )
                fixtures.append(fixture)

            user_ids = [user_ids[-1]] + user_ids[0:-1]
        
        self.db_client.create_league_fixtures(fixtures)


    @classmethod
    def get_instance(cls, 
            db_client: DatabaseClient = Depends(DatabaseClient),
            ) -> "LeagueManagementService":
        team_management_service = TeamManagementService.get_instance(db_client)
        return cls(db_client, team_management_service)
                


    
