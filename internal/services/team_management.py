from enum import StrEnum
from typing import NewType
from fastapi import Depends
from pydantic import BaseModel, ConfigDict, Field
from database.database_client import DatabaseClient
from models.db_models import GameweekPlayerStats, GameweekTeam, InvalidSubstitues, LeagueTeam, Player, TeamTactics

class BaseStat(BaseModel):
    value: int
    points: int


class BasePlayerStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    minutes_played: BaseStat = Field(alias="minutesPlayed")
    red_cards: BaseStat = Field(alias="redCards")
    yellow_cards: BaseStat = Field(alias="yellowCards")
    assists: BaseStat = Field(alias="assists")
    goals: BaseStat = Field(alias="goals")
    penalties_committed: BaseStat = Field(alias="penaltiesCommitted")
    penalties_won: BaseStat = Field(alias="penaltiesWon")
    owngoals: BaseStat = Field(alias="ownGoals")
    total_score: int = Field(default=0, alias="totalScore")

class GoalkeepStats(BasePlayerStats):
    saves: BaseStat = Field(alias="saves")
    penalties_saved: BaseStat = Field(alias="penaltiesSaved")
    clean_sheet: BaseStat = Field(alias="cleanSheet")
    goals_conceded: BaseStat = Field(alias="goalsConceded")

class DefenderStats(BasePlayerStats):
    tackles: BaseStat = Field(alias="tackles")
    interceptions: BaseStat = Field(alias="interceptions")
    blocks: BaseStat = Field(alias="blocks")
    aerials_won: BaseStat = Field(alias="aerialsWon")
    duels_won: BaseStat = Field(alias="duelsWon")
    clean_sheet: BaseStat = Field(alias="cleanSheet")
    goals_conceded: BaseStat = Field(alias="goalsConceded")
    fouls_committed: BaseStat = Field(alias="foulsCommitted")

class MidfielderStats(BasePlayerStats):
    tackles: BaseStat = Field(alias="tackles")
    interceptions: BaseStat = Field(alias="interceptions")
    duels_won: BaseStat = Field(alias="duelsWon")
    key_passes: BaseStat = Field(alias="keyPasses")
    pass_accuracy: BaseStat = Field(alias="passAccuracy")
    dribbles: BaseStat = Field(alias="dribbles")
    fouls_committed: BaseStat = Field(alias="foulsCommitted")
    fouls_won: BaseStat = Field(alias="foulsWon")

class ForwardStats(BasePlayerStats):
    shots_on_target: BaseStat = Field(alias="shotsOnTarget")
    key_passes: BaseStat = Field(alias="keyPasses")
    aerials_won: BaseStat = Field(alias="aerialsWon")

PlayerStats = GoalkeepStats | DefenderStats | MidfielderStats | ForwardStats

class PlayerScores(BaseModel):
    """Model containing all info the frontend needs to display player stats for a gameweek"""
    model_config = ConfigDict(populate_by_name=True)
    player: Player
    # key is a fixture id
    fixture_stats: dict[int, PlayerStats] = Field(alias="fixtureStats")

class TeamStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    total_passes: int = Field(alias="totalPasses")
    tackles: int
    pass_accuracy: float = Field(alias="passAccuracy")
    interceptions: int = Field(alias="interceptions")
    goals_conceded: int = Field(alias="goalsConceded")
    goals: int = Field(alias="goals")
    assists: int = Field(alias="assists")
    def get_team_points(self, team_tactic: TeamTactics):
        if team_tactic == TeamTactics.Possesion:
            pass_acc_score = 15 if self.pass_accuracy > 75 else -10
            pass_score = 30 if self.total_passes > 400 else -20
            return pass_acc_score + pass_score
        elif team_tactic == TeamTactics.Defensive:
            tackles = 15 if self.tackles > 20 else -10
            interceptions = 15 if self.interceptions > 10 else -10
            goals_conceded = 15 if self.goals_conceded < 10 else -10
            return tackles + interceptions + goals_conceded
        elif team_tactic == TeamTactics.Offensive:
            goals_points = 15 if  self.goals > 4 else -10
            assist_ponts = 15 if self.assists > 4 else -10
            goals_diff_points = 10 if self.goals_conceded < (self.goals + self.assists) else -10
            return goals_points + assist_ponts + goals_diff_points
        else:
            return 0



class GameweekStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    player_scores: list[PlayerScores] = Field(alias="playerStats")
    team_stats: TeamStats = Field(alias="teamStats")
    gameweek_id: int = Field(alias="gameweekId")
    total_player_points: int = Field(alias="totalPlayerPoints")
    total_team_points: int = Field(alias="totalTeamPoints")
    team_tactic: TeamTactics = Field(default=TeamTactics.Default, alias="teamTactic")
    subs: list[int]
    team_id: int = Field(alias="teamId")
    team_name: str = Field(alias="teamName")


class TeamManagementService:
    def __init__(self, db_client: DatabaseClient):
        self.db_client = db_client

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

    
    def get_gameweek_stats(self, league_id: int, user_id: int, gameweek_id: int, cur_gameweek: bool) -> GameweekStats:
        team = self.get_team(user_id, league_id)
        team_name = team.team_name
        if not cur_gameweek:
            team = self.db_client.get_gameweek_team_model(gameweek_id, team.team_id)
        gameweek_stats = self.db_client.get_gameweek_stats_model(gameweek_id)
        players = self.db_client.get_all_players()
        players_dict = {player.id: player for player in players}
        team_players = team.goalkeepers + team.defenders + team.midfielders + team.forwards
        gameweek_player_stats: list[PlayerScores] = []
        for player_id in team_players:
            player = players_dict[player_id]
            player_stats = [gameweek_stat for gameweek_stat in gameweek_stats if gameweek_stat.player_id == player_id]
            fixture_scores = self._get_gameweek_fixture_scores(player, player_stats)
            gameweek_player_stats.append(PlayerScores(player=player, fixture_stats=fixture_scores))
        
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
            fixture_score.total_score
            for player_stats in gameweek_player_stats if player_stats.player.id not in team.subs
            for fixture_score in player_stats.fixture_stats.values()
        )

        
    def _get_gameweek_fixture_scores(self, player: Player, player_stats: list[GameweekPlayerStats]) -> dict[int, PlayerStats]:
        fixture_scores: dict[int, PlayerStats] = {}
        for gameweek_stat in player_stats:
            fixture_scores[gameweek_stat.fixture_id] = self._get_fixture_score(player, gameweek_stat)
        return fixture_scores

    def _get_fixture_score(self, player: Player, stats: GameweekPlayerStats):
        match player.position_id:
            case 1:
                return self._get_goalkeeper_score(stats)
            case 2:
                return self._get_defender_score(stats)
            case 3:
                return self._get_midfielder_score(stats)
            case 4:
                return self._get_forward_score(stats)
            case _:
                return 0
        return 0
    
    def _stat_generator(self, stat: int | float | None, modifier: float) -> BaseStat:
        if not stat:
            return BaseStat(value=0, points=0)
        return BaseStat(value=stat, points=int(stat * modifier))

    def _minutes_stat_generator(self, stat: int | float | None) -> BaseStat:
        if not stat or stat < 45:
            return BaseStat(value=0, points=0)
        return BaseStat(value=stat, points=1 if stat < 60 else 2)

    def _calculate_player_score(self, player_stats: PlayerStats):
        total_score = 0

        for _, field_value in player_stats:
            if isinstance(field_value, BaseStat):
                total_score += field_value.points
        
        return total_score

    def _calulate_clean_sheet_score(self, stats: GameweekPlayerStats):
        return 1 if stats.goals_conceded == 0 and stats.minutes and stats.minutes >= 45 else 0
    
    def _get_goalkeeper_score(self, stats: GameweekPlayerStats):
        clean_sheet = self._calulate_clean_sheet_score(stats)
        player = GoalkeepStats(
            goals=self._stat_generator(stats.goals, 6),
            assists=self._stat_generator(stats.assists, 4), 
            minutes_played=self._minutes_stat_generator(stats.minutes),
            red_cards=self._stat_generator(stats.redcards, -3),
            yellow_cards=self._stat_generator(stats.yellowcards, -1),
            clean_sheet=self._stat_generator(clean_sheet, 4),
            goals_conceded=self._stat_generator(stats.goals_conceded, -1),
            saves=self._stat_generator(stats.saves, 0.5),
            penalties_saved=self._stat_generator(stats.penalties_saved, 5),
            penalties_committed=self._stat_generator(stats.penalties_committed, -2),
            penalties_won=self._stat_generator(stats.penalties_won, 2),
            owngoals=self._stat_generator(stats.owngoals, -4)
        )
        player.total_score = self._calculate_player_score(player)
        return player

    
    def _get_defender_score(self, stats: GameweekPlayerStats):
        clean_sheet = self._calulate_clean_sheet_score(stats)
        player = DefenderStats(
            goals=self._stat_generator(stats.goals, 6),
            assists=self._stat_generator(stats.assists, 4),
            minutes_played=self._minutes_stat_generator(stats.minutes),
            red_cards=self._stat_generator(stats.redcards, -3),
            yellow_cards=self._stat_generator(stats.yellowcards, -1),
            clean_sheet=self._stat_generator(clean_sheet, 4),
            goals_conceded=self._stat_generator(stats.goals_conceded, -0.5),
            tackles=self._stat_generator(stats.tackles, 0.25),
            blocks=self._stat_generator(stats.blocks, 0.25),
            interceptions=self._stat_generator(stats.interceptions, 0.25),
            aerials_won=self._stat_generator(stats.aerials_won, 0.25),
            duels_won=self._stat_generator(stats.duels_won, 0.25),
            penalties_won=self._stat_generator(stats.penalties_won, 2),
            penalties_committed=self._stat_generator(stats.penalties_committed, -2),
            owngoals=self._stat_generator(stats.owngoals, -4),
            fouls_committed=self._stat_generator(stats.fouls_comitted, -0.1)
        )
        player.total_score = self._calculate_player_score(player)
        return player

    def _get_midfielder_score(self, stats: GameweekPlayerStats):
        pass_accuracy = stats.pass_accuracy if stats.pass_accuracy else 0
        player = MidfielderStats(
            goals=self._stat_generator(stats.goals, 5),
            assists=self._stat_generator(stats.assists, 4),
            minutes_played=self._minutes_stat_generator(stats.minutes),
            red_cards=self._stat_generator(stats.redcards, -3),
            yellow_cards=self._stat_generator(stats.yellowcards, -1),
            tackles=self._stat_generator(stats.tackles, 0.25),
            interceptions=self._stat_generator(stats.interceptions, 0.25),
            duels_won=self._stat_generator(stats.duels_won, 0.25),
            key_passes=self._stat_generator(stats.key_passes, 0.5),
            pass_accuracy=BaseStat(value=pass_accuracy, points=1 if pass_accuracy > 75 else 0),
            penalties_won=self._stat_generator(stats.penalties_won, 2),
            penalties_committed=self._stat_generator(stats.penalties_committed, -3),
            owngoals=self._stat_generator(stats.owngoals, -4),
            fouls_committed=self._stat_generator(stats.fouls_comitted, -0.1),
            dribbles=self._stat_generator(stats.dribble_success, 0.25),
            fouls_won=self._stat_generator(stats.fouls_drawn, 0.25)
        )
        player.total_score = self._calculate_player_score(player)
        return player

    def _get_forward_score(self, stats: GameweekPlayerStats):
        player = ForwardStats(
            goals=self._stat_generator(stats.goals, 4),
            assists=self._stat_generator(stats.assists, 4),
            minutes_played=self._minutes_stat_generator(stats.minutes),
            red_cards=self._stat_generator(stats.redcards, -3),
            yellow_cards=self._stat_generator(stats.yellowcards, -1),
            shots_on_target=self._stat_generator(stats.shots_on_target, 0.5),
            penalties_won=self._stat_generator(stats.penalties_won, 3),
            penalties_committed=self._stat_generator(stats.penalties_committed, -2),
            owngoals=self._stat_generator(stats.owngoals, -4),
            key_passes=self._stat_generator(stats.key_passes, 0.5),
            aerials_won=self._stat_generator(stats.aerials_won, 0.25)
        )
        player.total_score = self._calculate_player_score(player)
        return player
    
    def _get_team_stats(self, gameweek_stats: list[GameweekPlayerStats], team: GameweekTeam | LeagueTeam) -> TeamStats:
        team_stats = TeamStats(
                    goals=0,
                    assists=0,
                    goals_conceded=0,
                    tackles=0,
                    interceptions=0,
                    total_passes=0,
                    pass_accuracy=0,
                )
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
        team_stats.pass_accuracy /= player_count
        return team_stats

    @classmethod
    def get_instance(cls, db_client: DatabaseClient = Depends(DatabaseClient)) -> "TeamManagementService":
        return cls(db_client)


    





