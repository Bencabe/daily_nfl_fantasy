# call script from internal directory using python update_gameweek_stats.py <gameweek_id> <season_id>
from clients.ff_data_client import FantasyDataClient
from database.database_client import DatabaseClient
import sys
import time

def player_stat_mapping(stats, season_id):
    mapping = {}
    for player in stats:
        if player['stats']:
            if player.get('player'):
                mapping[player['player_id']] = {}
                mapping[player['player_id']]['position_id'] = player.get('player').get('data').get('player_id')
            player_stats = player['stats']
            players_id = player['player_id']
            mapping[players_id] = {}
            mapping[players_id]['player_id'] = players_id
            mapping[players_id]['fixture_id'] = player['fixture_id']
            mapping[players_id]['league_id'] = '8'
            mapping[players_id]['season_id'] = season_id
            mapping[players_id]['rating'] = player_stats.get('rating')
            mapping[players_id]['minutes'] = player_stats.get('other').get('minutes_played')
            mapping[players_id]['saves'] = player_stats.get('other').get('saves')
            mapping[players_id]['interceptions'] = player_stats.get('other').get('interceptions')
            mapping[players_id]['tackles'] = player_stats.get('other').get('tackles')
            mapping[players_id]['blocks'] = player_stats.get('other').get('blocks')
            mapping[players_id]['hit_post'] = player_stats.get('other').get('hit_woodwork')
            mapping[players_id]['penalties_won'] = player_stats.get('other').get('pen_won')
            mapping[players_id]['penalties_scored'] = player_stats.get('other').get('pen_scored')
            mapping[players_id]['penalties_missed'] = player_stats.get('other').get('pen_missed')
            mapping[players_id]['penalties_committed'] = player_stats.get('other').get('pen_committed')
            mapping[players_id]['penalties_saved'] = player_stats.get('other').get('pen_saved')
            mapping[players_id]['inside_box_saves'] = player_stats.get('other').get('inside_box_saves')
            mapping[players_id]['dispossesed'] = player_stats.get('other').get('dispossesed')
            mapping[players_id]['aerials_won'] = player_stats.get('other').get('aerials_won')
            mapping[players_id]['goals'] = player_stats.get('goals').get('scored')
            mapping[players_id]['goals_conceded'] = player_stats.get('goals').get('team_conceded')
            mapping[players_id]['owngoals'] = player_stats.get('goals').get('owngoals')
            mapping[players_id]['assists'] = player_stats.get('goals').get('assists')
            mapping[players_id]['yellowcards'] = player_stats.get('cards').get('yellowcards')
            mapping[players_id]['yellowred'] = player_stats.get('cards').get('yellowred')
            mapping[players_id]['redcards'] = player_stats.get('cards').get('redcards')
            mapping[players_id]['fouls_comitted'] = player_stats.get('fouls').get('committed')
            mapping[players_id]['fouls_drawn'] = player_stats.get('fouls').get('drawn')
            mapping[players_id]['accurate_crosses'] = player_stats.get('passing').get('crosses_accuracy')
            mapping[players_id]['dribble_attempts'] = player_stats.get('dribbles').get('attempts')
            mapping[players_id]['dribble_success'] = player_stats.get('dribbles').get('success')
            mapping[players_id]['dribble_past'] = player_stats.get('dribbles').get('dribbled_past')
            mapping[players_id]['total_crosses'] = player_stats.get('passing').get('total_crosses')
            mapping[players_id]['total_passes'] = player_stats.get('passing').get('passes')
            mapping[players_id]['pass_accuracy'] = player_stats.get('passing').get('passes_accuracy')
            mapping[players_id]['key_passes'] = player_stats.get('passing').get('key_passes')
            mapping[players_id]['shots_total'] = player_stats.get('shots').get('shots_total')
            mapping[players_id]['shots_on_target'] = player_stats.get('shots').get('shots_on_goal')
            mapping[players_id]['duels_total'] = player_stats.get('duels').get('total')
            mapping[players_id]['duels_won'] = player_stats.get('duels').get('won')
    return mapping


api_client = FantasyDataClient()
db_client = DatabaseClient()
gameweek_id = int(sys.argv[1]) if len(sys.argv) > 1 else None
season_id = int(sys.argv[2]) if len(sys.argv) > 2 else None
if not gameweek_id or not season_id:
    raise Exception("No gameweek id or season id provided")
gameweek_fixtures = db_client.get_fixtures_in_gameweek(gameweek_id)
gameweek_player_stats = []
for fixture in gameweek_fixtures:
    fixture_stats = api_client.get_player_stats_by_fixture(fixture[0])
    error_message = fixture_stats.get("message")
    while error_message and "exceeded the rate limit per minute" in error_message:
        print("Rate limit exceeded, sleeping for 60 seconds")
        time.sleep(60)
        fixture_stats = api_client.get_player_stats_by_fixture(fixture[0])
        error_message = fixture_stats.get("message")
        
    gameweek_player_stats.append(fixture_stats)


for fixture in gameweek_player_stats:
    if "data" not in fixture:
        raise Exception(f"No data in fixture: {fixture}")
    starting_player_stats = player_stat_mapping(fixture['data']['lineup']['data'], season_id)
    subs_stats = player_stat_mapping(fixture['data']['bench']['data'], season_id)
    for player_id in starting_player_stats:
        db_client.add_data_mapping_object('gameweek_player_stats',starting_player_stats[player_id])
    for player_id in subs_stats:
        db_client.add_data_mapping_object('gameweek_player_stats', subs_stats[player_id])

print("Data insertion complete")


