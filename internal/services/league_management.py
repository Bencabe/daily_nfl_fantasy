from fastapi import Depends
# from pydantic import BaseModel
from database.database_client import DatabaseClient
from models.db_models import LeagueFixture
from constants import Season



class LeagueManagementService:
    def __init__(self, db_client: DatabaseClient):
        self.db_client = db_client

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
                    user_id_1=pair[0],
                    user_id_2=player_2,
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
        return cls(db_client)
                


    
