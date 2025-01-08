from fastapi import Depends, FastAPI, Header, Response, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from database.database_client import DatabaseClient
import uvicorn
import jwt
from constants import JWT, Season
from models.db_models import Gameweek, LeagueTeam
from services.draft_service import DraftService
from services.team_management import GameweekStats, TeamManagementService
from middlewares.jwt_auth import JWTMiddleware, validate_jwt
import datetime

app = FastAPI()


# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.add_middleware(JWTMiddleware)

# class UserDetails(BaseModel):
#     email: str
#     password: str
#     firstName: str
#     lastName: str

# @app.get("/user")
# async def get_user(email: str = Header(None)):
#     db_client = DatabaseClient()
#     user = db_client.get_user(email)
#     db_client.close()
#     return json.dumps(user)

# @app.post("/user")
# async def create_user(user_details: UserDetails):
#     db_client = DatabaseClient()
#     try:
#         db_client.add_user(user_details.email, user_details.password, user_details.firstName, user_details.lastName)
#         db_client.close()
#         return {"message": "User added successfully"}
#     except Exception as e:
#         return {"error": f"Error adding contact: {str(e)}"}

@app.post("/login")
async def login(response: Response, email: str = Header(None), password: str = Header(None)):
    db_client = DatabaseClient()
    try:
        user = db_client.get_user_model(email)
        db_client.close()
        if user.password == password:
            jwt_token = jwt.encode(
                {
                    'user': user.model_dump(by_alias=True), 
                    'exp' : datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
                }, 
                JWT.SECRET, 
                algorithm=JWT.ALGORITH
            )
            response.set_cookie(
                key="jwt_token",
                value=jwt_token,
                httponly=True,
                # secure=True,  # Set to True if using HTTPS
                samesite=None,
                max_age=3600,  # Cookie expiration time in seconds (e.g., 1 hour)
            )
            return user.model_dump(by_alias=True)
        response.status_code = 401
        return {"response": "Incorrect password"}
    except Exception as e:
        print(e)
        response.status_code = 404
        return {"response": "User not found"}

@app.post("/whoami")
async def whoami(request: Request, response: Response):
    validate_jwt(request)
    user = getattr(request.state, 'user', None)
    if user:
        return user
    response.status_code = 404
    return {"message": "user not authenticated"}

@app.get("/gameweek_stats", response_model=GameweekStats, operation_id="getGameweekStats")
async def get_gameweek_stats(
        league_id: int,
        user_id: int,
        gameweek_id: int,
        current_gameweek: bool,
        team_management_service: TeamManagementService = Depends(TeamManagementService.get_instance)
    ):
    return team_management_service.get_gameweek_stats(league_id, user_id, gameweek_id, current_gameweek)

@app.get("/gameweek_by_number", response_model=Gameweek, operation_id="getGameweekByNumber")
async def get_gameweek_team(
        gameweek_number: int,
        db_client: DatabaseClient = Depends(DatabaseClient)
    ):
    return db_client.get_gameweek_by_number(gameweek_number, season_id=Season.ID)

@app.get("/gameweek_current_gameweek", response_model=Gameweek, operation_id="getCurrentGameweek")
async def get_current_gameweek(
        db_client: DatabaseClient = Depends(DatabaseClient)
    ):
    return db_client.get_current_gameweek_model()[0]

@app.get("/all_gameweeks", response_model=list[Gameweek], operation_id="getAllGameweeks")
async def get_current_gameweek(
        db_client: DatabaseClient = Depends(DatabaseClient)
    ):
    return db_client.get_all_gameweeks(Season.ID)

@app.post("/team", response_model=None, operation_id="updateTeam")
async def update_team(
        team: LeagueTeam,
        team_management: TeamManagementService = Depends(TeamManagementService.get_instance)
    ):
    team_management.update_team(team)


@app.websocket("/player_draft/{league_id}")
async def player_draft(
    websocket: WebSocket,
    league_id: int,
    user_id: int,
    draft_service: DraftService = Depends(DraftService.get_instance)
):
    await websocket.accept()
    await draft_service.connect(league_id, user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            response = draft_service.handle_message(data, league_id)
            await draft_service.broadcast(response, league_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await draft_service.disconnect(league_id, user_id)




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)