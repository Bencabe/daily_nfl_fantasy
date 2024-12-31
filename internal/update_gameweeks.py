# call script from internal directory using python update_gameweeks.py <season_id>
from clients.ff_data_client import FantasyDataClient
from database.database_client import DatabaseClient
import sys

api_client = FantasyDataClient()
db_client = DatabaseClient()
season_id = int(sys.argv[1]) if len(sys.argv) > 1 else None
gameweeks = api_client.get_gameweeks(season_id)

for gameweek in gameweeks['data']:
    db_client.add_gameweek(gameweek['id'], gameweek['name'], gameweek['season_id'], gameweek['start'], gameweek['end'], 0, gameweek['stage_id'])