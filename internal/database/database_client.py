from constants import DatabaseCreds
import mysql.connector

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
        return vals
    
    def add_user(self,email,password,first_name,last_name):
        cursor = self.con.cursor()
        query = ("INSERT INTO users "
               "(email,password,first_name,last_name) "
               "VALUES (%s, %s, %s, %s)")
        values = (email,password,first_name,last_name)
        cursor.execute(query,values)
        self.con.commit()

    def get_user_leagues(self,user_id):
        query = ("SELECT * FROM user_league WHERE user_id = '{}'".format(user_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        return vals
    
    def get_user_created_leagues(self,user_id):
        print('here')
        query = ("SELECT * FROM leagues WHERE admin = '{}'".format(user_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        print(vals)
        return vals

    def get_league(self, league_id):
        query = ("SELECT * FROM leagues WHERE id = '{}'".format(league_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        league = cursor.fetchone()
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

    def update_team(self, league_id, user_id, goalkeepers, defenders, midfielders, forwards):
        query = ("UPDATE user_league SET goalkeepers=%s,defenders=%s,midfielders=%s,forwards=%s WHERE league_id=%s AND user_id=%s")
        values = (str(goalkeepers), str(defenders), str(midfielders), str(forwards), league_id, user_id)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()

    def join_league(self, league_id, user_id, team_name):
        query = ("INSERT INTO user_league"
               "(league_id, user_id, goalkeepers, defenders, midfielders, forwards, team_name) "
               "VALUES (%s, %s, %s, %s, %s, %s, %s)")
        values = (league_id, user_id, '[]', '[]', '[]', '[]', team_name)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()


    def close(self):
        self.con.close()
