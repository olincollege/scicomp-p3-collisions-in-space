import os
import sqlite3
from typing import Any

from flask import g

from . import app

DATABASE = "database/databases/asteroids_db.sqlite3"


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        if not os.path.exists(DATABASE):
            raise ValueError(
                "Database doesn't exit! See setup instructions to build."
            )
        db = g._databse = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db


def execute_query(query, args=(), one=True) -> Any:
    conn = get_db()
    c = conn.execute(query, args)
    if one:
        rv = c.fetchone()
    else:
        rv = c.fetchall()
    c.close()
    return rv


@app.teardown_appcontext
def teardown_db(_):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()
