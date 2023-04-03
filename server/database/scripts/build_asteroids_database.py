import sqlite3

import json_stream
from tqdm import tqdm


DATABASE = "processed/asteroid.db"
JSON = "processed/asteroids.json"
COLS = (
    "name", "number", "provisonal", "survey", "surveyId", "year", "month", "day",
    "x", "y", "z", "semimajor", "semiminor", "c", "i", "node", "peri", "v"
)


def create_table(conn):
    c = conn.cursor()
    c.execute(
        """
DROP TABLE IF EXISTS asteroids;
        """
    )
    c.execute(
        """
CREATE TABLE asteroids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    provisonal TEXT,
    survey TEXT,
    surveyId TEXT,
    year INT,
    month INT,
    day INT,
    x REAL NOT NULL,
    y REAL NOT NULL,
    z REAL NOT NULL,
    semimajor REAL NOT NULL,
    semiminor REAL NOT NULL,
    c REAL NOT NULL,
    i REAL NOT NULL,
    node REAL NOT NULL,
    peri REAL NOT NULL,
    v REAL NOT NULL
);
        """
    )
    conn.commit()


def asteroid_data():
    print(f"Streaming from {JSON}...")
    with open(JSON, "r") as jf:
        asteroids = json_stream.load(jf)
        for asteroid in tqdm(asteroids.persistent()):
            yield asteroid


def unpack_asteroid(asteroid):
    return (
        asteroid["name"],
        asteroid["number"],
        asteroid["provisional"],
        asteroid["survey"],
        asteroid["surveyId"],
        asteroid["time"]["year"],
        asteroid["time"]["month"],
        asteroid["time"]["day"],
        asteroid["pos"]["x"],
        asteroid["pos"]["y"],
        asteroid["pos"]["z"],
        asteroid["semi-major"],
        asteroid["semi-minor"],
        asteroid["c"],
        asteroid["i"],
        asteroid["node"],
        asteroid["peri"],
        asteroid["v"]
    )


def get_chunk(asteroids, chunk_size=10000):
    chunk = []
    for _ in range(chunk_size):
        try:
            asteroid = next(asteroids)
            while asteroid is None:
                asteroid = next(asteroids)
            chunk.append(asteroid)
        except StopIteration:
            break
    return chunk


def fill_table(conn):
    c = conn.cursor()
    asteroids = asteroid_data()
    chunk = get_chunk(asteroids)
    while len(chunk) != 0:
        data = [unpack_asteroid(a) for a in chunk]
        c.executemany(
            f"""
INSERT INTO asteroids ({', '.join(COLS)})
VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            data
        )
        conn.commit()
        chunk = get_chunk(asteroids)


def main():
    conn = sqlite3.connect(DATABASE)
    try:
        create_table(conn)
        fill_table(conn)
    except Exception as e:
        conn.close()
        raise e


if __name__ == "__main__":
    main()
