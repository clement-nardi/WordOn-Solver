#!/bin/env python3

# given a list of words that the dictionary must contain and a list of words that the dictionary must not contain, 
# find which dictionary is the most likely to be used by the game

import argparse
import re
import glob


if __name__ == '__main__':
    # *.max7
    dico_files = glob.glob('*.max7')
    print(dico_files)

    dico_must_include = []
    dico_must_not_include = []

    with open('dico_include_exclude.list', 'r') as f:
        dico_requirements = f.read().splitlines()
        for requirement in dico_requirements:
            if requirement.startswith('!'):
                dico_must_not_include.append(requirement[1:].lower())
            else:
                dico_must_include.append(requirement.lower())
    
    print(dico_must_include)
    print(dico_must_not_include)

    for dico_file in dico_files:
        with open(dico_file, 'r') as f:
            words = f.read().splitlines()
            nb_missing = 0
            nb_too_much = 0
            for inc in dico_must_include:
                if inc not in words:
                    nb_missing += 1
            for exc in dico_must_not_include:
                if exc in words:
                    nb_too_much += 1
            print(f"{len(words)} words \tmiss {nb_missing} - too much {nb_too_much} : {dico_file}")


