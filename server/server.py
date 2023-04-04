import os
import sqlite3

from flask import Flask, g, jsonify, make_response
from flask_cors import CORS


DATABASE = "database/databases/asteroids_db.sqlite3"

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


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


def execute_query(query, args=()):
    conn = get_db()
    c = conn.execute(query, args)
    rv = c.fetchone()
    c.close()
    return rv


@app.teardown_appcontext
def teardown_db(_):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


@app.route("/api/asteroids", methods=["GET"])
def api_get_asteroids():
    count = execute_query("SELECT MAX(id) FROM asteroids")
    if count is None:
        count = 0
    else:
        count = count[0]
    return jsonify({
        "n": count,
    })


@app.route("/api/asteroids/<asteroid_id>", methods=["GET"])
def api_get_asteroid(asteroid_id):
    metadata = execute_query(
        "SELECT * FROM asteroids WHERE id = ?",
        (asteroid_id,),
    )
    if metadata is None:
        return make_response({"error": "Asteroid not found!"}, 404)
    return jsonify({
        "name": metadata["name"],
        "number": metadata["number"],
        "provisional": metadata["provisonal"],
        "survey": metadata["survey"],
        "surveyId": metadata["surveyId"],
        "time": {
            "year": metadata["year"],
            "month": metadata["month"],
            "day": metadata["day"],
        },
        "pos": {
            "x": metadata["x"],
            "y": metadata["y"],
            "z": metadata["z"],
        },
        "semi-major": metadata["semimajor"],
        "semi-minor": metadata["semiminor"],
        "c": metadata["c"],
        "i": metadata["i"],
        "node": metadata["node"],
        "peri": metadata["peri"],
        "v": metadata["v"],
    })


@app.route("/api/surveys/<survey_id>", methods=["GET"])
def api_get_survey(survey_id):
    asteroids = execute_query(
        "SELECT * FROM surveys WHERE surveyId = ?",
        (survey_id,),
    )
    if asteroids is None:
        return make_response({"error": "Survey not found!"}, 404)
    asteroids = asteroids["asteroids"]
    asteroids = [int(a) for a in asteroids.split(",")]
    return jsonify({
        "asteroids": asteroids
    })


@app.route("/api/surveys/<survey_id>", methods=["GET"])
def api_get_survey(survey_id):
    asteroids = execute_query(
        "SELECT * FROM surveys WHERE surveyId = ?",
        (survey_id,),
    )
    if asteroids is None:
        return make_response({"error": "Survey not found!"}, 404)
    asteroids = asteroids["asteroids"]
    asteroids = [int(a) for a in asteroids.split(",")]
    return jsonify({
        "asteroids": asteroids
    })
