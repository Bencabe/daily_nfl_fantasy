from pydantic import BaseModel, ConfigDict, Field

from models.db_models import Player, PlayerStats, TeamTactics


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

PlayerStatTypes = GoalkeepStats | DefenderStats | MidfielderStats | ForwardStats


class SeasonPlayerStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    stats: PlayerStats
    player: Player
    games_played: int = Field(alias="gamesPlayed", default=0)

class TeamStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    total_passes: int = Field(alias="totalPasses")
    tackles: int
    pass_accuracy: float = Field(alias="passAccuracy")
    interceptions: int = Field(alias="interceptions")
    goals_conceded: int = Field(alias="goalsConceded")
    goals: int = Field(alias="goals")
    assists: int = Field(alias="assists")
    key_passes: int = Field(alias="keyPasses")
    dispossesed: int = Field(alias="dispossesed")
    def get_team_points(self, team_tactic: TeamTactics):
        if team_tactic == TeamTactics.Possesion:
            pass_acc_score = 5 if self.pass_accuracy > 80 else 0
            pass_score = 5 if self.total_passes > 350 else -5
            lost_ball_score = 5 if self.dispossesed < 7 else 0
            return pass_acc_score + pass_score + lost_ball_score
        elif team_tactic == TeamTactics.Defensive:
            tackles = 5 if self.tackles > 20 else 0
            interceptions = 5 if self.interceptions > 10 else 0
            goals_conceded = 5 if self.goals_conceded < 10 else -5
            return tackles + interceptions + goals_conceded
        elif team_tactic == TeamTactics.Offensive:
            goals_points = 5 if  self.goals + self.assists > 6 else 0
            key_passes = 5 if self.key_passes > 10 else 0
            goals_diff_points = 5 if self.goals_conceded < (self.goals + self.assists) else -5
            return goals_points + goals_diff_points + key_passes
        else:
            return 0
        
class TeamPlayerStat(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    team_stats: TeamStats = Field(alias="teamStats")
    player_stats: PlayerStatTypes = Field(alias="playerStats")

class PlayerScores(BaseModel):
    """Model containing all info the frontend needs to display player stats for a gameweek"""
    model_config = ConfigDict(populate_by_name=True)
    player: Player
    # key is a fixture id
    fixture_stats: dict[int, TeamPlayerStat] = Field(alias="fixtureStats")



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
