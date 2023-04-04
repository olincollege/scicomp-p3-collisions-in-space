# Server

The backend server for the asteroids visualization.

## Setup

### Env

Before running any scripts:

1. (Recommended) Setup and activate a virtual environment:

    ```console
    cd server/
    python -m venv venv
    source venv/bin/activate
    ```

2. Install dependencies:

    ```console
    pip install -r requirements.txt
    ```

### Database

To populate the database necessary to run the visualization, do the following:

1. Download the MPC orbital data:
   1. Get the data from
      [here](https://www.minorplanetcenter.net/iau/MPCORB/MPCORB.DAT.gz).
   2. Move the orbital data to `raw`:

        ```console
        mv ~/Downloads/MPCORB.DAT.gz database/raw/.  # Assumes Downloads directory
        gunzip database/raw/MPCORB.DAT.gz
        ```

2. Download the MPC observations data:
   1. Get the data from
      [here](https://www.minorplanetcenter.net/iau/ECS/MPCAT-OBS/NumObs.txt.gz).
   2. Move the observation data to `raw`:

        ```console
        mv ~/Downloads/NumObs.txt.gz database/raw/.  # Assumes Downloads directory
        gunzip database/raw/NumObs.txt.gz
        ```

3. Download the MPC surveys data:
    1. Get the data from
       [here](https://www.minorplanetcenter.net/iau/lists/ObsCodes.html). (Must
       save the page as a local file.)
    2. Move the survey data to `raw`:

        ```console
        mv ~/Downloads/ObsCodes.html database/raw/.  # Assumes Downloads directory
        ```

4. Run the data parsing script (this will take some time):

    ```console
    source venv/bin/activate  # Ensure the venv is active
    python database/scripts/parse_data.py
    ```

See the `database` README.md for details on table formats.

### Run

To start the server, activate the virtual environment and simply run:

```console
flask --app app run
```

The server will be started on `localhost:5000`

## API

Endpoints for the api are:

* `/api/meta`: Metadata. Returns:
  * `asteroids`: Dict containing:
    * `n`: The number of asteroids.
* `/api/asteroids`: All asteroids. Returns:
  * `asteroids`: List where each element is a dict containing:
    * `pos`: Dict containing:
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
* `/api/asteroids/<asteroid_id>`: Asteroid specific metadata. Returns:
  * `name`: The name of the asteroid, "Un-Named" if not set in the MPC data.
  * `number`: Packed 5 digit numerical designation of the asteroid.
  * `provisional`: Packed 7 digit provisional designation of the asteroid.
  * `survey`: The name of the survey that discovered the asteroid.
  * `surveyId`: The ID of the survey that discovered the asteroid.
  * `time`: Dict containing:
    * `year`: Year of discovery.
    * `month`: Month of discovery.
    * `Day`: Day of discovery.
  * `pos`: Dict containing:
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
* `/api/surveys`: All surveys. Returns:
  * `surveys`: Dict containing:
    * `{survey_id}`: `{Associated survey name}`
* `/api/surveys/<survey_id>`: Survey asteroids (NOTE: Takes survey ID, *not*
  survey name, as parameter. Survey ID is a three letter string.) Returns:
  * `asteroids`: List of asteroid ids that are linked to the survey.
