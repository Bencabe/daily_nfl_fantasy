# call script from internal directory using python update_current_gameweek.py
from database.database_client import DatabaseClient

db_client = DatabaseClient()

active_gameweek = db_client.get_active_gameweek()
next_gameweek = db_client.get_next_gameweek()

db_client.reset_current_gameweeks()

if active_gameweek:
    active_gameweek.current = True
    db_client.add_data_mapping_object("gameweeks", active_gameweek.model_dump())
else:
    next_gameweek.current = True
    db_client.add_data_mapping_object("gameweeks", next_gameweek.model_dump())

