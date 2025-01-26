import os

class DatabaseCreds:
    HOST = os.getenv("RDS_HOSTNAME", "localhost")
    PASSWORD = os.getenv("RDS_PASSWORD", "password")
    PORT = os.getenv("RDS_PORT", "3306")
    USER = os.getenv("RDS_USERNAME", "root")
    DB_NAME = "daily_ff"

class Season:
    ID = 23614

class JWT:
    SECRET = "SECRET"
    ALGORITH = "HS256"