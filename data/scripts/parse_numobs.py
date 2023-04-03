"""Parse MPC orbit data file and write to JSON file."""
import json

from json_stream import streamable_list
from tqdm import tqdm


READ_PATH = "raw/NumObs.txt"
WRITE_PATH = "processed/surveys.json"
PARSED = 0


def parse_line(line):
    fields = line.split()
    id_ = fields[0]
    survey = fields[-1][-3:]
    if id_[-1] == "*":
        print(id_, survey)
        print(line)
        input()


def parse_file():
    global SKIPPED, PARSED
    print(f"Parsing '{READ_PATH}'...")
    with open(READ_PATH, "r") as rf:
        for obj in tqdm(rf):
            space_object = parse_line(obj)
            PARSED += 1
            yield space_object


def main():
    print(f"Streaming data to '{WRITE_PATH}'...")
    with open(WRITE_PATH, "w") as wf:
        generator = parse_file()
        json.dump(streamable_list(generator), wf)
    print("Parsing complete.")
    print(f"Parsed {PARSED} entries.")

if __name__ == "__main__":
    main()
