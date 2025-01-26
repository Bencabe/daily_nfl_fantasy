import os

os.getenv("FRONTEND_URL", "host.docker.internal")
class DatabaseCreds:
    HOST = os.getenv("RDS_HOSTNAME", "host.docker.internal")
    PASSWORD = os.getenv("RDS_PASSWORD", "password")
    PORT = os.getenv("RDS_PORT", "3306")
    USER = os.getenv("RDS_USERNAME", "ebroot")
    DB_NAME = "daily_ff"

class Season:
    ID = 23614

class JWT:
    SECRET = "SECRET"
    ALGORITH = "HS256"