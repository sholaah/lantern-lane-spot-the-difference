// Tiny WebAudio sound kit: every sound is synthesized, no audio files.
// The context is created lazily on the first user gesture so the game
// never needs a network request or a bundled asset.

let audioCtx = null;
let muted = false;

export function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

export function setMuted(value) {
  muted = value;
  return muted;
}

export function isMuted() {
  return muted;
}

function tone(freq, startAt, dur, type = 'sine', vol = 0.16) {
  if (muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + dur + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFound() {
  tone(880, 0, 0.18, 'sine', 0.18);
  tone(1318.5, 0.07, 0.28, 'sine', 0.16);
}

// A soft dull thud for a wrong click.
export function playWrong() {
  tone(140, 0, 0.16, 'triangle', 0.14);
  tone(98, 0.05, 0.18, 'triangle', 0.1);
}

// Rising arpeggio for clearing a level.
export function playWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.32, 'sine', 0.16));
  tone(1318.5, 0.4, 0.5, 'sine', 0.12);
}

// A short tick when the timer drops under ten seconds.
export function playTick() {
  tone(1200, 0, 0.05, 'square', 0.05);
}

// A gentle sparkle when a hint reveals a spot.
export function playHint() {
  tone(1567.98, 0, 0.12, 'sine', 0.1);
  tone(2093, 0.08, 0.2, 'sine', 0.08);
}
