# Data

## Setup

Before running any scripts:

1. (Recommended) Setup and activate a virtual environment:

```
cd data/
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```
pip install -r requirements.txt
```

## Quickstart

To generate the data necessary to run the visualization, either setup each
below dataset individually, or do the following:

1. Download the MPC orbital data:
   1. Get the data from
      [here](https://www.minorplanetcenter.net/iau/MPCORB/MPCORB.DAT.gz).
   2. Move the orbital data to `raw`:

    ```
    mv ~/Downloads/MPCORB.DAT.gz raw/.  # Assumes Downloads directory
    gunzip raw/MPCORB.DAT.gz
    ```

2. Download the MPC observations data:
   1. Get the data from
      [here](https://www.minorplanetcenter.net/iau/ECS/MPCAT-OBS/NumObs.txt.gz).
   2. Move the observation data to `raw`:

    ```
    mv ~/Downloads/NumObs.txt.gz raw/.  # Assumes Downloads directory
    gunzip raw/NumObs.txt.gz
    ```

3. Download the MPC surveys data:
    1. Get the data from
       [here](https://www.minorplanetcenter.net/iau/lists/ObsCodes.html). (Must
       save the page as a local file.)
    2. Move the survey data to `raw`:

    ```
    mv ~/Downloads/ObsCodes.html raw/.  # Assumes Downloads directory
    ```

4. Run the data parsing script (this will take some time):

```
source venv/bin/activate  # Ensure the venv is active
python scripts/parse_data.py
```

See below for documentation on the contents of the generated data.

## Datasets

All below datasets are required to run this project.

Before running scripts, ensure the venv is activated with

```
source venv/bin/activate
```

### Total Dataset

The data for each asteroid's orbit and survey.

The combination of the below datasets into the final dataset used in the
visualization. Fist, follow instructions for all below datasets. Then, run the
following python script. Note that it may take a few minutes for data to be
parsed. 

```
python script/combine_datasets.py
```

The resulting json object is created as `/processed/asteroids.json` and is an array
where each object has the keys:

* `name`: The name of the asteroid, "Un-Named" if not set in the MPC data.
* `number`: Packed 5 digit numerical designation of the asteroid. Null if the asteroid
  only has a provisional designation.
* `provisional`: Packed 7 digit provisional designation of the asteroid. Null if
  the asteroid has been assigned a number.
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

```
mv ~/Downloads/MPCORB.DAT.gz raw/.  # Assumes Downloads directory
gunzip raw/MPCORB.DAT.gz
python script/parse_mpcord.py
```

The resulting json object is created as `/processed/orbits.json` and is an array
where each object has the keys:

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

```
mv ~/Downloads/NumObs.txt.gz raw/.  # Assumes Downloads directory
gunzip raw/NumObs.txt.gz
python script/parse_numobs.py
```

The resulting json object is created as `/processed/survey_attribution.json` and
is an array where each object has the keys:

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

```
mv ~/Downloads/ObsCodes.html raw/.  # Assumes Downloads directory
python script/parse_obscodes.py
```

The resulting json object is created as `/processed/survey_codes.json` and
is an dictionary where each key is:

* `surveyId`: 3 letter survey ID.

and each value is:

* `name`: Survey name.
