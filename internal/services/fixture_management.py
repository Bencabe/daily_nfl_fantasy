from fastapi import Depends
from database.database_client import DatabaseClient


class FixtureManagementService:
    def __init__(self, db_client: DatabaseClient):
        self.db_client = db_client

    def get_gameweek_fixtures(self, gameweek_id: int):
        return self.db_client.get_gameweek_fixtures_model(gameweek_id)

    @classmethod
    def get_instance(cls, 
            db_client: DatabaseClient = Depends(DatabaseClient),
            ) -> "FixtureManagementService":
        return cls(db_client)