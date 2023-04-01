# Data

The data necessary for running our simulation.

## Setup

Before running any scripts:

1. (Recommended) Setup and activate a virtual environment:

```
python -m vevn venv
source venv/bin/activate
```

2. Install dependencies:

```
pip install -r requirements.txt
```

See next section for loading each dataset.

## Datasets

All below datasets are required to run this project.

Before running scripts, ensure the venv is activated with

```
source venv/bin/activate
```

### MPC Orbit Data

The MPC orbital data can be downloaded from
[here](https://minorplanetcenter.net/Extended_Files/mpcorb_extended.json.gz).
Then, move the file to `raw`, unzip the file and run the python script:

```
mv ~/Downloads/mpcorb_extended.json.gz raw/.  # Assumes Downloads directory
gunzip raw/.
python script/parse_mpcord.py
```

The resulting json object is an array where each object has the keys:

* name: The name of the asteroid, "Un-Named" if not set in the MPC data.
* id: Numerical designation of the asteroid.
* semi-major: Size of the semi-major axis of the orbit in AU.
* semi-minor: Size of the semi-minor axis of the orbit in AU.
* i: Inclination of the orbit in degrees. (Rotation from the xy-plane.)
* node: Longitude of the ascending node of the orbit in degrees. (Rotation
  around the z-axis.)
* peri: Argument of the periapsis of the orbit in degrees.
* v: True anomaly of the asteroid in degrees.
