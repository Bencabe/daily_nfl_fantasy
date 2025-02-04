# call script from internal directory using python update_gameweek_stats.py <season_id>
from clients.ff_data_client import FantasyDataClient
from database.database_client import DatabaseClient
from constants import Season
import sys

api_client = FantasyDataClient()
db_client = DatabaseClient()
api_client = FantasyDataClient()
db_client = DatabaseClient()
season_id = int(sys.argv[1]) if len(sys.argv) > 1 else Season.ID
if not season_id:
    raise Exception("No season id provided")

fixtures = api_client.get_season_fixtures(season_id)

fixtures_data_mapping = {}
for fixture in fixtures['data']['fixtures']['data']:
    fixture_id = fixture.get('id')
    fixtures_data_mapping[fixture_id] = {}
    fixtures_data_mapping[fixture_id]['id'] = fixture_id
    fixtures_data_mapping[fixture_id]['season_id'] = fixture.get('season_id')
    fixtures_data_mapping[fixture_id]['league_id'] = fixture.get('league_id')
    fixtures_data_mapping[fixture_id]['stage_id'] = fixture.get('stage_id')
    fixtures_data_mapping[fixture_id]['round_id'] = fixture.get('round_id')
    fixtures_data_mapping[fixture_id]['venue_id'] = fixture.get('venue_id')
    fixtures_data_mapping[fixture_id]['localteam_id'] = fixture.get('localteam_id')
    fixtures_data_mapping[fixture_id]['visitorteam_id'] = fixture.get('visitorteam_id')
    fixtures_data_mapping[fixture_id]['winner_team_id'] = fixture.get('winner_team_id')
    fixtures_data_mapping[fixture_id]['localteam_score'] = fixture.get('scores').get('localteam_score')
    fixtures_data_mapping[fixture_id]['visitorteam_score'] = fixture.get('scores').get('visitorteam_score')
    fixtures_data_mapping[fixture_id]['start_time'] = fixture.get('time').get('starting_at').get('date_time')

for fixture_id in fixtures_data_mapping:
    db_client.add_data_mapping_object('fixtures', fixtures_data_mapping[fixture_id])