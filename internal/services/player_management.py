from pydantic import BaseModel, ConfigDict, Field
from database.database_client import DatabaseClient
from constants import Season
from models.db_models import GameweekPlayerStats, Player, PlayerStats

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

class PlayerScores(BaseModel):
    """Model containing all info the frontend needs to display player stats for a gameweek"""
    model_config = ConfigDict(populate_by_name=True)
    player: Player
    # key is a fixture id
    fixture_stats: dict[int, PlayerStatTypes] = Field(alias="fixtureStats")

class SeasonPlayerStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    stats: PlayerStats
    player: Player
    games_played: int = Field(alias="gamesPlayed", default=0)


class PlayerManagementService:
    def __init__(self, db_client: DatabaseClient):
        self.db_client = db_client
    
    def get_season_player_stats(self) -> list[SeasonPlayerStats]:
        players = self.db_client.get_all_players()
        season_stats = self.db_client.get_season_stats(Season.ID)
        season_player_stats: list[SeasonPlayerStats] = []
        
        player_stats_map: dict[int, list[GameweekPlayerStats]] = {}
        for stat in season_stats:
            if stat.player_id not in player_stats_map:
                player_stats_map[stat.player_id] = []
            player_stats_map[stat.player_id].append(stat)
        
        for player_id, stats in player_stats_map.items():
            player = next((p for p in players if p.id == player_id), None)
            if not player:
                continue
            games_played = sum(1 for stat in stats if stat.minutes and stat.minutes > 1)
            aggregated_stats = PlayerStats.aggregate_stats(stats)
            
            season_player_stats.append(
                SeasonPlayerStats(
                    stats=aggregated_stats,
                    player=player,
                    games_played=games_played
                )
            )
        
        return season_player_stats








    def get_player_gameweek_scores(self, players: list[Player], gameweek_stats: list[GameweekPlayerStats]) -> list[PlayerScores]:
        gameweek_player_stats: list[PlayerScores] = []
        for player in players:
            player_stats = [gameweek_stat for gameweek_stat in gameweek_stats if gameweek_stat.player_id == player.id]
            fixture_scores = self._get_gameweek_fixture_scores(player, player_stats)
            gameweek_player_stats.append(PlayerScores(player=player, fixture_stats=fixture_scores))
        
        return gameweek_player_stats
    
    def _get_gameweek_fixture_scores(self, player: Player, player_stats: list[GameweekPlayerStats]) -> dict[int, PlayerStatTypes]:
        fixture_scores: dict[int, PlayerStatTypes] = {}
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

    def _calculate_player_score(self, player_stats: PlayerStatTypes):
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
    
    @classmethod
    def get_instance(cls) -> "PlayerManagementService":
        db_client = DatabaseClient()
        return cls(db_client)