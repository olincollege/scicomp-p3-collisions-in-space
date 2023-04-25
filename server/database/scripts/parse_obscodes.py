"""Parse MPC orbit data file and write to JSON file."""
import json

from json_stream import streamable_dict
from tqdm import tqdm


READ_PATH = "database/raw/ObsCodes.txt"
WRITE_PATH = "database/processed/survey_codes.json"
PARSED = 0


def parse_line(line):
    id_ = line[:3]
    name = line[30:].strip()
    return id_, name


def parse_file():
    global PARSED
    print(f"Parsing '{READ_PATH}'...")
    with open(READ_PATH, "r") as rf:
        for i, obj in enumerate(tqdm(rf)):
            if i < 2:
                continue
            id_, name = parse_line(obj)
            PARSED += 1
            yield id_, name


def main():
    print(f"Streaming data to '{WRITE_PATH}'...")
    with open(WRITE_PATH, "w") as wf:
        generator = parse_file()
        json.dump(streamable_dict(generator), wf)
    print("Parsing complete.")
    print(f"Parsed {PARSED} entries.")


if __name__ == "__main__":
    main()
