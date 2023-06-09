# Data

Descriptions and setup instructions for datasets and database.
See `server` README for quick setup instructions

## Database

Descriptions of the database tables and how to set them up.

Below datasets must all be parsed before the database can be made.

### Asteroids

Table containing metadata associated with every asteroid. Keyed by where the
asteroid appears in the asteroids.json file. Ex: Ceres is the first element in
the json file, and so has the ID `1`. To setup:

```console
python database/scripts/build_asteroids_database.py
```

The table contains:

* `name`: The name of the asteroid, "Un-Named" if not set in the MPC data.
* `number`: Packed 5 digit numerical designation of the asteroid.
* `provisional`: Packed 7 digit provisional designation of the asteroid.
* `survey`: The name of the survey that discovered the asteroid.
* `surveyId`: The ID of the survey that discovered the asteroid.
* `year`: Year of discovery.
* `month`: Month of discovery.
* `Day`: Day of discovery.
* `x`: X coordinate of the asteroid in m.
* `y`: Y coordinate of the asteroid in m.
* `z`: Z coordinate of the asteroid in m.
* `semimajor`: Size of the semi-major axis of the orbit in m.
* `semiminor`: Size of the semi-minor axis of the orbit in m.
* `c`: Distance from the center of the orbit to the foci in m.
* `i`: Inclination of the orbit in degrees. (Rotation from the xy-plane.)
* `node`: Longitude of the ascending node of the orbit in degrees. (Rotation
  around the z-axis.)
* `peri`: Argument of the periapsis of the orbit in degrees.
* `v`: True anomaly of the asteroid in degrees.

### Surveys

Table containing a mapping of survey IDs to asteroid IDs. Asteroid IDs are as
they appear in the asteroids table. To setup:

```console
python database/scripts/build_surveys_database.py
```

The table contains:

* `surveyId`: The ID of the survey.
* `surveyName`: The name of the survey.
* `asteroids`: Comma delimited list of asteroid IDs.

## Datasets

Descriptions of the datasets and how to set them up.

### Total Dataset

The data for each asteroid's orbit and survey.

The combination of the below datasets into the final dataset used in the
visualization. DOES NOT include asteroids that do not have an associated survey
Fist, follow instructions for all below datasets. Then, run the following python
script. Note that it may take a few minutes for data to be parsed.

```console
python database/scripts/combine_datasets.py
```

The resulting json object is created as `database/processed/asteroids.json` and
is an array where each object has the keys:

* `name`: The name of the asteroid, "Un-Named" if not set in the MPC data.
* `number`: Packed 5 digit numerical designation of the asteroid.
* `provisional`: Packed 7 digit provisional designation of the asteroid.
* `survey`: The name of the survey that discovered the asteroid.
* `surveyId`: The ID of the survey that discovered the asteroid.
* `time`: dict containing:
  * `year`: Year of discovery.
  * `month`: Month of discovery.
  * `Day`: Day of discovery.
* `pos`: dict containing:
  * `x`: X coordinate of the asteroid in m.
  * `y`: Y coordinate of the asteroid in m.
  * `z`: Z coordinate of the asteroid in m.
* `semi-major`: Size of the semi-major axis of the orbit in m.
* `semi-minor`: Size of the semi-minor axis of the orbit in m.
* `c`: Distance from the center of the orbit to the foci in m.
* `i`: Inclination of the orbit in degrees. (Rotation from the xy-plane.)
* `node`: Longitude of the ascending node of the orbit in degrees. (Rotation
  around the z-axis.)
* `peri`: Argument of the periapsis of the orbit in degrees.
* `v`: True anomaly of the asteroid in degrees.

### MPC Orbit Data

The orbital data for all asteroids tracked by the MPC.

The MPC orbital data can be downloaded from
[here](https://www.minorplanetcenter.net/iau/MPCORB/MPCORB.DAT.gz).
Then, move the file to `raw`, unzip the file and run the following python
script. Note that it may take a few minutes for data to be parsed.

```console
mv ~/Downloads/MPCORB.DAT.gz database/raw/.  # Assumes Downloads directory
gunzip database/raw/MPCORB.DAT.gz
python database/scripts/parse_mpcord.py
```

The resulting json object is created as `database/processed/orbits.json` and is
an array where each object has the keys:

* `name`: The name of the asteroid, "Un-Named" if not set in the MPC data.
* `number`: Packed 5 digit numerical designation of the asteroid. Null if the asteroid
  only has a provisional designation.
* `provisional`: Packed 7 digit provisional designation of the asteroid. Null if
  the asteroid has been assigned a number.
* `pos`: dict containing:
  * `x`: X coordinate of the asteroid in m.
  * `y`: Y coordinate of the asteroid in m.
  * `z`: Z coordinate of the asteroid in m.
* `semi-major`: Size of the semi-major axis of the orbit in m.
* `semi-minor`: Size of the semi-minor axis of the orbit in m.
* `c`: Distance from the center of the orbit to the foci in m.
* `i`: Inclination of the orbit in degrees. (Rotation from the xy-plane.)
* `node`: Longitude of the ascending node of the orbit in degrees. (Rotation
  around the z-axis.)
* `peri`: Argument of the periapsis of the orbit in degrees.
* `v`: True anomaly of the asteroid in degrees.

### MPC Survey Attribution Data

A mapping of numbered asteroids to the survey IDs that first discovered them.

The MPC observations can be downloaded
[here](https://www.minorplanetcenter.net/iau/ECS/MPCAT-OBS/NumObs.txt.gz).
Then, move the file to `raw`, unzip the file and run the following python
script. Note that it may take a few minutes for data to be parsed.

```console
mv ~/Downloads/NumObs.txt.gz database/raw/.  # Assumes Downloads directory
gunzip database/raw/NumObs.txt.gz
python database/scripts/parse_numobs.py
```

The resulting json object is created as
`database/processed/survey_attribution.json` and is an array where each object
has the keys:

* `number`: Packed 5 digit numerical designation of the asteroid.
* `surveyId`: 3 letter survey ID.
* `time`: dict containing:
  * `year`: Year of entry.
  * `month`: Month of entry.
  * `Day`: Day of entry.

### MPC Survey Code Data

A mapping of survey IDs to survey names.

The survey codes can be downloaded
[here](https://www.minorplanetcenter.net/iau/lists/ObsCodes.html). (Must save
the page as a local file.) Then, move the file to `raw` and run the following
python script.

```console
mv ~/Downloads/ObsCodes.html database/raw/.  # Assumes Downloads directory
python database/scripts/parse_obscodes.py
```

The resulting json object is created as `database/processed/survey_codes.json`
and is an dictionary where each key is:

* `surveyId`: 3 letter survey ID.

and each value is:

* `name`: Survey name.
