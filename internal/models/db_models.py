from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


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

class UserLeague(BaseModel):
    team_id: int
    league_id: int
    user_id: int 
    goalkeepers: list[int]
    defenders: list[int] 
    midfielders: list[int] 
    forwards: list[int]
    subs: list[int]
    team_name: str

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

class LeagueTeam(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    team_id: int = Field(alias="teamId")
    league_id: int = Field(alias="leagueId") 
    user_id: int = Field(alias="userId")
    team_name: str = Field(alias="teamName")
    goalkeepers: list[int]
    defenders: list[int]
    midfielders: list[int]
    forwards: list[int]
    subs: list[int]

class Gameweek(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int 
    number: int  
    season_id: int
    start_date:  datetime
    end_date:  datetime
    current: bool 
    stage_id: int