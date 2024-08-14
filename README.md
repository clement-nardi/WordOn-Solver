# WordON solver

Based on the ODS 6 for now since I didn't find the official list of words.

# Web version

Available at [wordon.nardi.fr](http://wordon.nardi.fr)

# Python version

## Usage

```
./solve.py -h
usage: solve.py [-h] letters given_letters [board_layout]

WordON Solver

positional arguments:
  letters        the 7 letters given to the player (* for joker)
  given_letters  The 0, 1 or 2 letters given by the opponent (* for joker)
  board_layout   The layout of the board (" " for empty, "2" for 2x, "3" for 3x,
                 "W" for letters sent to the opponent, "+" for +10)

options:
  -h, --help     show this help message and exit
```

## Example usage

```
./solve.py "wetsja*" "PS" "2  W W+"
Opponent Letters: 'ps', Player Letters: 'wetsja*', Board Layout: '2  w w+'
Word: plastes, Score: 42, Given Letters: 'se', Kept Letters: 'wj'
Word: posates, Score: 42, Given Letters: 'ae', Kept Letters: 'wj'
Word: potasse, Score: 42, Given Letters: 'as', Kept Letters: 'wj'
Word: pressat, Score: 42, Given Letters: 'sa', Kept Letters: 'wj'
Word: prestas, Score: 42, Given Letters: 'sa', Kept Letters: 'wj'
Word: putasse, Score: 42, Given Letters: 'as', Kept Letters: 'wj'
Word: jappes, Score: 44, Given Letters: '*s', Kept Letters: 'wts'
Word: jaspas, Score: 44, Given Letters: 'ps', Kept Letters: 'wet'
Word: jaspat, Score: 44, Given Letters: 'pt', Kept Letters: 'wes'
Word: jaspe, Score: 44, Given Letters: 'p', Kept Letters: 'wts*'
Word: jaspee, Score: 44, Given Letters: 'p*', Kept Letters: 'wts'
Word: jasper, Score: 44, Given Letters: 'p*', Kept Letters: 'wts'
Word: jaspez, Score: 44, Given Letters: 'p*', Kept Letters: 'wts'
Word: jaspes, Score: 46, Given Letters: 'ps', Kept Letters: 'wt*'
Word: waps, Score: 50, Given Letters: 's', Kept Letters: 'etsj*'
Word: wasp, Score: 50, Given Letters: 'p', Kept Letters: 'etsj*'
Word: wasps, Score: 52, Given Letters: 'p', Kept Letters: 'etj*'
Word: swappes, Score: 56, Given Letters: 'pe', Kept Letters: 'tj'
Word: jaspees, Score: 66, Given Letters: 'p*', Kept Letters: 'wt'
Word: jaspent, Score: 66, Given Letters: 'p*', Kept Letters: 'ws'
```