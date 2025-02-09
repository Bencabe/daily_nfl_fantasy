
from database.database_client import DatabaseClient
from constants import Season
from models.db_models import GameweekPlayerStats, Player, PlayerStats
from models.football_models import BaseStat, GoalkeepStats, DefenderStats, MidfielderStats, ForwardStats, PlayerScores, PlayerStatTypes, SeasonPlayerStats, TeamPlayerStat, TeamStats


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
    
    def _get_gameweek_fixture_scores(self, player: Player, player_stats: list[GameweekPlayerStats]) -> dict[int, TeamPlayerStat]:
        fixture_scores: dict[int, TeamPlayerStat] = {}
        for gameweek_stat in player_stats:
            fixture_scores[gameweek_stat.fixture_id] = self._get_fixture_score(player, gameweek_stat)
        return fixture_scores

    def _get_fixture_score(self, player: Player, stats: GameweekPlayerStats) -> TeamPlayerStat:
        team_stats = TeamStats(
            total_passes=stats.total_passes or 0,
            tackles=stats.tackles or 0,
            pass_accuracy=stats.pass_accuracy or 0,
            interceptions=stats.interceptions or 0,
            goals_conceded=stats.goals_conceded or 0,
            goals=stats.goals or 0,
            assists=stats.assists or 0,
            key_passes=stats.key_passes or 0,
            dispossesed=stats.dispossesed or 0,
        )
        match player.position_id:
            case 1:
                player_stats = self._get_goalkeeper_score(stats)
            case 2:
                player_stats = self._get_defender_score(stats)
            case 3:
                player_stats = self._get_midfielder_score(stats)
            case 4:
                player_stats = self._get_forward_score(stats)
            case _:
                raise Exception("Invalid player position")
            
        return TeamPlayerStat(team_stats=team_stats, player_stats=player_stats)
    
    def _stat_generator(self, stat: int | float | None, modifier: float) -> BaseStat:
        if not stat:
            return BaseStat(value=0, points=0)
        return BaseStat(value=stat, points=int(stat * modifier))

    def _minutes_stat_generator(self, stat: int | float | None) -> BaseStat:
        if not stat or stat < 1:
            return BaseStat(value=0, points=0)
        return BaseStat(value=stat, points=1 if stat < 45 else 2)

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
            goals_conceded=self._stat_generator(stats.goals_conceded, -0.5),
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