# Server

The backend server for the asteroids visualization.

## Env

Before running any scripts:

1. (Recommended) Setup and activate a virtual environment:

```
cd server/
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```
pip install -r requirements.txt
```

## Data

To generate the data necessary to run the visualization, do the following:

1. Download the MPC orbital data:
   1. Get the data from
      [here](https://www.minorplanetcenter.net/iau/MPCORB/MPCORB.DAT.gz).
   2. Move the orbital data to `raw`:

    ```
    mv ~/Downloads/MPCORB.DAT.gz database/raw/.  # Assumes Downloads directory
    gunzip database/raw/MPCORB.DAT.gz
    ```

2. Download the MPC observations data:
   1. Get the data from
      [here](https://www.minorplanetcenter.net/iau/ECS/MPCAT-OBS/NumObs.txt.gz).
   2. Move the observation data to `raw`:

    ```
    mv ~/Downloads/NumObs.txt.gz database/raw/.  # Assumes Downloads directory
    gunzip database/raw/NumObs.txt.gz
    ```

3. Download the MPC surveys data:
    1. Get the data from
       [here](https://www.minorplanetcenter.net/iau/lists/ObsCodes.html). (Must
       save the page as a local file.)
    2. Move the survey data to `raw`:

    ```
    mv ~/Downloads/ObsCodes.html database/raw/.  # Assumes Downloads directory
    ```

4. Run the data parsing script (this will take some time):

```
source venv/bin/activate  # Ensure the venv is active
python database/scripts/parse_data.py
```

See the database README.md for details on table formats.

## Run

## API
