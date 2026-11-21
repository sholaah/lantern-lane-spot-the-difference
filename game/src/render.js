// Renderer: lays the two panels out on the canvas and paints everything
// the player sees — the scenes, the found-difference rings, the keyboard
// cursor, the hint pulse, and the title / clear / time-up overlays.

import { PANEL_W, PANEL_H, LEVELS } from './levels.js';
import { SCENE_PAINTERS } from './scenes.js';
import { circle, drawStar, roundRect } from './art.js';

const GAP = 28;
const MARGIN = 18;
const LABEL_H = 30;

export function computeLayout(canvasW, canvasH) {
  const availW = canvasW - MARGIN * 2 - GAP;
  const availH = canvasH - MARGIN * 2 - LABEL_H;
  const scale = Math.min(availW / (PANEL_W * 2), availH / PANEL_H, 1.15);
  const w = PANEL_W * scale;
  const h = PANEL_H * scale;
  const totalW = w * 2 + GAP;
  const x0 = (canvasW - totalW) / 2;
  const y0 = MARGIN + LABEL_H + (availH - h) / 2;
  return {
    scale,
    panels: [
      { x: x0, y: y0, w, h },
      { x: x0 + w + GAP, y: y0, w, h },
    ],
    labelY: y0 - 26,
  };
}

function drawPanelLabel(ctx, layout, index, text, sub) {
  const p = layout.panels[index];
  ctx.fillStyle = '#f7ead2';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = index === 0 ? 'left' : 'right';
  ctx.textBaseline = 'alphabetic';
  const x = index === 0 ? p.x : p.x + p.w;
  ctx.fillText(text, x, layout.labelY);
  ctx.fillStyle = 'rgba(247, 234, 210, 0.65)';
  ctx.font = 'italic 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(sub, p.x + p.w / 2, layout.labelY + 16);
}

function drawFoundRing(ctx, px, py, scale, fresh, now) {
  const r = 26 * scale * (fresh ? 1 + 0.12 * Math.sin(now / 90) : 1);
  ctx.strokeStyle = fresh ? '#ff5a3c' : '#e25f4b';
  ctx.lineWidth = 4;
  circle(ctx, px, py, r);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  circle(ctx, px, py, r - 5);
  ctx.stroke();
  // check mark
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(px - 10 * scale, py);
  ctx.lineTo(px - 2 * scale, py + 8 * scale);
  ctx.lineTo(px + 11 * scale, py - 9 * scale);
  ctx.stroke();
}

function drawWrongMark(ctx, px, py, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ff3b30';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const r = 13 * scale;
  ctx.beginPath();
  ctx.moveTo(px - r, py - r);
  ctx.lineTo(px + r, py + r);
  ctx.moveTo(px + r, py - r);
  ctx.lineTo(px - r, py + r);
  ctx.stroke();
  ctx.restore();
}

function drawHintRing(ctx, px, py, scale, now) {
  const pulse = 1 + 0.18 * Math.sin(now / 110);
  ctx.strokeStyle = '#ffd76e';
  ctx.lineWidth = 4;
  circle(ctx, px, py, 30 * scale * pulse);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 215, 110, 0.5)';
  ctx.lineWidth = 2;
  circle(ctx, px, py, 38 * scale * pulse);
  ctx.stroke();
}

function drawCursor(ctx, layout, cursor, scale) {
  if (!cursor.visible) return;
  const p = layout.panels[cursor.panel];
  const px = p.x + (cursor.x / PANEL_W) * p.w;
  const py = p.y + (cursor.y / PANEL_H) * p.h;
  const r = 16 * scale;
  ctx.strokeStyle = '#ffd76e';
  ctx.lineWidth = 2.5;
  circle(ctx, px, py, r);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px - r - 7, py);
  ctx.lineTo(px - r + 3, py);
  ctx.moveTo(px + r - 3, py);
  ctx.lineTo(px + r + 7, py);
  ctx.moveTo(px, py - r - 7);
  ctx.lineTo(px, py - r + 3);
  ctx.moveTo(px, py + r - 3);
  ctx.lineTo(px, py + r + 7);
  ctx.stroke();
}

function paintSceneInto(ctx, layout, index, level, mods) {
  const p = layout.panels[index];
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x, p.y, p.w, p.h);
  ctx.clip();
  ctx.translate(p.x, p.y);
  ctx.scale(p.w / PANEL_W, p.h / PANEL_H);
  SCENE_PAINTERS[level.id](ctx, mods);
  ctx.restore();
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 3;
  ctx.strokeRect(p.x, p.y, p.w, p.h);
}

function panelPoint(layout, panel, diff) {
  const p = layout.panels[panel];
  return {
    x: p.x + (diff.x / PANEL_W) * p.w,
    y: p.y + (diff.y / PANEL_H) * p.h,
  };
}

export function renderGame(ctx, canvasW, canvasH, state, now) {
  const layout = computeLayout(canvasW, canvasH);
  const level = state.level;
  const allMods = new Set(level.differences.map((d) => d.id));

  // backdrop
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(0, 0, canvasW, canvasH);

  paintSceneInto(ctx, layout, 0, level, new Set());
  paintSceneInto(ctx, layout, 1, level, allMods);
  drawPanelLabel(ctx, layout, 0, '◀  PICTURE A', 'the original');
  drawPanelLabel(ctx, layout, 1, 'PICTURE B  ▶', 'spot what changed');

  // markers for found differences, on both panels
  for (const diff of level.differences) {
    if (!state.found.has(diff.id)) continue;
    const fresh = state.lastFound === diff.id && now - state.lastFoundAt < 900;
    for (let i = 0; i < 2; i++) {
      const pt = panelPoint(layout, i, diff);
      drawFoundRing(ctx, pt.x, pt.y, layout.scale, fresh, now);
    }
  }
  // hint pulse
  if (state.hint && now < state.hint.until) {
    for (let i = 0; i < 2; i++) {
      const pt = panelPoint(layout, i, state.hint.diff);
      drawHintRing(ctx, pt.x, pt.y, layout.scale, now);
    }
  }
  // wrong-click flashes
  for (const w of state.wrongs) {
    const age = now - w.at;
    if (age > 700) continue;
    const pt = panelPoint(layout, w.panel, { x: w.x, y: w.y });
    drawWrongMark(ctx, pt.x, pt.y, layout.scale, 1 - age / 700);
  }
  drawCursor(ctx, layout, state.cursor, layout.scale);
  return layout;
}

// ------------------------------------------------------------ overlays
function dim(ctx, w, h, alpha = 0.72) {
  ctx.fillStyle = `rgba(20, 12, 8, ${alpha})`;
  ctx.fillRect(0, 0, w, h);
}

function centred(ctx, w, y, text, font, color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, w / 2, y);
}

function goldButton(ctx, w, y, label) {
  const bw = 260;
  const bh = 52;
  const x = w / 2 - bw / 2;
  ctx.fillStyle = '#d9a441';
  roundRect(ctx, x, y, bw, bh, 12);
  ctx.fill();
  ctx.strokeStyle = '#a97a1f';
  ctx.lineWidth = 2;
  ctx.stroke();
  centred(ctx, w, y + 35, label, 'bold 22px Georgia, serif', '#241a12');
}

export function renderTitle(ctx, w, h, state) {
  ctx.fillStyle = '#f7ead2';
  ctx.fillRect(0, 0, w, h);
  // decorative lanterns along the top
  ctx.fillStyle = '#8c2f26';
  ctx.fillRect(0, 0, w, 10);
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * ((w - 120) / 8);
    ctx.strokeStyle = '#5a3a22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x, 34);
    ctx.stroke();
    ctx.fillStyle = i % 2 === 0 ? '#d94f3d' : '#e8a13c';
    ctx.beginPath();
    ctx.ellipse(x, 48, 15, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  centred(ctx, w, 150, '🏮  LANTERN LANE  🏮', 'bold 54px Georgia, serif', '#8c2f26');
  centred(ctx, w, 192, 'S P O T   T H E   D I F F E R E N C E', 'bold 26px Georgia, serif', '#1f6f6b');
  centred(ctx, w, 226, 'Two pictures. Eight hidden changes. One sharp eye.', 'italic 19px Georgia, serif', '#7a5c3e');
  centred(ctx, w, 262, 'Click a difference on either picture — a ring marks it on both. Wrong clicks cost points.', '16px Georgia, serif', '#5a4632');

  // level cards
  const cardW = 300;
  const cardH = 150;
  const gap = 26;
  const total = cardW * 3 + gap * 2;
  const x0 = (w - total) / 2;
  const y0 = 300;
  LEVELS.forEach((level, i) => {
    const x = x0 + i * (cardW + gap);
    const selected = state.selectedLevel === i;
    ctx.fillStyle = selected ? '#fff8ea' : '#efe0c0';
    roundRect(ctx, x, y0, cardW, cardH, 14);
    ctx.fill();
    ctx.strokeStyle = selected ? '#c0392b' : '#c9ab72';
    ctx.lineWidth = selected ? 4 : 2;
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8c2f26';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText(`${i + 1}. ${level.name}`, x + 20, y0 + 40);
    ctx.fillStyle = '#5a4632';
    ctx.font = 'italic 15px Georgia, serif';
    ctx.fillText(level.subtitle, x + 20, y0 + 66);
    ctx.fillStyle = '#d9a441';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('★'.repeat(level.difficulty) + '☆'.repeat(3 - level.difficulty), x + 20, y0 + 98);
    ctx.fillStyle = '#1f6f6b';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText('8 differences · 2:30', x + 20, y0 + 124);
  });
  goldButton(ctx, w, 486, state.selectedLevel == null ? '▶  START THE HUNT' : `▶  PLAY — ${LEVELS[state.selectedLevel].name.toUpperCase()}`);
  centred(ctx, w, 576, 'Click a level card, then Start — or press 1, 2 or 3 and Enter.', '15px Georgia, serif', '#7a5c3e');
  centred(ctx, w, 604, 'Best score wins the lantern. Hints cost 50 points — use them wisely.', 'italic 15px Georgia, serif', '#7a5c3e');
  return null;
}

export function renderLevelClear(ctx, w, h, state) {
  dim(ctx, w, h, 0.66);
  const boxW = 560;
  const boxH = 330;
  const x = w / 2 - boxW / 2;
  const y = h / 2 - boxH / 2;
  ctx.fillStyle = '#fff8ea';
  roundRect(ctx, x, y, boxW, boxH, 18);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  ctx.stroke();
  const stars = state.stars;
  centred(ctx, w, y + 70, '★'.repeat(stars) + '☆'.repeat(3 - stars), '44px Georgia, serif', '#d9a441');
  centred(ctx, w, y + 122, state.levelClearedName, 'bold 30px Georgia, serif', '#8c2f26');
  centred(ctx, w, y + 160, 'All 8 differences found!', '18px Georgia, serif', '#5a4632');
  centred(ctx, w, y + 196, `Time bonus +${state.timeBonus}   ·   Level score ${state.levelScore}`, '18px Georgia, serif', '#1f6f6b');
  centred(ctx, w, y + 228, `Total score ${state.score}`, 'bold 20px Georgia, serif', '#2b2118');
  goldButton(ctx, w, y + 250, state.isLastLevel ? '🏆  SEE FINAL RESULTS' : '▶  NEXT LEVEL');
}

export function renderGameClear(ctx, w, h, state) {
  dim(ctx, w, h, 0.66);
  const boxW = 600;
  const boxH = 360;
  const x = w / 2 - boxW / 2;
  const y = h / 2 - boxH / 2;
  ctx.fillStyle = '#fff8ea';
  roundRect(ctx, x, y, boxW, boxH, 18);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  ctx.stroke();
  centred(ctx, w, y + 66, '🏮  HUNT COMPLETE  🏮', 'bold 34px Georgia, serif', '#8c2f26');
  centred(ctx, w, y + 106, 'You found all 24 differences across three scenes.', '18px Georgia, serif', '#5a4632');
  centred(ctx, w, y + 150, `FINAL SCORE  ${state.score}`, 'bold 28px Georgia, serif', '#1f6f6b');
  centred(ctx, w, y + 188, `Best streak ${state.bestStreak} finds in a row  ·  Hints used ${state.hintsUsed}`, '16px Georgia, serif', '#5a4632');
  const verdict = state.score >= 2600 ? 'Master Spotter — the lanterns bow to you.'
    : state.score >= 2000 ? 'Sharp Eye — the market remembers your name.'
    : 'Good hunting — come back and beat your score!';
  centred(ctx, w, y + 222, verdict, 'italic 18px Georgia, serif', '#7a5c3e');
  goldButton(ctx, w, y + 258, '↻  PLAY AGAIN');
}

export function renderTimeUp(ctx, w, h, state) {
  dim(ctx, w, h, 0.66);
  const boxW = 520;
  const boxH = 280;
  const x = w / 2 - boxW / 2;
  const y = h / 2 - boxH / 2;
  ctx.fillStyle = '#fff8ea';
  roundRect(ctx, x, y, boxW, boxH, 18);
  ctx.fill();
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 3;
  ctx.stroke();
  centred(ctx, w, y + 66, '⏰  TIME’S UP', 'bold 34px Georgia, serif', '#8c2f26');
  centred(ctx, w, y + 110, `You found ${state.found.size} of 8 differences in ${state.level.name}.`, '18px Georgia, serif', '#5a4632');
  centred(ctx, w, y + 144, 'The market closes — but the lanterns stay lit.', 'italic 17px Georgia, serif', '#7a5c3e');
  goldButton(ctx, w, y + 176, '↻  TRY THIS LEVEL AGAIN');
}
