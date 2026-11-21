// Shared brush helpers: small painters every scene reuses so each scene
// stays readable and the two panels always draw from the same code.

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

// A glowing paper lantern, hung from a string at (x, y).
export function drawLantern(ctx, x, y, r, color, lit = true) {
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - r - 14);
  ctx.lineTo(x, y - r);
  ctx.stroke();
  if (lit) {
    const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.1);
    glow.addColorStop(0, 'rgba(255, 214, 120, 0.55)');
    glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
    ctx.fillStyle = glow;
    circle(ctx, x, y, r * 2.1);
    ctx.fill();
  }
  ctx.fillStyle = color;
  ellipse(ctx, x, y, r, r * 1.15);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90, 40, 20, 0.55)';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y + i * r * 0.45, r * 0.92, r * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#8c2f26';
  ctx.fillRect(x - r * 0.35, y - r * 1.15 - 4, r * 0.7, 5);
  ctx.fillRect(x - r * 0.35, y + r * 1.15 - 1, r * 0.7, 5);
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(x - 1, y + r * 1.15 + 4, 2, 8);
}

// A sitting cat, tail up or down. Body faces right.
export function drawCat(ctx, x, y, s, tailUp, coat = '#3a3a3a') {
  ctx.fillStyle = coat;
  // body
  ellipse(ctx, x, y, 26 * s, 20 * s);
  ctx.fill();
  // head
  circle(ctx, x + 24 * s, y - 18 * s, 15 * s);
  ctx.fill();
  // ears
  ctx.beginPath();
  ctx.moveTo(x + 12 * s, y - 28 * s);
  ctx.lineTo(x + 16 * s, y - 40 * s);
  ctx.lineTo(x + 22 * s, y - 29 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 26 * s, y - 31 * s);
  ctx.lineTo(x + 32 * s, y - 42 * s);
  ctx.lineTo(x + 36 * s, y - 30 * s);
  ctx.closePath();
  ctx.fill();
  // tail
  ctx.strokeStyle = coat;
  ctx.lineWidth = 6 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 24 * s, y + 6 * s);
  if (tailUp) {
    ctx.quadraticCurveTo(x - 38 * s, y - 6 * s, x - 30 * s, y - 30 * s);
  } else {
    ctx.quadraticCurveTo(x - 40 * s, y + 12 * s, x - 46 * s, y + 2 * s);
  }
  ctx.stroke();
  // eye + whiskers
  ctx.fillStyle = '#ffd76e';
  circle(ctx, x + 29 * s, y - 20 * s, 2.5 * s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 36 * s, y - 14 * s);
  ctx.lineTo(x + 46 * s, y - 16 * s);
  ctx.moveTo(x + 36 * s, y - 12 * s);
  ctx.lineTo(x + 46 * s, y - 10 * s);
  ctx.stroke();
}

// A market stall awning with a hanging sign.
export function drawStall(ctx, x, y, w, awning, signColor, signMark) {
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(x - 6, y, 8, 86);
  ctx.fillRect(x + w - 2, y, 8, 86);
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(x - 10, y + 78, w + 20, 12);
  // striped awning
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? awning : '#f7ead2';
    ctx.fillRect(x - 12 + (i * (w + 24)) / 5, y - 26, (w + 24) / 5, 30);
  }
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x - 12, y + 2, w + 24, 4);
  // hanging sign
  ctx.fillStyle = signColor;
  roundRect(ctx, x + w / 2 - 26, y + 12, 52, 30, 6);
  ctx.fill();
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fbeed3';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(signMark, x + w / 2, y + 28);
}

// A simple five-point star.
export function drawStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// Soft drifting cloud.
export function drawCloud(ctx, x, y, s, color = 'rgba(255, 250, 235, 0.9)') {
  ctx.fillStyle = color;
  circle(ctx, x, y, 18 * s);
  ctx.fill();
  circle(ctx, x + 18 * s, y + 4 * s, 14 * s);
  ctx.fill();
  circle(ctx, x - 18 * s, y + 5 * s, 13 * s);
  ctx.fill();
  ctx.fillRect(x - 30 * s, y, 60 * s, 12 * s);
}
