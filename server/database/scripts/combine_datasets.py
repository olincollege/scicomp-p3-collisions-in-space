"""Parse MPC orbit data file and write to JSON file."""
import json

import json_stream
from json_stream import streamable_list
from tqdm import tqdm


ORBITS_PATH = "database/processed/orbits.json"
OBSERVATIONS_PATH = "database/processed/survey_attribution.json"
SURVEY_ID_PATH = "database/processed/survey_codes.json"

READ_PATH = "database/raw/mpcorb_extended.json"
WRITE_PATH = "database/processed/asteroids.json"

LINKED = 0
UNLINKED = 0


def orbits_data():
    print(f"Streaming from {ORBITS_PATH}...")
    with open(ORBITS_PATH, "r") as of:
        orbits = json_stream.load(of)
        for orbit in orbits.persistent():
            yield orbit


def observations_data():
    print(f"Streaming from {OBSERVATIONS_PATH}...")
    with open(OBSERVATIONS_PATH, "r") as of:
        observations = json_stream.load(of)
        for observation in observations.persistent():
            yield observation


def unpack_orbit(orbit):
    return {
        "name": orbit["name"],
        "number": orbit["number"],
        "provisional": orbit["provisional"],
        "pos": {
            "x": orbit["pos"]["x"],
            "y": orbit["pos"]["y"],
            "z": orbit["pos"]["z"],
        },
        "semi-major": orbit["semi-major"],
        "semi-minor": orbit["semi-minor"],
        "c": orbit["c"],
        "i": orbit["i"],
        "node": orbit["node"],
        "peri": orbit["peri"],
        "v": orbit["v"],
    }


def linked_orbit(orbit, observation, id_to_name):
    global LINKED
    LINKED += 1
    orbit = unpack_orbit(orbit)
    orbit.update({
        "survey": id_to_name[observation["surveyId"]],
        "surveyId": observation["surveyId"],
        "time": {
            "year": observation["time"]["year"],
            "month": observation["time"]["month"],
            "day": observation["time"]["day"],
        },
    })
    return orbit


def unlinked_orbit(orbit):
    global UNLINKED
    UNLINKED += 1
    orbit = unpack_orbit(orbit)
    orbit.update({
        "survey": None,
        "surveyId": None,
        "time": {
            "year": None,
            "month": None,
            "day": None,
        },
    })
    return orbit


def fill_cache(observations, cache, i=10000):
    try:
        for _ in range(i):
            observation = next(observations)
            cache[observation["number"]] = observation
    except StopIteration:
        pass


def hit_cache(orbit, cache, id_to_name):
    observation = cache[orbit["number"]]
    del cache[orbit["number"]]
    return linked_orbit(orbit, observation, id_to_name)


def combine_datasets():
    print(f"Loading {SURVEY_ID_PATH}...")
    with open(SURVEY_ID_PATH, "r") as f:
        id_to_name = json.load(f)

    cache = {}
    hanging_orbits = []
    orbits = orbits_data()
    observations = observations_data()

    for orbit in tqdm(orbits):
        if orbit["number"] not in cache:
            fill_cache(observations, cache)
            _replacement = []
            hanging_orbits.append(orbit)
            for h_orbit in hanging_orbits:
                if h_orbit["number"] in cache:
                    yield hit_cache(h_orbit, cache, id_to_name)
                else:
                    yield unlinked_orbit(h_orbit)
            h_orbit = []
            hanging_orbits = _replacement
        else:
            yield hit_cache(orbit, cache, id_to_name)

    print(f"{len(cache)} observations not linked to asteroids.")


def main():
    print(f"Streaming data to '{WRITE_PATH}'...")
    with open(WRITE_PATH, "w") as wf:
        generator = combine_datasets()
        json.dump(streamable_list(generator), wf)
    print("Parsing complete.")
    print(f"{LINKED} orbits linked to surveys")
    print(f"{UNLINKED} orbits left unlinked")



if __name__ == "__main__":
    main()
