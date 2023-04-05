import sqlite3
from collections import defaultdict

import json_stream
from tqdm import tqdm


DATABASE = "database/databases/asteroids_db.sqlite3"
JSON = "database/processed/asteroids.json"


def create_table(conn):
    c = conn.cursor()
    c.execute(
        """
DROP TABLE IF EXISTS surveys;
        """
    )
    c.execute(
        """
CREATE TABLE surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surveyId TEXT NOT NULL,
    surveyName TEXT NOT NULL,
    asteroids TEXT
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


def fill_table(conn):
    c = conn.cursor()
    asteroids = asteroid_data()
    s2a = defaultdict(list)
    s2n = {}
    i = 0
    for asteroid in asteroids:
        i += 1
        s2a[asteroid["surveyId"]].append(i)
        if asteroid["surveyId"] not in s2n:
            s2n[asteroid["surveyId"]] = asteroid["survey"]
    data = [
        (survey_id, s2n[survey_id], ','.join(str(a) for a in asteroids))
        for survey_id, asteroids in s2a.items()
    ]
    c.executemany(
        f"INSERT INTO surveys (surveyId, surveyName, asteroids) VALUES (?, ?, ?)",
        data
    )
    conn.commit()


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
