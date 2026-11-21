// Lantern Lane — main controller: game state, the frame loop, scoring,
// the timer, and the wiring between the header, the input and the renderer.
// The game is fully offline: every picture is drawn by scenes.js at run
// time and every sound is synthesized by audio.js.

import { LEVELS, PANEL_W, PANEL_H } from './levels.js';
import { Input } from './input.js';
import { computeLayout, renderGame, renderGameClear, renderLevelClear, renderTimeUp, renderTitle } from './render.js';
import { applyShot, readShotParams } from './shots.js';
import { ensureAudio, isMuted, playFound, playHint, playTick, playWin, playWrong, setMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const hudLevel = document.getElementById('hud-level');
const hudFound = document.getElementById('hud-found');
const hudTime = document.getElementById('hud-time');
const hudScoreNum = document.getElementById('hud-score-num');
const btnHint = document.getElementById('btn-hint');
const btnSound = document.getElementById('btn-sound');

const state = {
  mode: 'title', // title | playing | level-clear | game-clear | time-up
  selectedLevel: null,
  levelIndex: 0,
  level: LEVELS[0],
  found: new Set(),
  score: 0,
  streak: 0,
  bestStreak: 0,
  hintsUsed: 0,
  hintsLeft: 3,
  timeLeft: LEVELS[0].timeLimit,
  lastFound: null,
  lastFoundAt: 0,
  wrongs: [],
  hint: null,
  cursor: { panel: 0, x: PANEL_W / 2, y: PANEL_H / 2, visible: false },
  stars: 0,
  timeBonus: 0,
  levelScore: 0,
  levelClearedName: '',
  isLastLevel: false,
  layout: null,
};

let lastFrameAt = performance.now();
let lastTickSecond = -1;

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function updateHud() {
  hudLevel.textContent = `Level ${state.levelIndex + 1} · ${state.level.name}`;
  hudFound.textContent = `Found ${state.found.size} / ${state.level.differences.length}`;
  hudTime.textContent = `⏱ ${formatTime(state.timeLeft)}`;
  hudTime.classList.toggle('low', state.mode === 'playing' && state.timeLeft <= 30);
  hudScoreNum.textContent = String(state.score);
  btnHint.disabled = state.mode !== 'playing' || state.hintsLeft <= 0 || state.found.size >= state.level.differences.length;
  btnHint.textContent = `💡 Hint (H) · ${state.hintsLeft}`;
  btnSound.textContent = isMuted() ? '🔇' : '🔊';
  statusEl.textContent =
    state.mode === 'playing'
      ? `${state.found.size} of ${state.level.differences.length} differences found in ${state.level.name}. ${formatTime(state.timeLeft)} left.`
      : state.mode === 'title'
        ? 'Lantern Lane title screen. Choose a level and start the hunt.'
        : '';
}

function startLevel(index) {
  state.levelIndex = index;
  state.level = LEVELS[index];
  state.found = new Set();
  state.streak = 0;
  state.hintsLeft = 3;
  state.timeLeft = state.level.timeLimit;
  state.lastFound = null;
  state.wrongs = [];
  state.hint = null;
  state.mode = 'playing';
  lastTickSecond = -1;
  updateHud();
}

function requestHint() {
  if (state.mode !== 'playing' || state.hintsLeft <= 0) return;
  const remaining = state.level.differences.filter((d) => !state.found.has(d.id));
  if (!remaining.length) return;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - 50);
  state.hint = { diff, until: performance.now() + 3000 };
  playHint();
  updateHud();
}

function markSpot(x, y, panel) {
  if (state.mode !== 'playing') return;
  ensureAudio();
  let best = null;
  let bestDist = Infinity;
  for (const diff of state.level.differences) {
    if (state.found.has(diff.id)) continue;
    const dist = Math.hypot(diff.x - x, diff.y - y);
    if (dist < diff.r && dist < bestDist) {
      best = diff;
      bestDist = dist;
    }
  }
  if (best) {
    state.found.add(best.id);
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.score += 100 + (state.streak - 1) * 10;
    state.lastFound = best.id;
    state.lastFoundAt = performance.now();
    playFound();
    if (state.found.size === state.level.differences.length) {
      const timeBonus = Math.round(state.timeLeft) * 2;
      state.timeBonus = timeBonus;
      state.levelScore = state.found.size * 100 + timeBonus;
      state.score += timeBonus;
      state.stars = state.timeLeft >= 75 ? 3 : state.timeLeft >= 40 ? 2 : 1;
      state.levelClearedName = state.level.name;
      state.isLastLevel = state.levelIndex === LEVELS.length - 1;
      state.mode = 'level-clear';
      playWin();
    }
  } else {
    state.streak = 0;
    state.score = Math.max(0, state.score - 25);
    state.wrongs.push({ x, y, panel, at: performance.now() });
    if (state.wrongs.length > 6) state.wrongs.shift();
    playWrong();
  }
  updateHud();
}

function nextAfterClear() {
  if (state.isLastLevel) {
    state.mode = 'game-clear';
  } else {
    startLevel(state.levelIndex + 1);
  }
  updateHud();
}

function backToTitle() {
  state.mode = 'title';
  state.selectedLevel = null;
  state.score = 0;
  state.bestStreak = 0;
  state.hintsUsed = 0;
  state.levelIndex = 0;
  state.level = LEVELS[0];
  state.found = new Set();
  updateHud();
}

// Title-screen and overlay clicks use raw canvas coordinates.
function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function titleCardAt(x, y) {
  const w = canvas.clientWidth;
  const cardW = 300;
  const cardH = 150;
  const gap = 26;
  const total = cardW * 3 + gap * 2;
  const x0 = (w - total) / 2;
  const y0 = 300;
  if (y < y0 || y > y0 + cardH) return -1;
  for (let i = 0; i < 3; i++) {
    const cx = x0 + i * (cardW + gap);
    if (x >= cx && x <= cx + cardW) return i;
  }
  return -1;
}

function titleButtonAt(x, y) {
  const w = canvas.clientWidth;
  return x >= w / 2 - 130 && x <= w / 2 + 130 && y >= 486 && y <= 538;
}

function overlayButtonAt(x, y) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const boxH = state.mode === 'game-clear' ? 360 : state.mode === 'level-clear' ? 330 : 280;
  const boxY = h / 2 - boxH / 2;
  const btnY = boxY + (state.mode === 'game-clear' ? 258 : state.mode === 'level-clear' ? 250 : 176);
  return x >= w / 2 - 130 && x <= w / 2 + 130 && y >= btnY && y <= btnY + 52;
}

canvas.addEventListener('pointerdown', (event) => {
  if (state.mode === 'title') {
    const { x, y } = canvasPoint(event);
    const card = titleCardAt(x, y);
    if (card >= 0) {
      state.selectedLevel = card;
      return;
    }
    if (titleButtonAt(x, y)) {
      ensureAudio();
      startLevel(state.selectedLevel ?? 0);
    }
    return;
  }
  if (state.mode === 'level-clear' || state.mode === 'game-clear' || state.mode === 'time-up') {
    const { x, y } = canvasPoint(event);
    if (!overlayButtonAt(x, y)) return;
    ensureAudio();
    if (state.mode === 'level-clear') nextAfterClear();
    else if (state.mode === 'game-clear') backToTitle();
    else startLevel(state.levelIndex);
  }
});

window.addEventListener('keydown', (event) => {
  if (state.mode === 'title') {
    if (event.key >= '1' && event.key <= '3') {
      state.selectedLevel = Number(event.key) - 1;
      return;
    }
    if (event.key === 'Enter') {
      ensureAudio();
      startLevel(state.selectedLevel ?? 0);
    }
  } else if ((state.mode === 'level-clear' || state.mode === 'game-clear' || state.mode === 'time-up') && event.key === 'Enter') {
    ensureAudio();
    if (state.mode === 'level-clear') nextAfterClear();
    else if (state.mode === 'game-clear') backToTitle();
    else startLevel(state.levelIndex);
  }
});

const input = new Input(canvas, {
  panelSize: { PANEL_W, PANEL_H },
  layout: () => (state.mode === 'playing' ? state.layout : null),
  onMark: (x, y, panel) => markSpot(x, y, panel),
  onKey: (action) => {
    if (action === 'hint') requestHint();
    else if (action === 'restart' && state.mode === 'playing') startLevel(state.levelIndex);
    else if (action === 'menu') backToTitle();
    else if (action === 'mute') {
      setMuted(!isMuted());
      updateHud();
    }
  },
});
state.cursor = input.cursor;

btnHint.addEventListener('click', () => {
  ensureAudio();
  requestHint();
});
btnSound.addEventListener('click', () => {
  setMuted(!isMuted());
  updateHud();
});

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function frame(now) {
  const dt = Math.min(0.1, (now - lastFrameAt) / 1000);
  lastFrameAt = now;
  if (state.mode === 'playing') {
    state.timeLeft -= dt;
    const whole = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10 && whole !== lastTickSecond && state.timeLeft > 0) {
      lastTickSecond = whole;
      playTick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.mode = 'time-up';
      updateHud();
    }
  }
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (state.mode === 'title') {
    state.layout = renderTitle(ctx, w, h, state);
  } else {
    state.layout = renderGame(ctx, w, h, state, now);
    if (state.mode === 'level-clear') renderLevelClear(ctx, w, h, state);
    else if (state.mode === 'game-clear') renderGameClear(ctx, w, h, state);
    else if (state.mode === 'time-up') renderTimeUp(ctx, w, h, state);
  }
  requestAnimationFrame(frame);
}

applyShot(state, readShotParams());
updateHud();
requestAnimationFrame(frame);

// Test hook only: lets an automated play-test read the live state and the
// panel layout without touching the game. It makes no network request.
window.__lanternLane = { state, input, layout: () => state.layout };
