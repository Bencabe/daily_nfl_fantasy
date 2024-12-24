from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import jwt
from constants import JWT 
from http import cookies

EXEMPT_ROUTES = ["/login", "/whoami"]

def validate_jwt(request: Request):
    jwt_token = request.cookies.get('jwt_token')
    if not jwt_token:
        raise HTTPException(status_code=401, detail="JWT token missing")
    
    try:
        payload = jwt.decode(jwt_token, JWT.SECRET, algorithms=[JWT.ALGORITH], verify=True, options={"verify_exp": True})
        request.state.user = payload
    except jwt.exceptions.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        if request.url.path in EXEMPT_ROUTES:
            return await call_next(request)
        
        validate_jwt(request)
        
        response = await call_next(request)
        return response