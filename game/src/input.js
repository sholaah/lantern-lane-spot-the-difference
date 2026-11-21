// Input: mouse clicks on either panel, plus a keyboard cursor so the
// whole game is playable without a mouse. The game owns a logical cursor
// in panel coordinates; arrow keys move it, Enter/Space marks the spot,
// Tab jumps between the two panels, H asks for a hint, R restarts.

export class Input {
  constructor(canvas, hooks) {
    this.canvas = canvas;
    this.hooks = hooks; // { onMark(x, y, panel), onKey(action) }
    this.cursor = { panel: 0, x: 310, y: 220, visible: false };
    canvas.addEventListener('pointermove', (event) => {
      const pos = this.toPanel(event);
      if (!pos) return;
      this.moveCursorTo(pos);
      this.cursor.visible = true;
    });
    canvas.addEventListener('pointerdown', (event) => {
      const pos = this.toPanel(event);
      if (!pos) return;
      this.moveCursorTo(pos);
      this.cursor.visible = true;
      this.hooks.onMark(pos.x, pos.y, pos.panel);
    });
    window.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 6 : 22;
      const key = event.key;
      if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
        event.preventDefault();
        this.cursor.visible = true;
        if (key === 'ArrowLeft') this.cursor.x -= step;
        if (key === 'ArrowRight') this.cursor.x += step;
        if (key === 'ArrowUp') this.cursor.y -= step;
        if (key === 'ArrowDown') this.cursor.y += step;
        this.clampCursor();
        return;
      }
      if (key === 'Tab') {
        event.preventDefault();
        this.cursor.panel = 1 - this.cursor.panel;
        this.cursor.visible = true;
        return;
      }
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.cursor.visible = true;
        this.hooks.onMark(this.cursor.x, this.cursor.y, this.cursor.panel);
        return;
      }
      const action = { h: 'hint', H: 'hint', r: 'restart', R: 'restart', Escape: 'menu', m: 'mute', M: 'mute' }[key];
      if (action) {
        event.preventDefault();
        this.hooks.onKey(action);
      }
    });
  }

  // Move the cursor in place (never reassign the object: the game state
  // holds the same reference and renders it every frame).
  moveCursorTo(pos) {
    this.cursor.panel = pos.panel;
    this.cursor.x = pos.x;
    this.cursor.y = pos.y;
  }

  clampCursor() {
    const { PANEL_W, PANEL_H } = this.hooks.panelSize;
    this.cursor.x = Math.max(0, Math.min(PANEL_W, this.cursor.x));
    this.cursor.y = Math.max(0, Math.min(PANEL_H, this.cursor.y));
  }

  // Convert a pointer event to panel coordinates using the layout the
  // renderer reports (panel rectangles in canvas CSS pixels).
  toPanel(event) {
    const rect = this.canvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const layout = this.hooks.layout();
    if (!layout) return null;
    for (let i = 0; i < 2; i++) {
      const p = layout.panels[i];
      if (px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h) {
        return {
          panel: i,
          x: ((px - p.x) / p.w) * this.hooks.panelSize.PANEL_W,
          y: ((py - p.y) / p.h) * this.hooks.panelSize.PANEL_H,
        };
      }
    }
    return null;
  }
}
