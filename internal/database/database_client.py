from constants import DatabaseCreds
import mysql.connector
import json
import pandas as pd
from models.auth_models import User

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
        print(user_data)
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
    
    def get_user_league_team(self, user_id, league_id):
        query = ("SELECT * FROM user_league WHERE user_id = '{}' AND league_id = '{}'".format(user_id, league_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        league_team = cursor.fetchone()
        cursor.close()
        return league_team

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
        print(query)
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
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
    
    def set_gameweek_team(self, gameweek_id, season_id, team_id, players):
        print("in db")
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
    



    def close(self):
        self.con.close()
