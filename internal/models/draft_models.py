from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Union, Annotated

class BasicDraftMessage(BaseModel):
    message_type: str = Field()

class TurnChange(BasicDraftMessage):
    message_type: str = "turnChange"
    previous_player_id: int = Field()
    next_player_id: int | None = Field(default=None)

messages = [BasicDraftMessage, TurnChange]

DraftMessage = Annotated[Union[BasicDraftMessage, TurnChange], Field(discriminator='message_type')]