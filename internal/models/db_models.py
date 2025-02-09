from dataclasses import dataclass
from enum import StrEnum
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class PositionLimit(BaseModel):
    max: int
    min: int
    total: int

class PositionLimits:
    Goalkeeper = PositionLimit(min=1, max=1, total=2)
    Defender = PositionLimit(min=3, max=5, total=5)
    Midfielder = PositionLimit(min=2, max=5, total=5)
    Forward = PositionLimit(min=1, max=4, total=4)
    Substitues = PositionLimit(min=5, max=5, total=5)


class IncompleteTeam(Exception):
    def __init__(self, message="Team is incomplete"):
        self.message = message
        super().__init__(self.message)

class InvalidSubstitues(Exception):
    def __init__(self, message="Invalid Subs"):
        self.message = message
        super().__init__(self.message)

class TeamTactics(StrEnum):
    Default = "Default"
    Possesion = "Possesion"
    Defensive = "Defensive"
    Offensive = "Offensive"

class LeagueTypes(StrEnum):
    Modern = "modern"

class NewLeague(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    name: str
    password: str
    admin: int| str | None = Field(default=None)
    private: bool = Field(default=True)
    type: LeagueTypes = Field(default=LeagueTypes.Modern)
    player_limit: int | None = Field(default=None, alias="playerLimit")
    draft_started: bool = Field(alias="draftStarted")
    draft_completed: bool = Field(alias="draftCompleted")
    draft_turn: int | None = Field(alias="draftTurn")
    draft_order: list[int] | None = Field(alias="draftOrder")
class League(NewLeague):
    id: int

class Player(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    fantasy_id: int = Field(alias="fantasyId")
    first_name: str = Field(alias="firstName")
    last_name: str = Field(alias="lastName")
    position_id: int = Field(alias="positionId")
    team_id: int = Field(alias="teamId")
    position_category: str = Field(alias="positionCategory")
    cost: float
    display_name: str = Field(alias="displayName")
    image_path: str = Field(alias="imagePath")
    nationality: str

def validate_position_numbers(players: list[int], subs: list[int], limit: PositionLimit) -> bool:
    starting_players = [p for p in players if p not in subs]
    if len(players) != limit.total:
        return False
    if len(starting_players) < limit.min or len(starting_players) > limit.max:
        return False
    return True

class Team(BaseModel):
    goalkeepers: list[int]
    defenders: list[int]
    midfielders: list[int]
    forwards: list[int]
    subs: list[int]
    tactic: TeamTactics = Field(default=TeamTactics.Default)
    def validate(self):
        if len(self.subs) != PositionLimits.Substitues.total:
            raise InvalidSubstitues("Invalid number of subs")  
        if not validate_position_numbers(self.goalkeepers, self.subs, PositionLimits.Goalkeeper):
            raise IncompleteTeam("Invalid number of goalkeepers")
        if not validate_position_numbers(self.defenders, self.subs, PositionLimits.Defender):
            raise IncompleteTeam("Invalid number of defenders")
        if not validate_position_numbers(self.midfielders, self.subs, PositionLimits.Midfielder):
            raise IncompleteTeam("Invalid number of midfielders")
        if not validate_position_numbers(self.forwards, self.subs, PositionLimits.Forward):
            raise IncompleteTeam("Invalid number of forwards")
        if (
            len(self.goalkeepers) +
            len(self.defenders) +
            len(self.midfielders) +
            len(self.forwards) -
            len(self.subs) != 11
        ):
            raise IncompleteTeam("Invalid number of starting players")     


class LeagueTeam(Team):
    model_config = ConfigDict(populate_by_name=True)
    team_id: int = Field(alias="teamId")
    league_id: int = Field(alias="leagueId") 
    user_id: int = Field(alias="userId")
    team_name: str = Field(alias="teamName")

class LeagueTeamExtended(LeagueTeam):
    model_config = ConfigDict(populate_by_name=True)
    user_first_name: str = Field(alias="userFirstName")
    user_last_name: str = Field(alias="userLastName")

class GameweekTeam(Team):
    model_config = ConfigDict(populate_by_name=True)
    team_id: int = Field(alias="teamId")
    gameweek_id: int = Field(alias="gameweekId")
    season_id: int = Field(alias="seasonId")
        

class Gameweek(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int 
    number: int  
    season_id: int = Field(alias="seasonId")
    start_date:  datetime = Field(alias="startDate")
    end_date:  datetime = Field(alias="endDate")    
    current: bool 
    stage_id: int = Field(alias="stageId") 

class LeagueFixture(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    user_1: int = Field(alias="user1")
    user_2: int = Field(alias="user2")
    gameweek_id: int = Field(alias="gameweekId")
    league_id: int = Field(alias="leagueId")

class PlayerStats(BaseModel):
    minutes: int | None = Field(default=0)
    appearances: int | None = Field(default=0)
    lineups: int | None = Field(default=0)
    substitute_in: int | None = Field(default=0, alias="substituteIn")
    substitute_out: int | None = Field(default=0, alias="substituteOut")
    goals: int | None = Field(default=0)
    owngoals: int | None = Field(default=0)
    assists: int | None = Field(default=0)
    saves: int | None = Field(default=0)
    inside_box_saves: int | None = Field(default=0, alias="insideBoxSaves")
    dispossesed: int | None = Field(default=0)
    interceptions: int | None = Field(default=0)
    yellowcards: int | None = Field(default=0)
    yellowred: int | None = Field(default=0)
    redcards: int | None = Field(default=0)
    tackles: int | None = Field(default=0)
    blocks: int | None = Field(default=0)
    hit_post: int | None = Field(default=0, alias="hitPost")
    cleansheets: int | None = Field(default=0)
    rating: float | None = Field(default=0.0)
    fouls_comitted: int | None = Field(default=0, alias="foulsComitted")
    fouls_drawn: int | None = Field(default=0, alias="foulsDrawn")
    total_crosses: int | None = Field(default=0, alias="totalCrosses")
    accurate_crosses: int | None = Field(default=0, alias="accurateCrosses")
    dribble_attempts: int | None = Field(default=0, alias="dribbleAttempts")
    dribble_success: int | None = Field(default=0, alias="dribbleSuccess")
    dribble_past: int | None = Field(default=0, alias="dribblePast")
    duels_total: int | None = Field(default=0, alias="duelsTotal")
    duels_won: int | None = Field(default=0, alias="duelsWon")
    total_passes: int | None = Field(default=0, alias="totalPasses")
    pass_accuracy: float | None = Field(default=0.0, alias="passAccuracy")
    key_passes: int | None = Field(default=0, alias="keyPasses")
    penalties_won: int | None = Field(default=0, alias="penaltiesWon")
    penalties_scored: int | None = Field(default=0, alias="penaltiesScored")
    penalties_missed: int | None = Field(default=0, alias="penaltiesMissed")
    penalties_committed: int | None = Field(default=0, alias="penaltiesCommitted")
    penalties_saved: int | None = Field(default=0, alias="penaltiesSaved")
    shots_total: int | None = Field(default=0, alias="shotsTotal")
    shots_on_target: int | None = Field(default=0, alias="shotsOnTarget")
    shots_off_target: int | None = Field(default=0, alias="shotsOffTarget")
    aerials_won: int | None = Field(default=0, alias="aerialsWon")
    goals_conceded: int | None = Field(default=0, alias="goalsConceded")
    @classmethod
    def aggregate_stats(cls, stats: list['PlayerStats']) -> 'PlayerStats':
        if not stats:
            return cls()

        aggregated = cls()
        averaged_fields = {'rating', 'pass_accuracy'}

        for field in cls.model_fields:
            if field in averaged_fields:
                value = int(sum(getattr(stat, field) or 0 for stat in stats) / len(stats))
            else:
                value = sum(getattr(stat, field) or 0 for stat in stats)
            setattr(aggregated, field, value)

        return aggregated


class GameweekPlayerStats(PlayerStats):
    model_config = ConfigDict(populate_by_name=True)
    player_id: int = Field(alias="playerId")
    fixture_id: int = Field(alias="fixtureId")
    league_id: int = Field(alias="leagueId") 
    season_id: int = Field(alias="seasonId")

class FootballTeam(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    name: str
    short_code: str = Field(alias="shortCode")
    logo_path: str = Field(alias="logoPath")
    venue_id: int = Field(alias="venueId")
    legacy_id: int = Field(alias="legacyId")
    league_id: int = Field(alias="leagueId")

    @classmethod
    def create_empty_stats(cls, player_id: int, league_id: int, season_id: int):
        return cls(
            player_id=player_id,
            fixture_id=0,
            league_id=league_id,
            season_id=season_id,
            minutes=0,
            appearances=0,
            lineups=0,
            substitute_in=0,
            substitute_out=0,
            goals=0,
            owngoals=0,
            assists=0,
            saves=0,
            inside_box_saves=0,
            dispossesed=0,
            interceptions=0,
            yellowcards=0,
            yellowred=0,
            redcards=0,
            tackles=0,
            blocks=0,
            hit_post=0,
            cleansheets=0,
            rating=0.0,
            fouls_comitted=0,
            fouls_drawn=0,
            total_crosses=0,
            accurate_crosses=0,
            dribble_attempts=0,
            dribble_success=0,
            dribble_past=0,
            duels_total=0,
            duels_won=0,
            total_passes=0,
            pass_accuracy=0.0,
            key_passes=0,
            penalties_won=0,
            penalties_scored=0,
            penalties_missed=0,
            penalties_committed=0,
            penalties_saved=0,
            shots_total=0,
            shots_on_target=0,
            shots_off_target=0,
            aerials_won=0,
            goals_conceded=0
        )

    @classmethod
    def aggregate_stats(cls, stats: list['GameweekPlayerStats'], player_id: int, league_id: int, season_id: int):
        aggregated = cls.create_empty_stats(player_id, league_id, season_id)
        
        for field in aggregated.model_fields:
            if field not in ['player_id', 'fixture_id', 'league_id', 'season_id']:
                setattr(aggregated, field, sum(getattr(stat, field) or 0 for stat in stats))

        # Handle special cases like averages
        if stats:
            aggregated.rating = sum(stat.rating or 0 for stat in stats) / len(stats)
            aggregated.pass_accuracy = sum(stat.pass_accuracy or 0 for stat in stats) / len(stats)

        return aggregated

class Fixture(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    season_id: int = Field(alias="seasonId")
    league_id: int = Field(alias="leagueId")
    stage_id: int = Field(alias="stageId")
    round_id: int = Field(alias="roundId")
    venue_id: int = Field(alias="venueId")
    localteam_id: int = Field(alias="localteamId")
    visitorteam_id: int = Field(alias="visitorteamId")
    winner_team_id: int | None = Field(alias="winnerTeamId")
    localteam_score: int = Field(alias="localteamScore")
    visitorteam_score: int = Field(alias="visitorteamScore")
    start_time: datetime = Field(alias="startTime")


    

