from .db import execute_query


def get_asteroids_metadata():
    count = execute_query("SELECT MAX(id) FROM asteroids")
    if count is None:
        count = 0
    else:
        count = count[0]
    return {
        "n": count,
    }



def get_asteroid(asteroid_id):
    metadata = execute_query(
        "SELECT * FROM asteroids WHERE id = ?",
        (asteroid_id,),
    )
    if metadata is None:
        return None
    return {
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
    }


def get_survey(survey_id):
    asteroids = execute_query(
        "SELECT * FROM surveys WHERE surveyId = ?",
        (survey_id,),
    )
    if asteroids is None:
        return None
    asteroids = asteroids["asteroids"]
    asteroids = [int(a) for a in asteroids.split(",")]
    return {
        "asteroids": asteroids
    }
