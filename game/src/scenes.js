// Scene painters: each draws one original scene into a 620 x 440 panel.
// `mods` is the set of difference ids to render in their "changed" form.
// The left panel always draws with an empty set; the right panel with all
// of the level's differences, so the two pictures differ exactly where the
// level says they should — nowhere else.

import { PANEL_W, PANEL_H } from './levels.js';
import { circle, drawCat, drawCloud, drawLantern, drawStar, drawStall, ellipse, roundRect } from './art.js';

function sky(ctx, top, mid, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}

function cobbles(ctx, y0) {
  ctx.fillStyle = '#7a5a3a';
  ctx.fillRect(0, y0, PANEL_W, PANEL_H - y0);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let row = 0; row < 4; row++) {
    for (let col = -1; col < 9; col++) {
      const x = col * 78 + (row % 2) * 39;
      const y = y0 + 8 + row * 18;
      ellipse(ctx, x + 30, y + 6, 26, 7);
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------- level 1
export function drawNightMarket(ctx, mods) {
  sky(ctx, '#1d2340', '#4a2f55', '#8c4a3a');
  // stars
  ctx.fillStyle = 'rgba(255, 244, 200, 0.9)';
  for (const [sx, sy] of [[40, 30], [150, 22], [260, 44], [330, 26], [430, 34], [580, 28], [90, 110], [470, 90]]) {
    circle(ctx, sx, sy, 2);
    ctx.fill();
  }
  // moon: full on the left panel, crescent on the right
  ctx.fillStyle = '#ffe9a8';
  circle(ctx, 512, 62, 26);
  ctx.fill();
  ctx.fillStyle = 'rgba(214, 164, 90, 0.7)';
  circle(ctx, 504, 56, 5);
  ctx.fill();
  circle(ctx, 520, 70, 4);
  ctx.fill();
  if (mods.has('moon')) {
    ctx.fillStyle = '#3a2f55';
    circle(ctx, 522, 56, 23);
    ctx.fill();
  }
  // paper kite (right panel: gone) — flown clear of the shopfronts
  if (!mods.has('kite')) {
    ctx.fillStyle = '#e25f4b';
    ctx.beginPath();
    ctx.moveTo(585, 93);
    ctx.lineTo(603, 115);
    ctx.lineTo(585, 137);
    ctx.lineTo(567, 115);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f7ead2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(585, 137);
    ctx.quadraticCurveTo(577, 161, 589, 179);
    ctx.stroke();
    ctx.fillStyle = '#d9a441';
    circle(ctx, 585, 161, 3);
    ctx.fill();
  }
  // shopfronts
  ctx.fillStyle = '#33243d';
  ctx.fillRect(150, 120, 120, 120);
  ctx.fillStyle = '#2a1d33';
  ctx.fillRect(430, 108, 130, 132);
  // shop window: lit warm vs dark
  if (mods.has('window')) {
    ctx.fillStyle = '#232030';
  } else {
    ctx.fillStyle = '#ffd76e';
  }
  ctx.fillRect(168, 140, 56, 56);
  ctx.fill();
  ctx.strokeStyle = '#1d1420';
  ctx.lineWidth = 3;
  ctx.strokeRect(168, 140, 56, 56);
  ctx.beginPath();
  ctx.moveTo(196, 140);
  ctx.lineTo(196, 196);
  ctx.moveTo(168, 168);
  ctx.lineTo(224, 168);
  ctx.stroke();
  ctx.fillStyle = '#1d1420';
  ctx.fillRect(452, 128, 56, 60);
  ctx.strokeStyle = '#ffd76e';
  ctx.lineWidth = 2;
  ctx.strokeRect(452, 128, 56, 60);
  // lantern string across the top
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.quadraticCurveTo(310, 66, 620, 34);
  ctx.stroke();
  const lanternXs = [60, 118, 176, 234, 292, 350, 408, 466, 524, 582];
  lanternXs.forEach((lx, i) => {
    if (mods.has('lantern') && lx === 118) return; // missing lantern
    const ly = 34 + Math.sin((lx / 620) * Math.PI) * 22;
    drawLantern(ctx, lx, ly + 18, 13, i % 2 === 0 ? '#d94f3d' : '#e8a13c');
  });
  // stalls
  drawStall(ctx, 250, 200, 130, '#c0392b', mods.has('sign') ? '#1f6f6b' : '#8c2f26', '茶');
  drawStall(ctx, 400, 200, 140, '#1f6f6b', '#8c2f26', '饺');
  // dumpling tray on the second stall's counter
  ctx.fillStyle = '#e8d5b0';
  ellipse(ctx, 452, 322, 52, 12);
  ctx.fill();
  const dumplings = mods.has('dumpling') ? [424, 452] : [424, 452, 480];
  for (const dx of dumplings) {
    ctx.fillStyle = '#fff3d6';
    ellipse(ctx, dx, 312, 15, 10);
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(dx, 312, 15, Math.PI, 0);
    ctx.stroke();
  }
  // tea cups on the first stall
  ctx.fillStyle = '#f7ead2';
  for (const tx of [282, 318, 352]) {
    roundRect(ctx, tx - 10, 306, 20, 14, 3);
    ctx.fill();
    ctx.fillStyle = '#7a4a2a';
    ctx.fillRect(tx - 8, 304, 16, 4);
    ctx.fillStyle = '#f7ead2';
  }
  // cat on a crate
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(58, 330, 84, 34);
  ctx.fill();
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 2;
  ctx.strokeRect(58, 330, 84, 34);
  ctx.beginPath();
  ctx.moveTo(58, 347);
  ctx.lineTo(142, 347);
  ctx.stroke();
  drawCat(ctx, 96, 322, 1, !mods.has('cat-tail'));
  // cobbled street
  cobbles(ctx, 364);
  // gold coin on the cobbles (right panel: gone)
  if (!mods.has('coin')) {
    ctx.fillStyle = '#d9a441';
    ellipse(ctx, 352, 402, 12, 7);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ellipse(ctx, 352, 400, 8, 4);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- level 2
export function drawKoiPond(ctx, mods) {
  sky(ctx, '#bfe3ec', '#e8f3d8', '#cfe8c9');
  if (!mods.has('cloud')) drawCloud(ctx, 500, 58, 1.1);
  drawCloud(ctx, 120, 46, 0.8, 'rgba(255, 250, 235, 0.7)');
  // sun
  ctx.fillStyle = '#ffd76e';
  circle(ctx, 560, 44, 22);
  ctx.fill();
  // cherry tree, left
  ctx.strokeStyle = '#5a3a28';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(60, 250);
  ctx.quadraticCurveTo(70, 160, 104, 96);
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(84, 170);
  ctx.quadraticCurveTo(130, 140, 170, 120);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(88, 140);
  ctx.quadraticCurveTo(50, 110, 30, 84);
  ctx.stroke();
  // blossom: one branch bare on the right panel
  const blossoms = [[104, 92], [170, 116], [30, 80], [140, 70], [70, 130]];
  for (const [bx, by] of blossoms) {
    if (mods.has('blossom') && bx === 104 && by === 92) continue;
    ctx.fillStyle = '#f7a8c4';
    for (const [ox, oy] of [[0, 0], [12, 6], [-12, 6], [6, -10], [-8, -8]]) {
      circle(ctx, bx + ox, by + oy, 9);
      ctx.fill();
    }
    ctx.fillStyle = '#ffe9f2';
    circle(ctx, bx, by, 4);
    ctx.fill();
  }
  // butterfly (right panel: gone)
  if (!mods.has('butterfly')) {
    ctx.fillStyle = '#e08ab8';
    ellipse(ctx, 412, 116, 10, 14);
    ctx.fill();
    ellipse(ctx, 428, 116, 10, 14);
    ctx.fill();
    ctx.fillStyle = '#5a3a28';
    ctx.fillRect(419, 112, 2, 12);
  }
  // grass bank
  ctx.fillStyle = '#7fae62';
  ctx.fillRect(0, 232, PANEL_W, 30);
  ctx.fillStyle = '#6b9c52';
  for (let x = 8; x < PANEL_W; x += 26) {
    ctx.beginPath();
    ctx.moveTo(x, 244);
    ctx.lineTo(x + 5, 232);
    ctx.lineTo(x + 10, 244);
    ctx.closePath();
    ctx.fill();
  }
  // pond
  const water = ctx.createLinearGradient(0, 250, 0, PANEL_H);
  water.addColorStop(0, '#4f9d8f');
  water.addColorStop(1, '#2f6f6b');
  ctx.fillStyle = water;
  ctx.fillRect(0, 258, PANEL_W, PANEL_H - 258);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (const [rx, ry, rw] of [[120, 300, 60], [300, 350, 80], [480, 300, 70], [200, 400, 90], [420, 410, 60]]) {
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // arched bridge
  ctx.strokeStyle = '#a34a2e';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(400, 268);
  ctx.quadraticCurveTo(480, 210, 560, 268);
  ctx.stroke();
  ctx.strokeStyle = '#7a341f';
  ctx.lineWidth = 3;
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const bx = 400 + t * 160;
    const by = 268 - Math.sin(t * Math.PI) * 42;
    ctx.beginPath();
    ctx.moveTo(bx, by - 8);
    ctx.lineTo(bx, by - 26);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(400, 244);
  ctx.quadraticCurveTo(480, 190, 560, 244);
  ctx.stroke();
  // bridge lantern: lit vs out
  drawLantern(ctx, 470, 210, 11, '#d94f3d', !mods.has('bridge-lantern'));
  // lily pads + flowers
  const pads = [[196, 350, 34], [250, 262, 30], [330, 330, 28], [470, 380, 32]];
  for (const [px, py, pr] of pads) {
    ctx.fillStyle = '#3f7d4e';
    circle(ctx, px, py, pr);
    ctx.fill();
    ctx.fillStyle = '#2f6f6b';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + pr, py - pr * 0.7);
    ctx.lineTo(px + pr, py + pr * 0.4);
    ctx.closePath();
    ctx.fill();
  }
  // water lily: pink vs white
  ctx.fillStyle = mods.has('lily') ? '#f7ead2' : '#f7a8c4';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    ellipse(ctx, 250 + Math.cos(a) * 10, 262 + Math.sin(a) * 7, 9, 5);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd76e';
  circle(ctx, 250, 262, 5);
  ctx.fill();
  // koi: orange vs white
  const koiColor = mods.has('koi') ? '#f7ead2' : '#e8823a';
  ctx.fillStyle = koiColor;
  ctx.beginPath();
  ctx.ellipse(330, 300, 34, 13, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(360, 292);
  ctx.lineTo(378, 282);
  ctx.lineTo(378, 306);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = koiColor === '#f7ead2' ? '#e8823a' : '#f7ead2';
  circle(ctx, 330, 298, 7);
  ctx.fill();
  ctx.fillStyle = '#2b2118';
  circle(ctx, 302, 294, 2.5);
  ctx.fill();
  // second koi, small, always orange
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath();
  ctx.ellipse(470, 330, 20, 8, 0.4, 0, Math.PI * 2);
  ctx.fill();
  // frog on a lily pad (right panel: hopped away)
  if (!mods.has('frog')) {
    ctx.fillStyle = '#5da24a';
    circle(ctx, 196, 344, 14);
    ctx.fill();
    circle(ctx, 186, 332, 7);
    ctx.fill();
    circle(ctx, 206, 332, 7);
    ctx.fill();
    ctx.fillStyle = '#fff';
    circle(ctx, 186, 330, 3);
    ctx.fill();
    circle(ctx, 206, 330, 3);
    ctx.fill();
    ctx.fillStyle = '#2b2118';
    circle(ctx, 186, 330, 1.5);
    ctx.fill();
    circle(ctx, 206, 330, 1.5);
    ctx.fill();
  }
  // stone lantern by the pond: flame lit vs out
  ctx.fillStyle = '#8a8a7a';
  ctx.fillRect(538, 330, 20, 34);
  ctx.fillRect(530, 322, 36, 10);
  ctx.fillRect(534, 306, 28, 16);
  ctx.fillStyle = '#6b6b5e';
  ctx.fillRect(528, 364, 40, 8);
  if (!mods.has('stone-lantern')) {
    ctx.fillStyle = '#ffd76e';
    ellipse(ctx, 548, 312, 6, 9);
    ctx.fill();
    ctx.fillStyle = '#ff9d2e';
    ellipse(ctx, 548, 314, 3.5, 6);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- level 3
export function drawLighthouseCoast(ctx, mods) {
  sky(ctx, '#f7b267', '#f4845f', '#e25f6b');
  // low sun
  ctx.fillStyle = '#fff0c0';
  circle(ctx, 520, 120, 30);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 240, 192, 0.4)';
  circle(ctx, 520, 120, 44);
  ctx.fill();
  // gulls: three, or two on the right panel
  ctx.strokeStyle = '#3a2a22';
  ctx.lineWidth = 2.5;
  const gulls = [[320, 70], [350, 74], [380, 66]];
  for (const [gx, gy] of gulls) {
    if (mods.has('gull') && gx === 350) continue;
    ctx.beginPath();
    ctx.moveTo(gx - 10, gy);
    ctx.quadraticCurveTo(gx - 4, gy - 7, gx, gy);
    ctx.quadraticCurveTo(gx + 4, gy - 7, gx + 10, gy);
    ctx.stroke();
  }
  // sea
  const sea = ctx.createLinearGradient(0, 250, 0, 360);
  sea.addColorStop(0, '#3f8ea6');
  sea.addColorStop(1, '#2a6b84');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 250, PANEL_W, 110);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  for (const [wx, wy, ww] of [[80, 280, 50], [260, 310, 70], [480, 290, 60], [160, 335, 60]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + ww / 2, wy - 6, wx + ww, wy);
    ctx.stroke();
  }
  // boat: sail red vs blue
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath();
  ctx.moveTo(420, 200);
  ctx.lineTo(500, 200);
  ctx.lineTo(480, 216);
  ctx.lineTo(440, 216);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(458, 130, 4, 72);
  ctx.fillStyle = mods.has('sail') ? '#3f6fb5' : '#c0392b';
  ctx.beginPath();
  ctx.moveTo(462, 134);
  ctx.lineTo(462, 196);
  ctx.lineTo(500, 196);
  ctx.closePath();
  ctx.fill();
  // buoy (right panel: gone)
  if (!mods.has('buoy')) {
    ctx.fillStyle = '#e25f4b';
    ctx.beginPath();
    ctx.arc(400, 330, 12, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(388, 330, 24, 8);
    ctx.fillStyle = '#f7ead2';
    ctx.fillRect(388, 326, 24, 5);
  }
  // lighthouse
  ctx.fillStyle = '#f7ead2';
  ctx.fillRect(128, 120, 44, 220);
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(128, 160, 44, 26);
  ctx.fillRect(128, 230, 44, 26);
  ctx.fillRect(128, 300, 44, 26);
  ctx.fill();
  // gallery + lamp room
  ctx.fillStyle = '#3a2a22';
  ctx.fillRect(118, 108, 64, 12);
  ctx.fillStyle = '#ffd76e';
  ctx.fillRect(134, 84, 32, 24);
  ctx.fill();
  ctx.strokeStyle = '#3a2a22';
  ctx.lineWidth = 3;
  ctx.strokeRect(134, 84, 32, 24);
  ctx.fillStyle = '#8c2f26';
  ctx.beginPath();
  ctx.moveTo(130, 84);
  ctx.lineTo(170, 84);
  ctx.lineTo(150, 66);
  ctx.closePath();
  ctx.fill();
  // beam: on vs off
  if (!mods.has('beam')) {
    const beam = ctx.createLinearGradient(166, 96, 620, 96);
    beam.addColorStop(0, 'rgba(255, 233, 168, 0.55)');
    beam.addColorStop(1, 'rgba(255, 233, 168, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(166, 88);
    ctx.lineTo(620, 40);
    ctx.lineTo(620, 150);
    ctx.lineTo(166, 104);
    ctx.closePath();
    ctx.fill();
  }
  // lighthouse window: lit vs dark
  ctx.fillStyle = mods.has('lighthouse-window') ? '#3a2a22' : '#ffd76e';
  roundRect(ctx, 142, 192, 16, 20, 3);
  ctx.fill();
  ctx.fillStyle = mods.has('lighthouse-window') ? '#3a2a22' : '#ffd76e';
  roundRect(ctx, 142, 262, 16, 20, 3);
  ctx.fill();
  // sand
  ctx.fillStyle = '#e8c98f';
  ctx.fillRect(0, 360, PANEL_W, PANEL_H - 360);
  ctx.fillStyle = 'rgba(180, 140, 80, 0.5)';
  for (const [dx, dy] of [[40, 390], [200, 410], [340, 385], [480, 415], [580, 395], [120, 420]]) {
    ellipse(ctx, dx, dy, 14, 4);
    ctx.fill();
  }
  // rock + starfish (right panel: starfish gone)
  ctx.fillStyle = '#8a7a6a';
  ctx.beginPath();
  ctx.ellipse(96, 384, 44, 20, 0, Math.PI, 0);
  ctx.fill();
  if (!mods.has('starfish')) {
    drawStar(ctx, 96, 372, 12, '#e8823a');
  }
  // crab (right panel: scuttled off)
  if (!mods.has('crab')) {
    ctx.fillStyle = '#d94f3d';
    ellipse(ctx, 250, 398, 16, 11);
    ctx.fill();
    ctx.strokeStyle = '#d94f3d';
    ctx.lineWidth = 3;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(250 + s * 12, 392);
      ctx.lineTo(250 + s * 22, 384);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(250 + s * 12, 402);
      ctx.lineTo(250 + s * 22, 406);
      ctx.stroke();
    }
    ctx.fillStyle = '#2b2118';
    circle(ctx, 244, 392, 2);
    ctx.fill();
    circle(ctx, 256, 392, 2);
    ctx.fill();
  }
  // beach umbrella (right panel: gone)
  if (!mods.has('umbrella')) {
    ctx.strokeStyle = '#8a5a34';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(520, 372);
    ctx.lineTo(520, 316);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a0 = Math.PI + (i * Math.PI) / 6;
      const a1 = Math.PI + ((i + 1) * Math.PI) / 6;
      ctx.fillStyle = i % 2 === 0 ? '#e25f4b' : '#f7ead2';
      ctx.beginPath();
      ctx.moveTo(520, 316);
      ctx.arc(520, 316, 42, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#d9a441';
    circle(ctx, 520, 314, 4);
    ctx.fill();
  }
}

export const SCENE_PAINTERS = {
  'night-market': drawNightMarket,
  'koi-pond': drawKoiPond,
  'lighthouse-coast': drawLighthouseCoast,
};
