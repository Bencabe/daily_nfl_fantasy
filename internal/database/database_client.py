from constants import DatabaseCreds
import mysql.connector
import json
import pandas as pd
from models.db_models import Gameweek, League, UserLeague, Player, LeagueTeam
from models.auth_models import PublicUser, User

class DatabaseClient:
    def __init__(self):
        self.con = mysql.connector.connect(user=DatabaseCreds.USER, 
                                        password=DatabaseCreds.PASSWORD,
                                        host=DatabaseCreds.HOST,
                                        database=DatabaseCreds.DB_NAME)
        

    def get_user(self,email):
        query = ("SELECT * FROM users WHERE email = '{}'".format(email))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals


    def get_user_model(self,email) -> User:
        query = ("SELECT * FROM users WHERE email = %s")
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query, (email,))
        user_data = cursor.fetchone()
        cursor.close()
        return User.model_validate(user_data)
        
    
    def add_user(self,email,password,first_name,last_name):
        cursor = self.con.cursor()
        query = ("INSERT INTO users "
               "(email,password,first_name,last_name) "
               "VALUES (%s, %s, %s, %s)")
        values = (email,password,first_name,last_name)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()
        

    def get_user_leagues(self,user_id):
        query = ("SELECT * FROM user_league WHERE user_id = '{}'".format(user_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals

    def get_user_league(self,user_id, league_id):
        query = ("SELECT * FROM user_league WHERE user_id = %s AND league_id = %s")
        values = (user_id, league_id)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals
    
    def get_user_created_leagues(self,user_id):
        query = ("SELECT * FROM leagues WHERE admin = '{}'".format(user_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals

    def get_league(self, league_id):
        query = ("SELECT * FROM leagues WHERE id = '{}'".format(league_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        league = cursor.fetchone()
        cursor.close()
        return league
    
    def get_league_model(self, league_id) -> League:
        query = ("SELECT * FROM leagues WHERE id = '{}'".format(league_id))
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        league = cursor.fetchone()
        cursor.close()
        order = json.loads(league['draft_order']) if league['draft_order'] else None
        return League(
            id=league['id'],
            name=league['name'],
            password=league['name'],
            admin=league['admin'],
            private=league['private'],
            type=league['type'],
            player_limit=league['player_limit'],
            draft_started=league['draft_started'],
            draft_completed=league['draft_completed'],
            draft_turn=league['draft_turn'],
            draft_order=order,
        )
    
    def update_league(self, new_league: dict[str, any]):
        query = ("UPDATE leagues SET "
                "name = %s, "
                "password = %s, "
                "admin = %s, "
                "player_limit = %s, "
                "type = %s, "
                "private = %s, "
                "draft_started = %s, "
                "draft_completed = %s, "
                "draft_turn = %s, "
                "draft_order = %s "
                "WHERE id = %s")
        
        values = (
            new_league.get('name'),
            new_league.get('password'),
            new_league.get('admin'),
            new_league.get('player_limit'),
            new_league.get('type'),
            int(new_league.get('private')),
            int(new_league.get('draft_started')),
            int(new_league.get('draft_completed')),
            new_league.get('draft_turn'),
            str(new_league.get('draft_order')),
            new_league.get('id'),
        )
        
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()
    


    def create_league(self, league_name, league_password, league_admin, player_limit, league_type, private_league):
        # create the league
        query = ("INSERT INTO leagues"
               "(name, password, admin, player_limit, type, private) "
               "VALUES (%s, %s, %s, %s, %s, %s)")
        values = (league_name, league_password, league_admin, player_limit, league_type, private_league)
        if not player_limit:
            query = ("INSERT INTO leagues"
               "(name, password, admin, type, private) "
               "VALUES (%s, %s, %s, %s, %s)")
            values = (league_name, league_password, league_admin, league_type, private_league)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()

    def get_players_per_position(self, position):
        query = ("SELECT * FROM players WHERE position_category = '{}'".format(position))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals

    def get_all_players(self) ->  list[Player]:
        query = ("SELECT * FROM players")
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        vals: list[Player] = []
        for val in cursor:
            vals.append(Player.model_validate(val))
        cursor.close()
        return vals
    
    def get_user_league_team(self, user_id, league_id):
        query = ("SELECT * FROM user_league WHERE user_id = '{}' AND league_id = '{}'".format(user_id, league_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        league_team = cursor.fetchone()
        cursor.close()
        return league_team
    
    def get_league_team(self, user_id, league_id) -> LeagueTeam:
        query = ("SELECT * FROM user_league WHERE user_id = '{}' AND league_id = '{}'".format(user_id, league_id))
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        league_team = cursor.fetchone()
        cursor.close()
        return LeagueTeam(
            team_id=league_team['team_id'],
            league_id=league_team['league_id'],
            user_id=league_team['user_id'],
            team_name=league_team['team_name'],
            goalkeepers=json.loads(league_team['goalkeepers']),
            defenders=json.loads(league_team['defenders']),
            midfielders=json.loads(league_team['midfielders']),
            forwards=json.loads(league_team['forwards']),
            subs=json.loads(league_team['subs']),
        )

    def update_team(self, league_id, user_id, goalkeepers, defenders, midfielders, forwards, subs):
        query = ("UPDATE user_league SET goalkeepers=%s,defenders=%s,midfielders=%s,forwards=%s,subs=%s WHERE league_id=%s AND user_id=%s")
        values = (str(goalkeepers), str(defenders), str(midfielders), str(forwards), str(subs), league_id, user_id)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()

    def join_league(self, league_id, user_id, team_name):
        query = ("INSERT INTO user_league"
               "(league_id, user_id, goalkeepers, defenders, midfielders, forwards, subs, team_name) "
               "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)")
        values = (league_id, user_id, '[]', '[]', '[]', '[]', '[]', team_name)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()
    
    def get_league_teams(self, league_id):
        query = ("SELECT * FROM user_league WHERE league_id = '{}'".format(league_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals
    
    def get_league_team_models(self, league_id) -> list[UserLeague]:
        query = ("SELECT * FROM user_league WHERE league_id = '{}'".format(league_id))
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        vals: list[UserLeague] = []
        for val in cursor:
            vals.append(
                UserLeague(
                    team_id=val['team_id'],
                    league_id=val['league_id'],
                    user_id=val['user_id'],
                    goalkeepers=json.loads(val['goalkeepers']),
                    defenders=json.loads(val['defenders']),
                    midfielders=json.loads(val['midfielders']),
                    forwards=json.loads(val['forwards']),
                    subs=json.loads(val['subs']),
                    team_name=val['team_name']
                )
            )
        cursor.close()
        return vals

    def get_league_users(self, league_id) -> list[PublicUser]:
        league_teams = self.get_league_team_models(league_id)
        user_ids = [league_team.user_id for league_team in league_teams]
        
        query = ("SELECT * FROM users WHERE id IN ({})".format(','.join(['%s'] * len(user_ids))))
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query, tuple(user_ids))
        vals: list[PublicUser] = []
        for val in cursor:
            vals.append(PublicUser.model_validate(val))
        cursor.close()
        return vals

    def get_current_gameweek(self):
        query = ("SELECT * FROM gameweeks WHERE current=1")
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals

    def get_current_gameweek_model(self) -> list[Gameweek]:
        query = ("SELECT * FROM gameweeks WHERE current=1")
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        vals: list[Gameweek] = []
        for val in cursor:
            vals.append(Gameweek.model_validate(val))
        cursor.close()
        return vals
    
    def reset_current_gameweeks(self):
        query = "UPDATE gameweeks SET current = 0"
        cursor = self.con.cursor()
        cursor.execute(query)
        self.con.commit()
        cursor.close()

    
    def set_gameweek_team(self, gameweek_id, season_id, team_id, players):
        query = ("REPLACE INTO gameweek_teams"
                "(gameweek_id, season_id, team_id, goalkeepers, defenders, midfielders, forwards, subs)"
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)")
        values = (gameweek_id, 
                season_id, \
                team_id, \
                str(players.get('goalkeepers')), \
                str(players.get('defenders')), \
                str(players.get('midfielders')), \
                str(players.get('forwards')), \
                str(players.get('subs'))\
            )
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()

    def get_gameweek(self, season_id, gameweek_number):
        query = ("SELECT * FROM gameweeks WHERE season_id=%s AND number=%s")
        values = (season_id, gameweek_number)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals
    
    def get_player_gameweek_stats(self):
        query = ("SELECT * FROM gameweeks WHERE current=1")
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        return vals

    def gameweek_team(self, gameweek_id, team_id):
        query = ("SELECT * FROM gameweek_teams WHERE gameweek_id=%s AND team_id=%s")
        values = (gameweek_id, team_id)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals

    def get_gameweek_stats(self, gameweek_id):
        query = (f'SELECT stats.*, fixtures.round_id\
                 FROM daily_ff.gameweek_player_stats as stats\
                 JOIN daily_ff.fixtures as fixtures\
                 ON stats.fixture_id = fixtures.id\
                 WHERE round_id = {gameweek_id}')
        return json.loads(pd.read_sql(query, self.con).to_json(orient='index'))
    
    def get_fixtures_in_gameweek(self, gameweek_id):
        query = (f"SELECT * FROM fixtures WHERE round_id={gameweek_id}")
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        return vals

    def add_data_mapping_object(self, table: str, data_mapping: dict[str, any]):
        '''
        input an object which uses the sql column names as keys and has the desired values as values 
        e.g {'id': 123, 'season_id': 16036, 'league_id': 8}
        '''
        # Convert any list values to JSON strings
        processed_mapping = {
            key: json.dumps(value) if isinstance(value, list) else value 
            for key, value in data_mapping.items()
        }
        # Create column names and values strings
        columns = ', '.join(processed_mapping.keys())
        placeholders = ', '.join(['%s'] * len(processed_mapping))
        values = tuple(processed_mapping.values())
        
        # Create the UPDATE part for duplicate handling
        update_parts = [f"{key} = VALUES({key})" for key in processed_mapping.keys()]
        update_stmt = ', '.join(update_parts)
        
        query = f"""
            INSERT INTO {table} ({columns}) 
            VALUES ({placeholders})
            ON DUPLICATE KEY UPDATE {update_stmt}
        """
        
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()

    def add_gameweek(self, gameweek_id, number, season_id, start_date, end_date, current, stage_id):
        cursor = self.con.cursor()
        query = ("INSERT INTO gameweeks "
            "(id, number, season_id, start_date, end_date, current, stage_id) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s) "
            "ON DUPLICATE KEY UPDATE "
            "number = VALUES(number), "
            "season_id = VALUES(season_id), "
            "start_date = VALUES(start_date), "
            "end_date = VALUES(end_date), "
            "current = VALUES(current), "
            "stage_id = VALUES(stage_id)")
        values = (gameweek_id, number, season_id, start_date, end_date, current, stage_id)
        cursor.execute(query, values)
        self.con.commit()
    
    def get_active_gameweek(self) -> Gameweek | None:
        cursor = self.con.cursor(dictionary=True)
        query = (
            "SELECT * FROM gameweeks "
            "WHERE CURRENT_TIMESTAMP BETWEEN start_date AND end_date;"
        )
        cursor.execute(query)
        active_gameweek = cursor.fetchone()
        if active_gameweek: 
            return Gameweek.model_validate(active_gameweek)
    
    def get_next_gameweek(self):
        cursor = self.con.cursor(dictionary=True)
        query = (
            "SELECT * FROM gameweeks "
            "WHERE start_date > CURRENT_TIMESTAMP "
            "ORDER BY start_date ASC "
            "LIMIT 1;"
        )
        cursor.execute(query)
        next_gameweek = cursor.fetchone()
        return Gameweek.model_validate(next_gameweek)
    

    def get_all_user_league_teams(self) -> list[UserLeague]:
        query = """
            SELECT *
            FROM user_league
            """
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        teams: list[UserLeague] = []
        for team in cursor:
            teams.append(
                UserLeague(
                    team_id=team['team_id'],
                    league_id=team['league_id'],
                    user_id=team['user_id'],
                    goalkeepers=json.loads(team['goalkeepers']),
                    defenders=json.loads(team['defenders']),
                    midfielders=json.loads(team['midfielders']),
                    forwards=json.loads(team['forwards']),
                    subs=json.loads(team['subs']),
                    team_name=team['team_name']
                )
            )
        return teams
        # with self.con.cursor(dictionary=True) as cur:
        #     cur.execute(query)
        #     teams = cur.fetchall()

            
        #     return [UserLeague(
        #         team_id=team['team_id'],
        #         league_id=team['league_id'],
        #         user_id=team['user_id'],
        #         goalkeepers=json.loads(team['goalkeepers']),
        #         defenders=json.loads(team['defenders']),
        #         midfielders=json.loads(team['midfielders']),
        #         forwards=json.loads(team['forwards']),
        #         subs=json.loads(team['subs']),
        #         team_name=team['team_name']
        #     ) for team in teams]



    def close(self):
        self.con.close()
