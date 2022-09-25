from flask import Flask, request
from flask_cors import CORS
import sys
from database.database_client import DatabaseClient
from constants import Season
import json

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/get_user', methods=['GET','POST'])
def get_user():
    db_client = DatabaseClient()
    user = db_client.get_user(request.headers.get('email'))
    result = json.dumps(user)
    db_client.close()
    return result

@app.route('/add_user/<email>/<password>/<first_name>/<last_name>')
def add_user(email,password,first_name,last_name):
    # TODO clean up error handling and strings
    try:
        db_client = DatabaseClient()
        db_client.add_user(email,password,first_name,last_name)
        db_client.close()
        return "User added successfully"
    except Exception as e: 
        return f"Error adding contact: {e}"

@app.route('/get_players_per_position/<position>')
def get_players_per_position(position):
    # TODO clean up error handling and strings
    try:
        db_client = DatabaseClient()
        players = db_client.get_players_per_position(position)
        result = json.dumps(players)
        db_client.close()
        return result
    except Exception as e: 
        return f"Error getting players: {e}"

@app.route('/get_user_leagues', methods=['GET','POST'])
def user_leagues():
    if request.method == 'GET':
        try:
            db_client = DatabaseClient()
            user_leagues = db_client.get_user_leagues(request.headers.get('user_id'))
            result = json.dumps(user_leagues)
            db_client.close()
            return result
        except Exception as e: 
            return json.dumps(f"Error getting players: {e}")

@app.route('/get_user_league', methods=['GET','POST'])
def user_league():
    if request.method == 'GET':
        try:
            print('trying')
            db_client = DatabaseClient()
            user_leagues = db_client.get_user_league(request.headers.get('user_id'), request.headers.get('league_id'))
            result = json.dumps(user_leagues)
            db_client.close()
            return result
        except Exception as e: 
            return json.dumps(f"Error getting players: {e}")

@app.route('/league', methods=['GET','POST'])

def league():
    try:
        db_client = DatabaseClient()
    except Exception as e:
        return json.dumps(f"Error connecting to database: {e}")
    if request.method == 'GET':
        try:
            league = db_client.get_league(request.headers.get('league_id'))
            result = json.dumps(league)
            db_client.close()
            return result
        except Exception as e:
            return json.dumps(f"Error getting league: {e}")
    if request.method == 'POST':
        try:
            db_client.create_league(
                request.headers.get('league_name'),
                request.headers.get('league_password'),
                request.headers.get('league_admin'),
                request.headers.get('player_limit'),
                request.headers.get('league_type'),
                request.headers.get('private_league'),
            )
            user_created_leagues = db_client.get_user_created_leagues(request.headers.get('league_admin'))
            for league in user_created_leagues:
                try:
                    db_client.join_league(league[0], request.headers.get('league_admin'), request.headers.get('team_name'))
                    db_client.close()
                except Exception as e:
                    print(f"Error joining league: {e}")
            return json.dumps('League created successfully')
        except Exception as e:
            return json.dumps(f"Error creating league: {e}")

@app.route('/join_league', methods=['POST'])
def join_league():
    try:
        db_client = DatabaseClient()
        db_client.join_league(request.headers.get('league_id'), request.headers.get('user_id'), request.headers.get('team_name'))
        db_client.close()
        return json.dumps("Successfully joined league")
    except Exception as e:
        return json.dumps(f"Error joining league: {e}")


@app.route('/players_per_position', methods=['GET'])
def players_per_position():
    if request.method == 'GET':
        try:
            db_client = DatabaseClient()
            result = db_client.get_players_per_position(request.headers.get('position'))
            players = json.dumps(result)
            db_client.close()
            return players
        except Exception as e:
            return json.dumps(f"Error getting players: {e}")

@app.route('/user_league_team', methods=['GET','POST'])
def user_league_team():
    if request.method == 'GET':
        try:
            db_client = DatabaseClient()
            result = db_client.get_user_league_team(request.headers.get('user_id'), request.headers.get('league_id'))
            league_team = json.dumps(result)
            db_client.close()
            return league_team
        except Exception as e:
            return json.dumps(f"Error getting user's team: {e}")
    if request.method == 'POST':
        try:
            db_client = DatabaseClient()
            db_client.update_team(
                request.headers.get('league_id'),
                request.headers.get('user_id'),
                json.loads(request.data).get('goalkeepers'), 
                json.loads(request.data).get('defenders'), 
                json.loads(request.data).get('midfielders'), 
                json.loads(request.data).get('forwards'),
                json.loads(request.data).get('subs'))
            db_client.close()
        except Exception as e:
            return json.dumps(f"Error saving team: {e}")
        return json.dumps("success")

@app.route('/gameweeks', methods=['GET','POST'])
def gameweeks():
    if request.method == 'GET':
        print('here')
        try:
            db_client = DatabaseClient()
            gameweek_number = request.headers.get('gameweek_number')
            if gameweek_number != 'current':
                gameweek = db_client.get_gameweek(Season.ID, gameweek_number)
            else:
                gameweek = db_client.get_current_gameweek()
            db_client.close()
            return json.dumps(gameweek)
        except Exception as e:
            print(e)
            return json.dumps(f"Error getting gameweek: {e}")


@app.route('/gameweek_team', methods=['GET'])
def gameweek_team():
    if request.method == 'GET':
        try: 
            db_client = DatabaseClient()
            gameweek_team = db_client.gameweek_team(request.headers.get('gameweek_id'),
                                                    request.headers.get('team_id'))
            db_client.close()
            return json.dumps(gameweek_team)
        except Exception as e:
            return json.dumps(f"Error getting gameweek team: {e}")

@app.route('/gameweek_stats', methods=['GET'])
def gameweek_stats():
    if request.method == 'GET':
        try: 
            db_client = DatabaseClient()
            gameweek_stats = db_client.get_gameweek_stats(request.headers.get('gameweek_id'))
            db_client.close()
            return json.dumps(gameweek_stats)
        except Exception as e:
            print(e)
            return json.dumps(f"Error getting gameweek team: {e}")
        




if __name__ == '__main__':
   app.run(debug = True)