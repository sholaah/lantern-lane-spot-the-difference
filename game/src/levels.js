// Level definitions for Lantern Lane: three original hand-drawn scenes.
// Each difference is a spot on the picture (panel coordinates, 620 x 440)
// that the scene painter renders differently on the right panel.
// x/y mark the centre of the difference, r is the click tolerance in pixels.

export const PANEL_W = 620;
export const PANEL_H = 440;

export const LEVELS = [
  {
    id: 'night-market',
    name: 'Night Market',
    subtitle: 'Lanterns, dumplings and one very smug cat',
    difficulty: 1,
    timeLimit: 150,
    differences: [
      { id: 'moon',     x: 512, y: 62,  r: 34, label: 'the moon changed phase' },
      { id: 'lantern',  x: 118, y: 78,  r: 26, label: 'a paper lantern is missing' },
      { id: 'window',   x: 196, y: 168, r: 26, label: 'a shop window went dark' },
      { id: 'sign',     x: 315, y: 227, r: 30, label: 'the stall sign changed colour' },
      { id: 'cat-tail', x: 64,  y: 306, r: 28, label: 'the cat lowered its tail' },
      { id: 'dumpling', x: 480, y: 312, r: 26, label: 'a dumpling vanished from the tray' },
      { id: 'kite',     x: 585, y: 115, r: 28, label: 'a paper kite drifted away' },
      { id: 'coin',     x: 352, y: 402, r: 22, label: 'a gold coin on the cobbles is gone' },
    ],
  },
  {
    id: 'koi-pond',
    name: 'Koi Pond Garden',
    subtitle: 'Cherry blossom, still water, patient frogs',
    difficulty: 2,
    timeLimit: 150,
    differences: [
      { id: 'cloud',    x: 500, y: 58,  r: 34, label: 'a cloud drifted off' },
      { id: 'blossom',  x: 104, y: 96,  r: 30, label: 'a blossom branch went bare' },
      { id: 'koi',      x: 330, y: 300, r: 30, label: 'a koi changed colour' },
      { id: 'frog',     x: 196, y: 348, r: 26, label: 'the frog hopped away' },
      { id: 'bridge-lantern', x: 470, y: 210, r: 24, label: 'the bridge lantern went out' },
      { id: 'butterfly', x: 420, y: 120, r: 24, label: 'a butterfly flew off' },
      { id: 'lily',     x: 250, y: 262, r: 26, label: 'a water lily changed colour' },
      { id: 'stone-lantern', x: 548, y: 322, r: 26, label: 'the stone lantern flame died' },
    ],
  },
  {
    id: 'lighthouse-coast',
    name: 'Lighthouse Coast',
    subtitle: 'Salt air, gulls and one stubborn crab',
    difficulty: 3,
    timeLimit: 150,
    differences: [
      { id: 'beam',     x: 300, y: 95,  r: 34, label: 'the lighthouse beam went dark' },
      { id: 'sail',     x: 472, y: 168, r: 30, label: 'the boat sail changed colour' },
      { id: 'gull',     x: 350, y: 74,  r: 24, label: 'a gull flew away' },
      { id: 'umbrella', x: 520, y: 330, r: 30, label: 'the beach umbrella is gone' },
      { id: 'crab',     x: 250, y: 400, r: 24, label: 'the crab scuttled off' },
      { id: 'lighthouse-window', x: 150, y: 200, r: 22, label: 'a lighthouse window went dark' },
      { id: 'buoy',     x: 400, y: 330, r: 24, label: 'the buoy sank out of sight' },
      { id: 'starfish', x: 96,  y: 372, r: 22, label: 'a starfish vanished from the rock' },
    ],
  },
];

export function levelById(id) {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}
