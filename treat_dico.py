#!/bin/env python3

# given a text file containing a list of words, create another test file containing only words of 7 letters and less

import argparse
import re

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Remove words longer than 7 letters from a dictionary')
    parser.add_argument('input_file', type=str, help='the input file containing the list of words')
    args = parser.parse_args()

    output_file = args.input_file + ".max7"

    with open(args.input_file, 'r') as f:
        words = f.readlines()

        with open(output_file, 'w') as f:
            for word in words:
                if len(word) <= 8:
                    word = word.lower().strip()
                    word = re.sub("[éèêë]", "e", word)
                    word = re.sub("[àâä]", "a", word)
                    word = re.sub("[îï]", "i", word)
                    word = re.sub("[ôö]", "o", word)
                    word = re.sub("[ûüù]", "u", word)
                    word = re.sub("[ç]", "c", word)
                    word = re.sub("[-' .]", "c", word)
                    word = word.replace("œ", "oe")
                    
                    if len(re.sub("[a-z]", "", word)) > 0:
                        print("unexpected character found in word: " + word)
                        exit(1)
                    f.write(word + "\n")