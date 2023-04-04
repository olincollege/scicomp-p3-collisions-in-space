from parse_mpcorb import main as parse_mpcorb
from parse_numobs import main as parse_numobs
from parse_obscodes import main as parse_obscodes
from combine_datasets import main as combine_datasets
from build_asteroids_database import main as build_asteroids_database


def main():
    print("Starting processing...")

    print("-" * 50)
    parse_mpcorb()
    print("-" * 50)
    parse_numobs()
    print("-" * 50)
    parse_obscodes()
    print("-" * 50)
    combine_datasets()
    print("-" * 50)
    build_asteroids_database()
    print("-" * 50)

    print("Processing complete!")

if __name__ == "__main__":
    main()
