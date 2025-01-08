from enum import StrEnum
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class IncompleteTeam(Exception):
    def __init__(self, message="Team is incomplete"):
        self.message = message
        super().__init__(self.message)

class InvalidSubstitues(Exception):
    def __init__(self, message="Invalid Subs"):
        self.message = message
        super().__init__(self.message)
class League(BaseModel):
    id: int
    name: str
    password: str
    admin: str
    private: bool
    type: str
    player_limit: int | None = Field(default=None)
    draft_started: bool 
    draft_completed: bool
    draft_turn: int | None
    draft_order: list[int] | None

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

class TeamTactics(StrEnum):
    Default = "Default"
    Possesion = "Possesion"
    Defensive = "Defensive"
    Offensive = "Offensive"
class Team(BaseModel):
    goalkeepers: list[int]
    defenders: list[int]
    midfielders: list[int]
    forwards: list[int]
    subs: list[int]
    tactic: TeamTactics = Field(default=TeamTactics.Default)
    def validate(self):
        if len(self.goalkeepers) != 2:
            raise IncompleteTeam("Invalid number of goalkeepers")
        if len(self.defenders) != 5:
            raise IncompleteTeam("Invalid number of defenders")
        if len(self.midfielders) != 5:
            raise IncompleteTeam("Invalid number of midfielders")
        if len(self.forwards) != 3:
            raise IncompleteTeam("Invalid number of forwards")
        if len(self.subs) != 4:
            raise InvalidSubstitues("Invalid number of subs")       
        gk_in_subs = sum(1 for player_id in self.subs if player_id in self.goalkeepers)
        if gk_in_subs != 1:
            raise InvalidSubstitues("Must have exactly 1 goalkeeper in subs")
        def_in_subs = sum(1 for player_id in self.subs if player_id in self.defenders)
        if def_in_subs > 2:
            raise InvalidSubstitues("Cannot have more than 2 defenders in subs")


class LeagueTeam(Team):
    model_config = ConfigDict(populate_by_name=True)
    team_id: int = Field(alias="teamId")
    league_id: int = Field(alias="leagueId") 
    user_id: int = Field(alias="userId")
    team_name: str = Field(alias="teamName")

class GameweekTeam(Team):
    model_config = ConfigDict(populate_by_name=True)
    team_id: int = Field(alias="teamId")
    gameweek_id: int = Field(alias="gameweekId")
    season_id: int = Field(alias="seasonId")
        

class Gameweek(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int 
    number: int  
    season_id: int
    start_date:  datetime
    end_date:  datetime
    current: bool 
    stage_id: int

class LeagueFixture(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    user_id_1: int = Field(alias="userId1")
    user_id_2: int = Field(alias="userId2")
    gameweek_id: int = Field(alias="gameweekId")
    league_id: int = Field(alias="leagueId")

class GameweekPlayerStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    fixture_id: int = Field(alias="fixtureId")
    player_id: int = Field(alias="playerId")
    league_id: int = Field(alias="leagueId") 
    season_id: int = Field(alias="seasonId")
    minutes: int | None = Field(default=None)
    appearences: int | None = Field(default=None)
    lineups: int | None = Field(default=None)
    substitute_in: int | None = Field(default=None, alias="substituteIn")
    substitute_out: int | None = Field(default=None, alias="substituteOut")
    goals: int | None = Field(default=None)
    owngoals: int | None = Field(default=None)
    assists: int | None = Field(default=None)
    saves: int | None = Field(default=None)
    inside_box_saves: int | None = Field(default=None, alias="insideBoxSaves")
    dispossesed: int | None = Field(default=None)
    interceptions: int | None = Field(default=None)
    yellowcards: int | None = Field(default=None)
    yellowred: int | None = Field(default=None)
    redcards: int | None = Field(default=None)
    tackles: int | None = Field(default=None)
    blocks: int | None = Field(default=None)
    hit_post: int | None = Field(default=None, alias="hitPost")
    cleansheets: int | None = Field(default=None)
    rating: float | None = Field(default=None)
    fouls_comitted: int | None = Field(default=None, alias="foulsComitted")
    fouls_drawn: int | None = Field(default=None, alias="foulsDrawn")
    total_crosses: int | None = Field(default=None, alias="totalCrosses")
    accurate_crosses: int | None = Field(default=None, alias="accurateCrosses")
    dribble_attempts: int | None = Field(default=None, alias="dribbleAttempts")
    dribble_success: int | None = Field(default=None, alias="dribbleSuccess")
    dribble_past: int | None = Field(default=None, alias="dribblePast")
    duels_total: int | None = Field(default=None, alias="duelsTotal")
    duels_won: int | None = Field(default=None, alias="duelsWon")
    total_passes: int | None = Field(default=None, alias="totalPasses")
    pass_accuracy: float | None = Field(default=None, alias="passAccuracy")
    key_passes: int | None = Field(default=None, alias="keyPasses")
    penalties_won: int | None = Field(default=None, alias="penaltiesWon")
    penalties_scored: int | None = Field(default=None, alias="penaltiesScored")
    penalties_missed: int | None = Field(default=None, alias="penaltiesMissed")
    penalties_committed: int | None = Field(default=None, alias="penaltiesCommitted")
    penalties_saved: int | None = Field(default=None, alias="penaltiesSaved")
    shots_total: int | None = Field(default=None, alias="shotsTotal")
    shots_on_target: int | None = Field(default=None, alias="shotsOnTarget")
    shots_off_target: int | None = Field(default=None, alias="shotsOffTarget")
    aerials_won: int | None = Field(default=None, alias="aerialsWon")
    goals_conceded: int | None = Field(default=None, alias="goalsConceded")
