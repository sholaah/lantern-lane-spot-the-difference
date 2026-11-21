# 🏮 Lantern Lane — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sholaah/lantern-lane-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sholaah/lantern-lane-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game that plays offline in a desktop browser. Two near-identical hand-drawn pictures side by side, eight hidden differences per scene, three scenes to clear — built for the [make.fun "Make the best spot the difference game" bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) ($50 prize pool).

## The game

- **Three original scenes**, all art drawn in code (no copied assets): Night Market, Koi Pond Garden, and Lighthouse Coast — 24 differences in total, each fair but well hidden.
- **Two panels, one hunt**: click a difference on either picture and a red ring with a check mark appears on both. The counter shows how many remain.
- **Time pressure**: 2:30 per level, with a ticking clock, a score that rewards streaks, and a 3-star rating per level.
- **Hints**: press `H` (or the Hint button) to pulse a hidden difference — costs 50 points, 3 per level.
- **Keyboard play**: arrow keys move the cursor, `Enter` marks a spot, `Tab` jumps between panels, `R` restarts, `Esc` returns to the menu.
- **Sound**: every effect is synthesized with WebAudio — a chime on each find, a thud on a miss, an arpeggio on a clear. No audio files, no network requests. `M` mutes.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no dependencies: `game/index.html` plus its ES modules, served by any static host.

## Layout

| File | Job |
| --- | --- |
| `main.ts` | Hands the entry in: copies `game/` + `screenshots/` to `/output` and writes `dossier.json` |
| `game/index.html` | Page shell: header HUD (level, counter, timer, score, hint) + canvas |
| `game/src/main.js` | Game state, frame loop, scoring, timer, screen wiring |
| `game/src/levels.js` | The three levels and their 8 differences each (position, radius, hint text) |
| `game/src/scenes.js` | The scene painters — each draws its picture twice, once plain, once changed |
| `game/src/art.js` | Shared brush helpers: lanterns, cats, stalls, clouds, stars |
| `game/src/render.js` | Panel layout, found rings, hint pulse, title / clear / time-up screens |
| `game/src/input.js` | Mouse clicks and the keyboard cursor |
| `game/src/audio.js` | Synthesized WebAudio sounds |
| `game/src/shots.js` | Deterministic `?shot=` states used to take the screenshots |
| `screenshots/` | Real renders of the game's own code in a desktop browser |
| `vendor/makefun-game.ts` | The kit's dossier library, unchanged |

## License

MIT — see [LICENSE](LICENSE).
