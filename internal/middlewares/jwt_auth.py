from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import jwt
from constants import JWT 
from http import cookies
import os

EXEMPT_ROUTES = ["/login", "/whoami", "/docs", "/openapi.json", "/healthcheck"]

def validate_jwt(request: Request):
    # Try cookie first
    jwt_token = request.cookies.get('jwt_token')
    
    # If no cookie, check Authorization header
    if not jwt_token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            jwt_token = auth_header.split(' ')[1]
            
    if not jwt_token:
        raise HTTPException(status_code=401, detail="JWT token missing")
    
    try:
        payload = jwt.decode(jwt_token, JWT.SECRET, algorithms=[JWT.ALGORITH])
        request.state.user = payload
    except jwt.exceptions.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path in EXEMPT_ROUTES:
            return await call_next(request)
        
        validate_jwt(request)
        
        response = await call_next(request)
        return response