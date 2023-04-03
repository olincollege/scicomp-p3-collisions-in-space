"""Parse MPC orbit data file and write to JSON file."""
import json

from json_stream import streamable_list
from tqdm import tqdm


READ_PATH = "raw/ObsCodes.html"
WRITE_PATH = "processed/survey_codes.json"
PARSED = 0


def parse_line(line):
    id_ = line[:3]
    name = line[30:].strip()
    return {
        "surveyId": id_,
        "name": name
    }


def parse_file():
    global PARSED
    print(f"Parsing '{READ_PATH}'...")
    with open(READ_PATH, "r") as rf:
        for i, obj in enumerate(tqdm(rf)):
            if i < 2:
                continue
            observation = parse_line(obj)
            PARSED += 1
            yield observation


def main():
    print(f"Streaming data to '{WRITE_PATH}'...")
    with open(WRITE_PATH, "w") as wf:
        generator = parse_file()
        json.dump(streamable_list(generator), wf)
    print("Parsing complete.")
    print(f"Parsed {PARSED} entries.")


if __name__ == "__main__":
    main()
