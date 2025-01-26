
from fastapi import Depends
from database.database_client import DatabaseClient
from models.football_models import GameweekStats, PlayerScores, TeamStats, TeamTactics
from services.player_management import PlayerManagementService
from models.db_models import GameweekPlayerStats, GameweekTeam, InvalidSubstitues, LeagueTeam


class TeamManagementService:
    def __init__(self, db_client: DatabaseClient, player_service: PlayerManagementService):
        self.db_client = db_client
        self.player_service = player_service

    def update_team(self, team: LeagueTeam):
        team.validate()
        self.db_client.update_team(
            team.league_id,
            team.user_id,
            team.goalkeepers,
            team.defenders,
            team.midfielders,
            team.forwards,
            team.subs,
            team.tactic
        )
    
        

    def get_team(self, user_id, league_id) -> LeagueTeam:
        team = self.db_client.get_league_team(user_id, league_id)
        try:
            team.validate()
        except InvalidSubstitues:
            team.subs = [
                team.goalkeepers[0],
                team.defenders[0],
                team.midfielders[0],
                team.forwards[0],
            ]
            self.db_client.update_team(
                league_id,
                user_id,
                team.goalkeepers,
                team.defenders,
                team.midfielders,
                team.forwards,
                team.subs,
            )
        return team
    
    def _get_empty_stats(self) -> GameweekStats:
        return GameweekStats(
            player_scores=[],
            team_stats=TeamStats(
                total_passes=0,
                tackles=0,
                pass_accuracy=0,
                interceptions=0,
                goals_conceded=0,
                goals=0,
                assists=0,
                key_passes=0,
                dispossesed=0
            ),
            gameweek_id=0,
            total_player_points=0,
            total_team_points=0,
            team_tactic=TeamTactics.Default,
            subs=[],
            team_id=0,
            team_name="",
        )

    
    def get_gameweek_stats(self, league_id: int, user_id: int, gameweek_id: int, cur_gameweek: bool) -> GameweekStats:
        team = self.get_team(user_id, league_id)
        team_name = team.team_name
        if not cur_gameweek:
            team = self.db_client.get_gameweek_team_model(gameweek_id, team.team_id)
        if not team:
            return self._get_empty_stats()
        gameweek_stats = self.db_client.get_gameweek_stats_model(gameweek_id)
        players = self.db_client.get_all_players()
        team_player_ids = team.goalkeepers + team.defenders + team.midfielders + team.forwards
        team_players = [player for player in players if player.id in team_player_ids]
        gameweek_player_stats = self.player_service.get_player_gameweek_scores(team_players, gameweek_stats)
        team_stats = self._get_team_stats(gameweek_stats, team)
        return GameweekStats(
            player_scores=gameweek_player_stats,
            team_stats=team_stats,
            gameweek_id=gameweek_id,
            total_player_points=self._calculate_total_gameweek_points(gameweek_player_stats, team),
            total_team_points=team_stats.get_team_points(team.tactic),
            subs=team.subs,
            team_tactic=team.tactic,
            team_id=team.team_id,
            team_name=team_name,
        )
    
    def _calculate_total_gameweek_points(self, gameweek_player_stats: list[PlayerScores], team: LeagueTeam | GameweekTeam):
        return sum(
            fixture_score.player_stats.total_score
            for player_stats in gameweek_player_stats if player_stats.player.id not in team.subs
            for fixture_score in player_stats.fixture_stats.values()
        )
    
    def _get_team_stats(self, gameweek_stats: list[GameweekPlayerStats], team: GameweekTeam | LeagueTeam) -> TeamStats:
        team_stats = self._get_empty_stats().team_stats
        player_count = 0
        team_players = team.goalkeepers + team.defenders + team.midfielders + team.forwards
        for player_stats in gameweek_stats:
                if (
                   player_stats.player_id in team_players
                   and player_stats.player_id not in team.subs 
                   and player_stats.minutes 
                   and player_stats.minutes > 0
                ):
                    player_count += 1
                    team_stats.goals += player_stats.goals
                    team_stats.assists += player_stats.assists
                    team_stats.goals_conceded += player_stats.goals_conceded
                    team_stats.tackles += player_stats.tackles
                    team_stats.interceptions += player_stats.interceptions
                    team_stats.total_passes += player_stats.total_passes
                    team_stats.pass_accuracy += player_stats.pass_accuracy
                    team_stats.key_passes += player_stats.key_passes
                    team_stats.dispossesed += player_stats.dispossesed
        team_stats.pass_accuracy = (
            0 
            if not team_stats.pass_accuracy or not player_count 
            else team_stats.pass_accuracy / player_count
        )
        return team_stats

    @classmethod
    def get_instance(cls, db_client: DatabaseClient = Depends(DatabaseClient)) -> "TeamManagementService":
        player_management_service = PlayerManagementService.get_instance()
        return cls(db_client, player_management_service)


    





