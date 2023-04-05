"""Parse MPC orbit data file and write to JSON file."""
import json

from json_stream import streamable_list
from tqdm import tqdm


READ_PATH = "database/raw/NumObs.txt"
WRITE_PATH = "database/processed/survey_attribution.json"
PARSED = 0
SET = set()


def parse_line(line):
    fields = line.split()
    id_ = fields[0]
    if id_[-1] != "*":
        return None

    if len(id_) != 13:
        print("Abnormal ID found!")
        print(line)
        return None
    number = id_[:5]
    if number in SET:
        return None
    SET.add(number)

    survey = fields[-1][-3:]
    year = int(line[15:19])
    month = int(line[20:22])
    day = int(line[23:25])

    return {
        "number": number,
        "surveyId": survey,
        "time": {
            "year": year,
            "month": month,
            "day": day,
        }
    }


def parse_file():
    global PARSED
    print(f"Parsing '{READ_PATH}'...")
    with open(READ_PATH, "r") as rf:
        for obj in tqdm(rf):
            observation = parse_line(obj)
            if observation is None:
                continue
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
