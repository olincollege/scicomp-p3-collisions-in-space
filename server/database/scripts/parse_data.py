from parse_mpcorb import main as parse_mpcorb
from parse_numobs import main as parse_numobs
from parse_obscodes import main as parse_obscodes
from combine_datasets import main as combine_datasets
from build_asteroids_database import main as build_asteroids_database
from build_surveys_database import main as build_surveys_database


def main():
    print("Starting processing...")

    print("-" * 50)
    print("Parsing mpcorb!")
    parse_mpcorb()
    print("-" * 50)
    print("Parsing numobs!")
    parse_numobs()
    print("-" * 50)
    print("Parsing obscodes!")
    parse_obscodes()
    print("-" * 50)
    print("Combining datasets!")
    combine_datasets()
    print("-" * 50)
    print("Building asteroids table!")
    build_asteroids_database()
    print("-" * 50)
    print("Building surveys table!")
    build_surveys_database()
    print("-" * 50)

    print("Processing complete!")

if __name__ == "__main__":
    main()
