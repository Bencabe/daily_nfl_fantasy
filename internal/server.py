from flask import Flask, request
from flask_cors import CORS
import sys
from database.database_client import DatabaseClient
import json

db_client = DatabaseClient()

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/get_user', methods=['GET','POST'])
def get_user():
    user = db_client.get_user(request.headers.get('email'))
    result = json.dumps(user)
    print(result)

    return result

@app.route('/add_user/<email>/<password>/<first_name>/<last_name>')
def add_user(email,password,first_name,last_name):
    # TODO clean up error handling and strings
    try:
        db_client.add_user(email,password,first_name,last_name)
        return "User added successfully"
    except Exception as e: 
        return f"Error adding contact: {e}"

@app.route('/get_players_per_position/<position>')
def get_players_per_position(position):
    # TODO clean up error handling and strings
    try:
        players = db_client.get_players_per_position(position)
        result = json.dumps(players)
        return result
    except Exception as e: 
        return f"Error getting players: {e}"

@app.route('/get_user', methods=['GET','POST'])
def user_leagues(user):
    if request.method == 'GET':
        # TODO clean up error handling and strings
        try:
            user_leagues = db_client.get_user_leagues(user)
            result = json.dumps(user_leagues)
            return result
        except Exception as e: 
            return f"Error getting players: {e}"



if __name__ == '__main__':
   app.run(debug = True)