"""
Adds an entry to gameweek_teams (which keeps a record of previous gameweek teams) 
for each team in the database and uses the current team set in user_league as the players.
defaults to creating records for the active gameweek but you can override to creating a record
in gameweek_teams for any gameweek_id
usage: python update_gameweek_teams.py <gameweek_override>
"""

import sys
from typing import Optional
from database.database_client import DatabaseClient

import sys
from typing import Optional
from database.database_client import DatabaseClient
from models.db_models import LeagueTeam
from constants import Season

def add_gameweek_teams(gameweek_id: Optional[int] = None):
    db_client = DatabaseClient()
    
    if not gameweek_id:
        cur_gameweeks = db_client.get_current_gameweek_model()
        if len(cur_gameweeks) != 1:
            raise Exception(f"Invalid number of current gameweeks found: {len(cur_gameweeks)}")
        gameweek_id = cur_gameweeks[0].id


    user_league_teams: list[LeagueTeam] = db_client.get_all_user_league_teams()

    for team in user_league_teams:
        gameweek_team = {
            'gameweek_id': gameweek_id,
            'season_id': Season.ID,
            'team_id': team.team_id,
            'goalkeepers': team.goalkeepers,
            'defenders': team.defenders,
            'midfielders': team.midfielders,
            'forwards': team.forwards,
            'subs': team.subs,
            'tactics': team.tactic
        }
        db_client.add_data_mapping_object("gameweek_teams", gameweek_team)

gameweek_override = None
if len(sys.argv) > 1:
    gameweek_override = int(sys.argv[1])

add_gameweek_teams(gameweek_override)

