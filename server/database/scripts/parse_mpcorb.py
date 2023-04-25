"""Parse MPC orbit data file and write to JSON file."""
import math
import json

import orbital
from json_stream import streamable_list
from tqdm import tqdm


READ_PATH = "database/raw/NEA.DAT"
WRITE_PATH = "database/processed/orbits.json"
PARSED = 0


def au_to_m(au):
    return au * 149597870691


def parse_line(line):
    name = line[166:193].strip()
    id_ = line[0:6].strip()
    if len(id_) == 5:
        number = id_
        provisional = None
    else:
        number = None
        provisional = id_

    a = float(line[92:102].strip())
    e = float(line[70:78].strip())
    i = float(line[59:67].strip())
    node = float(line[48:56].strip())
    peri = float(line[37:45].strip())
    m = float(line[26:34].strip())

    elements = orbital.elements.KeplerianElements(
        a=au_to_m(a),
        e=e,
        i=math.radians(i),
        raan=math.radians(node),
        arg_pe=math.radians(peri),
        M0=math.radians(m),
        body='Sun' 
        epoch=
    )

    # Ellipse params
    c = e * a  # e = c / a
    b = math.sqrt((a ** 2) - (c ** 2))  # c ** 2 + b ** 2 = a ** 2

    return {
        "name": name if len(name) else "Un-Named",
        "number": number,
        "provisional": provisional,
        "pos": {
            "x": elements.r.x,
            "y": elements.r.y,
            "z": elements.r.z,
        },
        "semi-major": au_to_m(a),
        "semi-minor": au_to_m(b),
        "c": au_to_m(c),
        "i": i,
        "node": node,
        "peri": peri,
        "v": math.degrees(elements.f),
    }


def parse_file():
    global PARSED
    print(f"Parsing '{READ_PATH}'...")
    with open(READ_PATH, "r") as rf:
        for i, line in enumerate(tqdm(rf)):
            if i < 43 or len(line) == 1:
                continue
            space_object = parse_line(line)
            PARSED += 1
            yield space_object


def main():
    print(f"Streaming data to '{WRITE_PATH}'...")
    with open(WRITE_PATH, "w") as wf:
        generator = parse_file()
        json.dump(streamable_list(generator), wf)
    print("Parsing complete.")
    print(f"Parsed  {PARSED} entries.")

if __name__ == "__main__":
    main()
