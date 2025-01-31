from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import jwt
from constants import JWT 
from http import cookies
import os

EXEMPT_ROUTES = ["/login", "/whoami", "/docs", "/openapi.json", "/healthcheck"]

def validate_jwt(request: Request):
    FRONTEND_URL = os.getenv("FRONTEND_URL", "host.docker.internal:3000")
    BACKEND_URL = os.getenv("BACKEND_URL", None)
    HTTPS_TRAFFIC = True if BACKEND_URL else False
    SAMESITE = 'none' if BACKEND_URL else None
    vars = {
        'BACKEND_URL', BACKEND_URL,
        'HTTPS_TRAFFIC', HTTPS_TRAFFIC,
        'SAMESITE', SAMESITE,
        'FRONTEND_URL', FRONTEND_URL
    }
    jwt_token = request.cookies.get('jwt_token')
    if not jwt_token:
        raise HTTPException(status_code=401, detail=f"JWT token missing {vars}")
    
    try:
        payload = jwt.decode(jwt_token, JWT.SECRET, algorithms=[JWT.ALGORITH], verify=True, options={"verify_exp": True})
        request.state.user = payload
    except jwt.exceptions.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path in EXEMPT_ROUTES:
            return await call_next(request)
        
        validate_jwt(request)
        
        response = await call_next(request)
        return response