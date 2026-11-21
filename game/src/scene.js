// Harbor scene builder. A scene is a flat list of placed props (clouds,
// gulls, boats, crates, buoys, flags, signs, fish, shells) plus a palette.
// buildScene lays out the original; plantDifferences clones the list and
// mutates exactly seven props, recording a hit centre for each change so
// clicks on either panel can be tested against the same coordinates.
import { between, choose, makeRandom, shuffled } from './random.js';

export const PANEL_W = 620;
export const PANEL_H = 360;
export const DIFF_COUNT = 7;

export const LEVELS = [
  { name: 'Dawn Harbor', seed: 4103, mood: 'dawn' },
  { name: 'Midday Market', seed: 7211, mood: 'noon' },
  { name: 'Dusk Festival', seed: 9929, mood: 'dusk' },
];

const MOODS = {
  dawn: { skyTop: '#ffd9a0', skyBottom: '#fff3d6', water: '#4aa3b8', pier: '#b08968', sun: '#ffb347', sunY: 64 },
  noon: { skyTop: '#7ec8f7', skyBottom: '#e8fbff', water: '#1f9bb8', pier: '#a67c52', sun: '#fff3a6', sunY: 44 },
  dusk: { skyTop: '#6b4a8c', skyBottom: '#ff9e7a', water: '#5a6bb0', pier: '#7a5a3b', sun: '#ff7a4a', sunY: 118 },
};

const FLAG_COLORS = ['#e85d75', '#17877b', '#f4a259', '#4a6fa5', '#e9c46a', '#bc4b51'];
const CRATE_COLORS = ['#c98a4b', '#a67c52', '#8a6a45', '#d9a05b'];
const BUOY_COLORS = ['#e85d75', '#f4a259', '#e9c46a', '#ffffff'];
const SIGN_TEXTS = ['FERRY', 'FISH', 'CAFE', 'TICKETS', 'BOATS', 'MARKET', 'PIER 9', 'GIFTS'];

export function buildScene(level) {
  const next = makeRandom(level.seed);
  const mood = MOODS[level.mood];
  const props = [];

  for (let i = 0; i < 5; i += 1) {
    props.push({ kind: 'cloud', x: between(next, 40, PANEL_W - 80), y: between(next, 22, 92), s: between(next, 0.7, 1.25) });
  }
  for (let i = 0; i < 5; i += 1) {
    props.push({ kind: 'gull', x: between(next, 36, PANEL_W - 50), y: between(next, 34, 118), s: between(next, 0.8, 1.2), flip: next() < 0.5 });
  }
  for (let i = 0; i < 4; i += 1) {
    props.push({
      kind: 'boat', x: 70 + i * 140 + between(next, -26, 26), y: between(next, 196, 224),
      s: between(next, 0.85, 1.2), hull: choose(next, ['#bc4b51', '#17877b', '#4a6fa5', '#7a4a8c']),
      sail: choose(next, ['#ffffff', '#ffe9c9', '#ffd9e0']),
    });
  }
  for (let i = 0; i < 4; i += 1) {
    props.push({ kind: 'buoy', x: between(next, 40, PANEL_W - 40), y: between(next, 226, 252), color: choose(next, BUOY_COLORS) });
  }
  for (let i = 0; i < 6; i += 1) {
    props.push({ kind: 'flag', x: 36 + i * 100 + between(next, -14, 14), y: between(next, 252, 264), color: FLAG_COLORS[i % FLAG_COLORS.length] });
  }
  for (let i = 0; i < 6; i += 1) {
    props.push({ kind: 'crate', x: 34 + i * 98 + between(next, -16, 16), y: between(next, 296, 322), s: between(next, 0.85, 1.15), color: choose(next, CRATE_COLORS) });
  }
  for (let i = 0; i < 3; i += 1) {
    props.push({ kind: 'barrel', x: between(next, 50, PANEL_W - 60), y: between(next, 298, 326), color: choose(next, ['#4a6fa5', '#bc4b51', '#17877b']) });
  }
  for (let i = 0; i < 2; i += 1) {
    props.push({ kind: 'sign', x: 130 + i * 320 + between(next, -24, 24), y: between(next, 268, 282), text: SIGN_TEXTS[(level.seed + i * 3) % SIGN_TEXTS.length] });
  }
  for (let i = 0; i < 4; i += 1) {
    props.push({ kind: 'fish', x: between(next, 40, PANEL_W - 40), y: between(next, 208, 244), flip: next() < 0.5, color: choose(next, ['#f4a259', '#e85d75', '#e9c46a']) });
  }
  for (let i = 0; i < 5; i += 1) {
    props.push({ kind: 'shell', x: between(next, 30, PANEL_W - 30), y: between(next, 330, 350), s: between(next, 0.7, 1.1) });
  }
  props.push({ kind: 'lighthouse', x: between(next, 520, 560), y: 196, lit: true });
  props.push({ kind: 'cat', x: between(next, 80, 480), y: between(next, 300, 322), color: choose(next, ['#5b6b7a', '#f4a259', '#1d2733']) });

  return { mood, props, sunX: between(next, 90, 180) };
}

export function plantDifferences(scene, level) {
  const next = makeRandom(level.seed * 11 + 7);
  const altered = scene.props.map((p) => ({ ...p }));
  const spots = [];
  const used = new Set();

  function fresh(kind) {
    const pool = [];
    altered.forEach((p, i) => { if (p.kind === kind && !used.has(i)) pool.push(i); });
    if (pool.length === 0) return -1;
    const index = choose(next, pool);
    used.add(index);
    return index;
  }

  const tricks = [
    () => { const i = fresh('flag'); if (i < 0) return false; const p = altered[i]; p.color = choose(next, FLAG_COLORS.filter((c) => c !== p.color)); spots.push({ x: p.x, y: p.y, label: 'flag colour' }); return true; },
    () => { const i = fresh('buoy'); if (i < 0) return false; const p = altered[i]; spots.push({ x: p.x, y: p.y, label: 'missing buoy' }); altered.splice(i, 1); return true; },
    () => { const i = fresh('boat'); if (i < 0) return false; const p = altered[i]; spots.push({ x: p.x, y: p.y, label: 'boat moved' }); p.x += p.x < PANEL_W / 2 ? 58 : -58; return true; },
    () => { const i = fresh('sign'); if (i < 0) return false; const p = altered[i]; p.text = choose(next, SIGN_TEXTS.filter((t) => t !== p.text)); spots.push({ x: p.x, y: p.y - 12, label: 'sign wording' }); return true; },
    () => { const i = fresh('gull'); if (i < 0) return false; const p = altered[i]; p.flip = !p.flip; spots.push({ x: p.x, y: p.y, label: 'gull direction' }); return true; },
    () => { const i = fresh('crate'); if (i < 0) return false; const p = altered[i]; p.color = choose(next, CRATE_COLORS.filter((c) => c !== p.color)); spots.push({ x: p.x, y: p.y, label: 'crate colour' }); return true; },
    () => { const i = fresh('fish'); if (i < 0) return false; const p = altered[i]; spots.push({ x: p.x, y: p.y, label: 'missing fish' }); altered.splice(i, 1); return true; },
    () => { const i = fresh('cloud'); if (i < 0) return false; const p = altered[i]; spots.push({ x: p.x, y: p.y, label: 'missing cloud' }); altered.splice(i, 1); return true; },
    () => { const i = fresh('barrel'); if (i < 0) return false; const p = altered[i]; p.color = choose(next, ['#4a6fa5', '#bc4b51', '#17877b'].filter((c) => c !== p.color)); spots.push({ x: p.x, y: p.y, label: 'barrel colour' }); return true; },
    () => { const i = fresh('cat'); if (i < 0) return false; const p = altered[i]; p.color = choose(next, ['#5b6b7a', '#f4a259', '#1d2733'].filter((c) => c !== p.color)); spots.push({ x: p.x, y: p.y, label: 'cat colour' }); return true; },
  ];

  for (const trick of shuffled(next, tricks)) {
    if (spots.length >= DIFF_COUNT) break;
    trick();
  }
  return { altered, spots };
}
