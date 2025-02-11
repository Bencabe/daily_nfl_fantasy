from constants import DatabaseCreds
import mysql.connector
import json
import pandas as pd
from models.db_models import Fixture, FootballTeam, Gameweek, GameweekPlayerStats, GameweekTeam, League, LeagueTeamExtended, Player, LeagueTeam, LeagueFixture, TeamTactics
from models.auth_models import PublicUser, User

class DatabaseClient:
    def __init__(self):
        self.con = mysql.connector.connect(user=DatabaseCreds.USER, 
                                        password=DatabaseCreds.PASSWORD,
                                        host=DatabaseCreds.HOST,
                                        database=DatabaseCreds.DB_NAME)
        self.con.autocommit = True
    
    def _create_league_team(self, league_team: dict[str, any]):
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
            tactic=league_team['tactic']
        )

        

    def get_user(self,email):
        query = ("SELECT * FROM users WHERE email = '{}'".format(email))
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        cursor.close()
        return vals


    def get_user_model(self, email) -> User:
        query = ("SELECT * FROM users WHERE email = %s")
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query, (email,))
        user_data = cursor.fetchone()
        cursor.close()
        return User.model_validate(user_data)
    
    def get_user_by_id(self, id) -> User:
        query = ("SELECT * FROM users WHERE id = %s")
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query, (id,))
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
            password=league['password'],
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
    


    def create_league(self, league_name, league_password, league_admin, player_limit, league_type, private_league) -> int:
        # creates a new league and returns the id of the league
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
        # Get the ID of the newly inserted row
        league_id = cursor.lastrowid 
        self.con.commit()
        cursor.close()
        return league_id

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
        return self._create_league_team(league_team)

    def update_team(
            self, 
            league_id: int, 
            user_id: int, 
            goalkeepers: list[int], 
            defenders: list[int], 
            midfielders: list[int], 
            forwards: list[int], 
            subs: list[int], 
            tactic: TeamTactics = TeamTactics.Default):
        query = ("UPDATE user_league SET goalkeepers=%s,defenders=%s,midfielders=%s,forwards=%s,subs=%s,tactic=%s WHERE league_id=%s AND user_id=%s")
        values = (str(goalkeepers), str(defenders), str(midfielders), str(forwards), str(subs), tactic, league_id, user_id)
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
    
    def get_league_team_modals(self, league_id) -> list[LeagueTeam]:
        query = ("SELECT * FROM user_league WHERE league_id = '{}'".format(league_id))
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        vals: list[LeagueTeam] = []
        for val in cursor:
            vals.append(self._create_league_team(val))
        cursor.close()
        return vals
    
    def get_extended_league_team(self, league_id: int) -> list[LeagueTeamExtended]:
        query = """
            SELECT user_league.*, users.first_name, users.last_name 
            FROM user_league 
            INNER JOIN users ON users.id = user_league.user_id
            WHERE user_league.league_id = %s
        """
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query, (league_id,))
        teams: list[LeagueTeamExtended] = []
        for team in cursor:
            teams.append(
                LeagueTeamExtended(
                    team_id=team['team_id'],
                    league_id=team['league_id'],
                    user_id=team['user_id'],
                    goalkeepers=json.loads(team['goalkeepers']),
                    defenders=json.loads(team['defenders']),
                    midfielders=json.loads(team['midfielders']),
                    forwards=json.loads(team['forwards']),
                    subs=json.loads(team['subs']),
                    team_name=team['team_name'],
                    tactic=team['tactic'],
                    user_first_name=team['first_name'],
                    user_last_name=team['last_name']
                )
            )
        cursor.close()
        return teams
    
    def get_user_teams(self, user_id: int) -> list[LeagueTeam]:
        query = ("SELECT * FROM user_league WHERE user_id = '{}'".format(user_id))
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        vals: list[LeagueTeam] = []
        for val in cursor:
            vals.append(self._create_league_team(val))
        cursor.close()
        return vals

    def get_league_users(self, league_id) -> list[PublicUser]:
        league_teams = self.get_league_team_modals(league_id)
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
    
    def get_all_gameweeks(self, season_id: int) -> list[Gameweek]:
        query = ("SELECT * FROM gameweeks WHERE season_id=%s")
        values = (season_id,)
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query, values)
        vals: list[Gameweek] = []
        for val in cursor:
            vals.append(Gameweek.model_validate(val))
        cursor.close()
        return vals
    
    def get_gameweek_by_number(self, season_id, gameweek_number) ->  Gameweek:
        query = ("SELECT * FROM gameweeks WHERE season_id=%s AND number=%s")
        values = (season_id, gameweek_number)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        gameweeks: list[Gameweek] = []
        for val in cursor:
            gameweeks.append(Gameweek.model_validate(val))
        cursor.close()
        if len(gameweeks) != 1:
            raise Exception(f"Incorrect number of gameweeks returned: {len(gameweeks)}. Please check database")
        return gameweeks[0]
    
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
    
    def get_gameweek_team_model(self, gameweek_id: int, team_id: int) -> GameweekTeam | None:
        query = ("SELECT * FROM gameweek_teams WHERE gameweek_id=%s AND team_id=%s LIMIT 1")
        values = (gameweek_id, team_id)
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query, values)
        gameweek_team = cursor.fetchone()
        if not gameweek_team:
            return None
        return GameweekTeam(
            gameweek_id=gameweek_team['gameweek_id'],
            season_id=gameweek_team['season_id'],
            team_id=gameweek_team['team_id'],
            goalkeepers=json.loads(gameweek_team['goalkeepers']),
            defenders=json.loads(gameweek_team['defenders']),
            midfielders=json.loads(gameweek_team['midfielders']),
            forwards=json.loads(gameweek_team['forwards']),
            subs=json.loads(gameweek_team['subs']),
            tactic=gameweek_team['tactic']
        )

    def get_gameweek_players(self, gameweek_id):
        query = (f"SELECT * FROM gameweek_players WHERE gameweek_id={gameweek_id}")
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        return vals

    def get_gameweek_player_stats(self, gameweek_id):
        query = (f'SELECT stats.*, fixtures.round_id\
                 FROM daily_ff.gameweek_player_stats as stats\
                 JOIN daily_ff.fixtures as fixtures\
                 ON stats.fixture_id = fixtures.id\
                 WHERE round_id = {gameweek_id}')
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        return vals

    def get_gameweek_stats(self, gameweek_id):
        query = (f'SELECT stats.*, fixtures.round_id\
                 FROM daily_ff.gameweek_player_stats as stats\
                 JOIN daily_ff.fixtures as fixtures\
                 ON stats.fixture_id = fixtures.id\
                 WHERE round_id = {gameweek_id}')
        return json.loads(pd.read_sql(query, self.con).to_json(orient='index'))
    
    def get_season_stats(self, season_id: int) -> list[GameweekPlayerStats]:
        query = (f'SELECT stats.*, fixtures.round_id\
                 FROM daily_ff.gameweek_player_stats as stats\
                 JOIN daily_ff.fixtures as fixtures\
                 ON stats.fixture_id = fixtures.id\
                 WHERE stats.season_id = {season_id}')
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        vals:  list[GameweekPlayerStats] = []
        for val in cursor:
            vals.append(GameweekPlayerStats.model_validate(val))
        return vals

    def get_gameweek_stats_model(self, gameweek_id) -> list[GameweekPlayerStats]:
        player_stat = self.get_gameweek_player_stats(gameweek_id)
        return [GameweekPlayerStats.model_validate(player_stat) for player_stat in player_stat]
    
    def get_fixtures_in_gameweek(self, gameweek_id):
        query = (f"SELECT * FROM fixtures WHERE round_id={gameweek_id}")
        cursor = self.con.cursor()
        cursor.execute(query)
        vals = []
        for val in cursor:
            vals.append(val)
        return vals
    
    def get_gameweek_fixtures_model(self, gameweek_id) -> list[Fixture]:
        query = (f"SELECT * FROM fixtures WHERE round_id={gameweek_id}")
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        fixtures: list[Fixture] = []
        for val in cursor:
            fixtures.append(Fixture.model_validate(val))
        return fixtures

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
    

    def get_all_user_league_teams(self) -> list[LeagueTeam]:
        query = """
            SELECT *
            FROM user_league
            """
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        teams: list[LeagueTeam] = []
        for team in cursor:
            teams.append(
                LeagueTeam(
                    team_id=team['team_id'],
                    league_id=team['league_id'],
                    user_id=team['user_id'],
                    goalkeepers=json.loads(team['goalkeepers']),
                    defenders=json.loads(team['defenders']),
                    midfielders=json.loads(team['midfielders']),
                    forwards=json.loads(team['forwards']),
                    subs=json.loads(team['subs']),
                    team_name=team['team_name'],
                    tactic=team['tactic'],
                )
            )
        return teams
    
    def get_league_fixtures(self, league_id: int) -> list[LeagueFixture]:
        query = (f"SELECT * FROM league_fixtures WHERE league_id={league_id}")
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        vals: list[LeagueFixture] = []
        for val in cursor:
            vals.append(LeagueFixture.model_validate(val))
        return vals
    
    def create_league_fixture(self, user_id_1: int, user_id_2: int, gameweek_id: int, league_id: int):
        query = ("INSERT INTO league_fixtures "
                "(user_1, user_2, gameweek_id, league_id) "
                "VALUES (%s, %s, %s, %s)")
        values = (user_id_1, user_id_2, gameweek_id, league_id)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()
    
    def create_league_fixtures(self, user_fixtures: list[LeagueFixture]):
        for fixture in user_fixtures:
            self.create_league_fixture(
                fixture.user_1, 
                fixture.user_2, 
                fixture.gameweek_id, 
                fixture.league_id
            )
    
    def get_football_teams(self) -> list[LeagueFixture]:
        query = ("SELECT * FROM football_teams")
        cursor = self.con.cursor(dictionary=True)
        cursor.execute(query)
        vals: list[FootballTeam] = []
        for val in cursor:
            vals.append(FootballTeam.model_validate(val))
        return vals

    def update_active_league(self, user_id: int, league_id: int) -> None:
        query = "UPDATE users SET active_league = %s WHERE id = %s"
        values = (league_id, user_id)
        cursor = self.con.cursor()
        cursor.execute(query, values)
        self.con.commit()
        cursor.close()


    def close(self):
        self.con.close()
