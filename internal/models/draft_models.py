from enum import StrEnum
from pydantic import BaseModel, Field, ConfigDict, RootModel
from typing import Literal, Union, Annotated

from models.db_models import LeagueTeam, Player
from models.auth_models import PublicUser

class Positions(StrEnum):
    Goalkeeper = "Goalkeeper"
    Defender = "Defender"
    Midfielder = "Midfielder"
    Forward = "Forward"

class BasicDraftMessage(BaseModel):
    model_config = ConfigDict(
        alias_generator=lambda field_name: "messageType" if field_name == "message_type" else field_name,
        populate_by_name=True
    )
    message_type: Literal["basicDraftMessage"]
class TimeExpired(BasicDraftMessage):
    message_type: Literal["timeExpired"]

class TurnChange(BasicDraftMessage):
    message_type: Literal["turnChange"] = "turnChange"
    next_user_id: int | None = Field(default=None, alias="nextUserId")
    league_teams: dict[int, LeagueTeam] = Field(default={}, alias="leagueTeams")

class PlayerConnect(BasicDraftMessage):
    message_type: Literal["playerConnect"]
    # TODO this actually represents a user, oops
    player_id: int | None = Field(default=None, alias="playerId")

class DraftStatus(BasicDraftMessage):
    message_type: Literal["draftStatus"]
    draft_state: bool = Field(default=False, alias="draftState")
    league_users: list[PublicUser] = Field(alias="leagueUsers")
    player_list: list[Player] = Field(alias="playerList")
    user_turn: PublicUser = Field(alias="userTurn")
    league_teams: dict[int, LeagueTeam] = Field(default={}, alias="leagueTeams")

class ConnectionRefused(PlayerConnect):
    message_type: Literal["connectionRefused"]
    
class PlayerList(BasicDraftMessage):
    message_type: Literal["playerList"]
    players: list[Player] = Field(default=None)
class StartDraft(BasicDraftMessage):
    message_type: Literal["startDraft"]

class PlayerSelected(BasicDraftMessage):
    message_type: Literal["playerSelected"]
    player_id: int = Field(alias="playerId")
    user_id: int = Field(alias="userId")
    player_position: str = Field(alias="playerPosition")

message_types = (
    BasicDraftMessage | 
    TurnChange | 
    TimeExpired | 
    PlayerConnect | 
    StartDraft |
    PlayerSelected
)

class DraftMessage(RootModel):
    root: message_types = Field(discriminator='message_type')