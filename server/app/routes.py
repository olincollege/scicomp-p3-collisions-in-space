from flask import jsonify, make_response

from . import app

from .queries import (
    get_asteroids_metadata,
    get_asteroid,
    get_survey,
)


@app.route("/api/asteroids", methods=["GET"])
def api_get_asteroids():
    return jsonify({
        "metadata": get_asteroids_metadata()
    })


@app.route("/api/asteroids/<asteroid_id>", methods=["GET"])
def api_get_asteroid(asteroid_id):
    asteroid = get_asteroid(asteroid_id)
    if asteroid is None:
        return make_response({"error": "Asteroid not found!"}, 404)
    return jsonify(asteroid)


@app.route("/api/surveys/<survey_id>", methods=["GET"])
def api_get_survey(survey_id):
    survey_metadata = get_survey(survey_id)
    if survey_metadata is None:
        return make_response({"error": "Survey not found!"}, 404)
    return jsonify(survey_metadata)
