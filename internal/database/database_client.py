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

    def get_players_per_position(self,position):
        query = ("SELECT * FROM players WHERE position = '{}'".format(position))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        return vals

    def get_user_leagues(self,user_id):
        query = ("SELECT * FROM user_league WHERE user_id = '{}'".format(user_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        return vals

    def get_league(self, league_id):
        query = ("SELECT * FROM leagues WHERE league_id = '{}'".format(league_id))
        cursor = self.con.cursor()
        cursor.execute(query)
        league = cursor.fetchone()
        return league

    def get_players_per_position(self, position):
        query = ("SELECT * FROM players WHERE position = '{}'".format(position))
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

    def update_team(self, goalkeepers, defenders, midfielders, forwards):
        query = ("INSERT INTO user_league (goalkeeper, defenders, midfielders, forwards) VALUES (%s, %s, %s, %s)")
        values = (goalkeepers, defenders, midfielders, forwards))

    def close(self):
        self.con.close()
