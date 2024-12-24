from fastapi import FastAPI, Header, Response, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from database.database_client import DatabaseClient
import uvicorn
import jwt
from constants import JWT
from middlewares.jwt_auth import JWTMiddleware, validate_jwt
import datetime

app = FastAPI()


# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        print(user)
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

@app.websocket("/player_draft/{league_id}")
async def player_draft(websocket: WebSocket):
    users = [
        {'id': 7, 'name': 'Ben'},
        {'id': 8, 'name': 'Ben2'}
    ]
    players = [
        {'id': 1, 'name': 'Bruno'},
        {'id': 1, 'name': 'Rashford'}
    ]
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        await websocket.send_json({
            'type': 'playerList',
            'players': players
        })


# @app.get("/get_players_per_position/{position}")
# async def get_players_per_position(position: str):
#     db_client = DatabaseClient()
#     try:
#         players = db_client.get_players_per_position(position)
#         db_client.close()
#         return json.dumps(players)
#     except Exception as e:
#         return {"error": f"Error getting players: {str(e)}"}

# Continue converting the rest of the routes in a similar manner...

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)