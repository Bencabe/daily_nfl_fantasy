from pydantic import BaseModel, Field, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    email: str
    password: str
    first_name: str = Field(alias='firstName')
    last_name: str = Field(alias='lastName')
    joined: str | None
    active_league: int | None = Field(alias='activeLeague')
