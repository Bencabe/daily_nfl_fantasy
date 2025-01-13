from pydantic import BaseModel, Field, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    email: str
    password: str
    first_name: str = Field(alias='firstName')
    last_name: str = Field(alias='lastName')
    joined: str | None
    active_league: int | None = Field(alias='activeLeague')
    def get_public(self):
        return PublicUser(
            id=self.id,
            email=self.email,
            first_name=self.first_name,
            last_name=self.last_name
        )

class PublicUser(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    email: str
    first_name: str = Field(alias='firstName')
    last_name: str = Field(alias='lastName')
