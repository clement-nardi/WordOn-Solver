#!/bin/env python3

# WordON Solver

# CLI Arguments
import argparse
import re


def process_words(opponent_letters, player_letters, board_layout):
    possible_words = []
    print(f"Opponent Letters: '{opponent_letters}', Player Letters: '{player_letters}', Board Layout: '{board_layout}'")
    with open('ods6.txt.max7') as f:
        words = f.read().splitlines()
        for word in words:
            score, given_letters, kept_letters = process_word(word, opponent_letters, player_letters, board_layout)
            # print(f"Word: {word}, Score: {score}, Given Letters: '{given_letters}', Kept Letters: '{kept_letters}'")
            if score is not None:
                possible_words.append([word, score, given_letters, kept_letters])
    return possible_words

letter_score = {
    "a" : 1,
    "b" : 3,
    "c" : 3,
    "d" : 2,
    "e" : 1,
    "f" : 4,
    "g" : 2,
    "h" : 4,
    "i" : 1,
    "j" : 8,
    "k" : 10,
    "l" : 1,
    "m" : 2,
    "n" : 1,
    "o" : 1,
    "p" : 3,
    "q" : 8,
    "r" : 1,
    "s" : 1,
    "t" : 1,
    "u" : 1,
    "v" : 4,
    "w" : 10,
    "x" : 10,
    "y" : 10,
    "z" : 10,
    "*" : 0
}

def process_word(word, opponent_letters, player_letters, board_layout):
    given_letters = ''
    kept_letters = ''
    score = 0
    # Check if the word can be formed with the given letters
    letter_idx = 0
    for letter in word.lower():
        joker = False
        if letter in opponent_letters:
            opponent_letters = opponent_letters.replace(letter, '', 1)
        elif letter in player_letters:
            player_letters = player_letters.replace(letter, '', 1)
        elif '*' in opponent_letters:
            opponent_letters = opponent_letters.replace('*', '', 1)
            joker = True
        elif '*' in player_letters:
            player_letters = player_letters.replace('*', '', 1)
            joker = True
        else:
            return None, '', ''
        played_letter = '*' if joker else letter
        if board_layout[letter_idx] == 'w':
            given_letters += played_letter
        
        board_card = board_layout[letter_idx]
        if board_card == '2':
            score += 2 * letter_score[played_letter]
        elif board_card == '3':
            score += 3 * letter_score[played_letter]
        elif board_card == '+':
            score += 10
            score += letter_score[played_letter]
        else:
            score += letter_score[played_letter]
        letter_idx += 1
    
    if len(opponent_letters) == 0:
        score *= 2
    for letter in opponent_letters:
        score -= letter_score[letter]
    kept_letters = player_letters

    return score, given_letters, kept_letters


if __name__ == '__main__':
    # User pass a long string containing all the needed data:
    # 1. The 0, 1 or 2 letters given by the opponent (" " for absent letter)
    # 2. The 7 letters given to the player (" " for absent letter, "*" for joker)
    # 3. The layout of the board (" " for empty cell, "2" for double letter, "3" for triple letter, "W" for letter sent to opponent, "+" for +10)
    parser = argparse.ArgumentParser(description='WordON Solver')
    parser.add_argument('letters', type=str, help='the 7 letters given to the player (* for joker)')
    parser.add_argument('given_letters', type=str, help='The 0, 1 or 2 letters given by the opponent (* for joker)')
    #optional argument
    parser.add_argument('board_layout', type=str, help='The layout of the board (" " for empty, "2" for 2x, "3" for 3x, "W" for letters sent to the opponent, "+" for +10)', default='      +', nargs='?')
    args = parser.parse_args()

    opponent_letters = args.given_letters.lower()
    player_letters = args.letters.lower()
    board_layout = args.board_layout.lower()
    possible_words = process_words(opponent_letters, player_letters, board_layout)

    if len(re.sub("[a-z* ]", "", opponent_letters)) > 0:
        print(f"Forbidden characters found in given_letters: only a-z, \"*\" and \" \" are allowed: {opponent_letters}")
        exit(1)
    if len(opponent_letters) > 2:
        print(f"Too many given_letters: only 0, 1 or 2 letters are allowed: {opponent_letters}")
        exit(1)
    if len(re.sub("[a-z* ]", "", player_letters)) > 0:
        print(f"Forbidden characters found in letters: only a-z, \"*\" and \" \" are allowed: {player_letters}")
        exit(1)
    if len(player_letters) > 7:
        print(f"Too many letters: max 7 letters are allowed: '{player_letters}'")
        exit(1)
    if len(re.sub("[2 3w+]", "", board_layout)) > 0:
        print(f"Forbidden characters found in board_layout: only \"2\", \"3\", \"w\", \" \" and \"+\" are allowed: {board_layout}")
        exit(1)
    if len(board_layout) != 7:
        print(f"Invalid board_layout: only 7 characters are allowed: '{board_layout}'")
        exit(1)


    # Sort the possible words by score
    possible_words.sort(key=lambda x: x[1])
    for word in possible_words[-20:]:
        print(f"Word: {word[0]}, Score: {word[1]}, Given Letters: '{word[2]}', Kept Letters: '{word[3]}'")

