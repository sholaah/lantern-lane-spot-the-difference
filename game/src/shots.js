// Screenshot presets: deterministic states the maker (and the kit's
// shot runner) can open with a query string, so every screenshot is a
// real render of the game's own code in a known state.
//
//   ?shot=start                title screen
//   ?shot=play&level=1&found=3 level 1 mid-game, first 3 differences found
//   ?shot=play&level=2&found=2 level 2 mid-game, first 2 differences found
//   ?shot=win&level=1          level 1 cleared, three stars
//   ?shot=complete             all three levels cleared

import { LEVELS } from './levels.js';

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    shot: params.get('shot') ?? null,
    level: Math.max(1, Math.min(3, Number(params.get('level') ?? 1) || 1)),
    found: Math.max(0, Number(params.get('found') ?? 0) || 0),
  };
}

export function applyShot(state, shot) {
  if (!shot.shot) return false;
  const levelIndex = shot.level - 1;
  const level = LEVELS[levelIndex];
  if (shot.shot === 'start') {
    state.mode = 'title';
    state.selectedLevel = null;
    return true;
  }
  if (shot.shot === 'play') {
    state.mode = 'playing';
    state.levelIndex = levelIndex;
    state.level = level;
    state.timeLeft = 123;
    state.score = 0;
    state.streak = 0;
    state.hintsLeft = 3;
    state.found = new Set(level.differences.slice(0, shot.found).map((d) => d.id));
    const foundList = level.differences.slice(0, shot.found);
    state.score = foundList.length * 100;
    state.streak = foundList.length;
    state.lastFound = foundList.length ? foundList[foundList.length - 1].id : null;
    state.lastFoundAt = 0;
    return true;
  }
  if (shot.shot === 'win') {
    state.mode = 'level-clear';
    state.levelIndex = levelIndex;
    state.level = level;
    state.found = new Set(level.differences.map((d) => d.id));
    state.stars = 3;
    state.timeBonus = 180;
    state.levelScore = 980;
    state.score = 980;
    state.levelClearedName = level.name;
    state.isLastLevel = levelIndex === LEVELS.length - 1;
    return true;
  }
  if (shot.shot === 'complete') {
    state.mode = 'game-clear';
    state.score = 2740;
    state.bestStreak = 8;
    state.hintsUsed = 1;
    return true;
  }
  return false;
}
