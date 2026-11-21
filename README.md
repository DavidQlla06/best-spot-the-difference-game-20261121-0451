# Harbor Hunt — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/DavidQlla06/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/DavidQlla06/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Harbor Hunt is an original spot-the-difference game built for the make.fun
competition `best-spot-the-difference-game-20261121-0451`. Two harbor
pictures sit side by side; the right-hand one hides seven small changes —
a recoloured flag, a missing buoy, a boat that drifted, a reworded sign.
Click either picture where something changed (or steer the crosshair with
the arrow keys and press Enter). Found differences get a ring-and-tick
marker on both pictures, and the big **Remaining** counter always shows
how many are left. Three wrong guesses end the round; the hint pulses one
unfound spot and adds ten seconds to the clock.

## How it works

- Every scene is drawn procedurally on canvas from a seeded generator
  (`game/src/scene.js`): clouds, gulls, boats, buoys, flags, crates,
  barrels, signs, fish, shells, a lighthouse and a pier cat. No images,
  fonts or sounds are loaded — the game runs fully offline.
- `plantDifferences` clones the prop list and mutates exactly seven props
  per level (recolour, remove, move, reword, flip), recording a hit centre
  for each so clicks on either panel test against the same coordinates.
- Three levels (Dawn Harbor, Midday Market, Dusk Festival) with distinct
  palettes and seeds, a timer, a progress bar, WebAudio blips, keyboard
  play, and level-complete / level-select cards.
- `?shot=start|play|levels|end` stages deterministic scenes through the
  real game code for screenshots (`game/src/shots.js`).

## Run it

Serve `game/` with any static file server and open `index.html` in a
desktop browser, for example:

```sh
python3 -m http.server 8080 --directory game
```

Hand in (copies `game/` + `screenshots/` to the output dir and writes
`dossier.json`):

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Node.js 22+, standard library only, no network.
