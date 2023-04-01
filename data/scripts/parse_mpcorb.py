"""Parse MPC orbit data file and write to JSON file."""
import math
import json

import orbital
import json_stream
from json_stream import streamable_list
from tqdm import tqdm


READ_PATH = "raw/mpcorb_extended.json"
WRITE_PATH = "processed/orbits.json"
REQUIRED_FIELDS = ("a", "e", "i", "Node", "Peri", "M")

SKIPPED = 0
PARSED = 0


def valid_object(obj):
    for field in REQUIRED_FIELDS:
        if field not in obj:
            return False
    if obj["e"] >= 1:
        return False
    return True


def parse_object(i, obj):
    if "Number" in obj:
        id_ = int(obj["Number"][1:-1])  # Remove '(' and ')'
    else:
        # Ad-hoc fix for ~half the entries that are missing the Number field
        # Howerver, does hold true for the 600,000 entries that have the Number field
        id_ = i + 1

    # Ellipse params
    e, a = obj["e"], obj["a"]
    c = e * a  # e = c / a
    b = math.sqrt((a ** 2) - (c ** 2))  # c ** 2 + b ** 2 = a ** 2

    # Positional params
    mean_anomaly = math.radians(obj["M"])
    true_anomaly = orbital.utilities.true_anomaly_from_mean(e, mean_anomaly)
    true_anomaly = math.degrees(true_anomaly)

    return {
        "name": obj.get("Name", "Un-Named"),
        "id": id_,
        "semi-major": a,
        "semi-minor": b,
        "i": obj["i"],
        "node": obj["Node"],
        "peri": obj["Peri"],
        "v": true_anomaly,
    }


def parse_file():
    global SKIPPED, PARSED
    print(f"Parsing '{READ_PATH}'...")
    with open(READ_PATH, "r") as rf:
        data = json_stream.load(rf)
        for i, obj in enumerate(tqdm(data.persistent())):
            if not valid_object(obj):
                SKIPPED += 1
                continue
            space_object = parse_object(i, obj)
            PARSED += 1
            yield space_object


def main():
    print(f"Streaming data to '{WRITE_PATH}'...")
    with open(WRITE_PATH, "w") as wf:
        generator = parse_file()
        json.dump(streamable_list(generator), wf)
    print("Parsing complete.")
    print(f"Skipped {SKIPPED} entries.")
    print(f"Parsed  {PARSED} entries.")

if __name__ == "__main__":
    main()
