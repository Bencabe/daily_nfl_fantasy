from fastapi import Depends, FastAPI, Header, Response, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from database.database_client import DatabaseClient
import uvicorn
import jwt
from constants import JWT, Season
from services.fixture_management import FixtureManagementService
from services.player_management import PlayerManagementService, SeasonPlayerStats
from services.league_management import LeagueFixtureResults, LeagueManagementService
from models.db_models import Fixture, FootballTeam, Gameweek, League, LeagueTeam, NewLeague, Player
from services.draft_service import DraftService
from services.team_management import GameweekStats, TeamManagementService
from middlewares.jwt_auth import JWTMiddleware, validate_jwt
import datetime
import os

app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "host.docker.internal:3000")
BACKEND_URL = os.getenv("BACKEND_URL", None)
HTTPS_TRAFFIC = True if BACKEND_URL else False
SAMESITE = 'None' if BACKEND_URL else None


# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.add_middleware(JWTMiddleware)

@app.get("/healthcheck")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.now()}

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
                secure=HTTPS_TRAFFIC,
                samesite=SAMESITE,
                domain=BACKEND_URL,
                max_age=3600,  # Cookie expiration time in seconds (e.g., 1 hour)
            )
            return {
                "user": user.model_dump(by_alias=True),
                # TODO this isn't great, using as a fallback for now because httponly cookie not reliable
                "token": jwt_token  
            }
        response.status_code = 401
        return {"response": "Incorrect password"}
    except Exception as e:
        print(e)
        response.status_code = 404
        return {"response": "User not found"}
    

@app.post("/join_league", operation_id="joinLeague")
async def join_league(
        league_id: int,
        user_id: int,
        password: str,
        team_name: str,
        league_management: LeagueManagementService = Depends(LeagueManagementService.get_instance)
    ):
    league_management.join_league(league_id, user_id, password, team_name)
    return {"response": "League joined"}, 200

@app.post("/create_league", operation_id="createLeague")
async def create_league(
        new_league: NewLeague,
        team_name: str,
        league_management: LeagueManagementService = Depends(LeagueManagementService.get_instance)
    ):
    league_management.create_league(new_league, team_name)
    return {"response": "League created"}, 200

@app.post("/change_active_league", operation_id="changeActiveLeague")
async def change_active_league(
        new_league_id: int,
        user_id: int,
        response: Response,
        league_management: LeagueManagementService = Depends(LeagueManagementService.get_instance),
        db_client: DatabaseClient = Depends(DatabaseClient)
    ):
    league_management.update_active_league(user_id, new_league_id)
    # Get updated user data
    user = db_client.get_user_by_id(user_id)
    # Generate new JWT with updated user data
    jwt_token = jwt.encode(
        {
            'user': user.model_dump(by_alias=True),
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        },
        JWT.SECRET,
        algorithm=JWT.ALGORITH
    )
    response.set_cookie(
        key="jwt_token",
        value=jwt_token,
        httponly=True,
        secure=HTTPS_TRAFFIC,
        samesite=SAMESITE,
        domain=BACKEND_URL,
        max_age=3600
    )
    return {"response": "League updated", "token": jwt_token}

@app.post("/user_leagues", operation_id="getUserLeagues", response_model=list[League])
async def get_user_leagues(
        user_id: int,
        league_management: LeagueManagementService = Depends(LeagueManagementService.get_instance)
    ):
    return league_management.get_user_leagues(user_id)


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

@app.get("/players", response_model=list[Player], operation_id="getAllPlayers")
async def get_all_players(
        db_client: DatabaseClient = Depends(DatabaseClient)
    ):
    return db_client.get_all_players()

@app.get("/season_player_stats", response_model=list[SeasonPlayerStats], operation_id="getSeasonPlayerStats")
async def get_season_player_stats(
        player_service: PlayerManagementService = Depends(PlayerManagementService.get_instance)
    ):
    return player_service.get_season_player_stats()

@app.get("/league_teams", operation_id="getLeagueTeams")
async def get_league_teams(
        league_id: int,
        league_management: LeagueManagementService = Depends(LeagueManagementService.get_instance)
    ) -> list[LeagueTeam]:
    return league_management.get_league_teams(league_id)

@app.get("/football_teams", response_model=list[FootballTeam], operation_id="getFootballTeams")
async def get_football_teams(
        db_client: DatabaseClient = Depends(DatabaseClient)
    ):
    return db_client.get_football_teams()

@app.get("/league_fixture_results", response_model=LeagueFixtureResults, operation_id="getLeagueFixtureResults")
async def get_league_fixture_results(
        league_id: int,
        league_management: LeagueManagementService = Depends(LeagueManagementService.get_instance)
    ):
    return league_management.get_league_fixture_results(league_id)

@app.get("/gameweek_fixtures", response_model=list[Fixture], operation_id="getGameweekFixtures")
async def get_gameweek_fixtures(
        gameweek_id: int,
        fixture_management: FixtureManagementService = Depends(FixtureManagementService.get_instance)
    ):
    return fixture_management.get_gameweek_fixtures(gameweek_id)

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