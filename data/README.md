# Data

The data necessary for running our simulation.

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
Then, move the file to `raw`, unzip the file and run the following python
script. Note that it may take a few minutes for data to be parsed.

```
mv ~/Downloads/mpcorb_extended.json.gz raw/.  # Assumes Downloads directory
gunzip raw/.
python script/parse_mpcord.py
```

The resulting json object is created as `/processed/orbits.json` and is an array
where each object has the keys:

* `name`: The name of the asteroid, "Un-Named" if not set in the MPC data.
* `id`: Numerical designation of the asteroid.
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
