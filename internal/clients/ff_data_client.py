import requests
import os

class FantasyDataClient():
    def __init__(self):
        self.api_key = os.environ.get('FOOTBALLPRO_API_KEY')
        self.base_url = 'https://football-pro.p.rapidapi.com/api/v2.0'
        self.default_querystring = {"tz":"Europe/London"}
        self.default_headers = {
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": "football-pro.p.rapidapi.com"
        }
    
    def get_teams_per_league(self, league_id):
        url = f"{self.base_url}/teams/season/{str(league_id)}"
        response = requests.request("GET", url, headers=self.default_headers, params=self.default_querystring)
        return response.json()
            
    def get_team_players(self, team_id, season_id):
        url = f'{self.base_url}/squad/season/{season_id}/team/{team_id}?include=player'
        response = requests.request("GET", url, headers=self.default_headers, params=self.default_querystring)
        return response.json()
    
    def get_gameweeks(self, season_id):
        url = f"{self.base_url}/rounds/season/{season_id}"
        response = requests.request("GET", url, headers=self.default_headers, params=self.default_querystring)
        return response.json()
    
    def get_fixtures_between_dates(self, league_id, start, end):
        url = f"{self.base_url}/fixtures/between/{start}/{end}"
        querystring = {"leagues":league_id,"markets":"1","tz":"Europe/London","include":"localTeam,visitorTeam,season"}
        response = requests.request("GET", url, headers=self.default_headers, params=querystring)
        return response.json()

    def get_season_fixtures(self, season_id):
        url = f"{self.base_url}/seasons/{season_id}"
        querystring = {"tz":"Europe/London", "include":"fixtures,rounds"}
        response = requests.request("GET", url, headers=self.default_headers, params=querystring)
        return response.json()
    
    def get_player_stats_by_fixture(self, fixture_id):
        querystring = {"include":"lineup.player, events, sidelined, bench, substitutions","tz":"Europe/London"}
        url = f"{self.base_url}/fixtures/{fixture_id}"
        response = requests.request("GET", url, headers=self.default_headers, params=querystring)
        return response.json()
    
    def get_live_fixtures(self):
        url = f"{self.base_url}/livescores/now"
        querystring = {"leagues":"8","bookmakers":"2","timezone":"Europe/Amsterdam","market":"1","include":"localTeam,visitorTeam,events"}
        response = requests.request("GET", url, headers=self.default_headers, params=querystring)
        return response.json()