// Harbor Hunt game loop: two harbor panels side by side, seven planted
// differences per level. Click either panel (or steer the crosshair with
// the arrow keys and press Enter) to mark a change; three mistakes end the
// round, the hint pulses one unfound spot and adds ten seconds, and the
// big REMAINING counter always shows how many are left to find.
import { buildScene, LEVELS, PANEL_H, PANEL_W, plantDifferences } from './scene.js';
import { paintCrosshair, paintMarker, paintPanel } from './paint.js';
import { stageShot } from './shots.js';

const HIT_RADIUS = 26;
const MAX_MISTAKES = 3;
const HINT_PENALTY = 10;

const leftCanvas = document.getElementById('panel-left');
const rightCanvas = document.getElementById('panel-right');
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');
const hudLevel = document.getElementById('hud-level');
const hudFound = document.getElementById('hud-found');
const hudRemaining = document.getElementById('hud-remaining');
const hudTime = document.getElementById('hud-time');
const hudLives = document.getElementById('hud-lives');
const message = document.getElementById('message');
const progressFill = document.getElementById('progress-fill');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const levelMenu = document.getElementById('level-menu');
const statusLine = document.getElementById('status');

let levelIndex = 0;
let scene = null;
let alteredProps = [];
let spots = [];
let foundFlags = [];
let mistakes = 0;
let seconds = 0;
let timerId = null;
let playing = false;
let soundOn = true;
let audioCtx = null;
let hintSpot = null;
let hintUntil = 0;
let cursor = { x: PANEL_W / 2, y: PANEL_H / 2, side: 0 };
let shakeUntil = 0;

function beep(freq, length, type) {
  if (!soundOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + length);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + length);
  } catch (err) {
    // Audio is decoration; a blocked context must never stop the game.
  }
}

function formatTime(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m + ':' + String(s).padStart(2, '0');
}

function foundCount() {
  return foundFlags.filter(Boolean).length;
}

function refreshHud() {
  const found = foundCount();
  hudLevel.textContent = String(levelIndex + 1) + ' · ' + LEVELS[levelIndex].name;
  hudFound.textContent = String(found);
  hudRemaining.textContent = String(spots.length - found);
  hudTime.textContent = formatTime(seconds);
  hudLives.textContent = '♥'.repeat(Math.max(0, MAX_MISTAKES - mistakes)) + '♡'.repeat(Math.min(mistakes, MAX_MISTAKES));
  progressFill.style.width = (spots.length ? (found / spots.length) * 100 : 0) + '%';
}

function say(text) {
  message.textContent = text;
  statusLine.textContent = text;
}

function render() {
  paintPanel(leftCtx, scene, scene.props);
  paintPanel(rightCtx, scene, alteredProps);
  spots.forEach((spot, i) => {
    if (!foundFlags[i]) return;
    paintMarker(leftCtx, spot);
    paintMarker(rightCtx, spot);
  });
  if (hintSpot && performance.now() < hintUntil) {
    const pulse = 20 + Math.sin(performance.now() / 120) * 5;
    for (const ctx of [leftCtx, rightCtx]) {
      ctx.strokeStyle = '#f4a259';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hintSpot.x, hintSpot.y, pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (playing) paintCrosshair(cursor.side === 0 ? leftCtx : rightCtx, cursor);
  if (performance.now() < shakeUntil) {
    for (const ctx of [leftCtx, rightCtx]) {
      ctx.fillStyle = 'rgba(232,93,117,0.16)';
      ctx.fillRect(0, 0, PANEL_W, PANEL_H);
    }
  }
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startLevel(index) {
  levelIndex = index;
  const level = LEVELS[index];
  scene = buildScene(level);
  const planted = plantDifferences(scene, level);
  alteredProps = planted.altered;
  spots = planted.spots;
  foundFlags = spots.map(() => false);
  mistakes = 0;
  seconds = 0;
  hintSpot = null;
  playing = true;
  overlay.classList.add('hidden');
  levelMenu.classList.add('hidden');
  stopTimer();
  timerId = setInterval(() => {
    seconds += 1;
    refreshHud();
    if (hintSpot && performance.now() >= hintUntil) { hintSpot = null; render(); }
  }, 1000);
  say('Find all ' + spots.length + ' differences. Click either picture where something changed.');
  refreshHud();
  render();
}

function endRound(won) {
  playing = false;
  stopTimer();
  if (won) {
    overlayTitle.textContent = 'Level complete!';
    overlayText.textContent = 'You found all ' + spots.length + ' differences in ' + formatTime(seconds) + ' with ' + mistakes + ' mistake' + (mistakes === 1 ? '' : 's') + '.';
    beep(660, 0.18, 'triangle');
    setTimeout(() => beep(880, 0.22, 'triangle'), 140);
  } else {
    overlayTitle.textContent = 'Out of chances';
    overlayText.textContent = 'Three wrong guesses. ' + (spots.length - foundCount()) + ' differences were still hiding. Try again!';
    beep(180, 0.3, 'sawtooth');
  }
  overlay.classList.remove('hidden');
  say(overlayTitle.textContent + ' ' + overlayText.textContent);
  render();
}

function guess(x, y) {
  if (!playing) return;
  let hit = -1;
  spots.forEach((spot, i) => {
    if (foundFlags[i]) return;
    const dx = spot.x - x;
    const dy = spot.y - y;
    if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) hit = i;
  });
  if (hit >= 0) {
    foundFlags[hit] = true;
    hintSpot = null;
    beep(520, 0.14, 'triangle');
    const left = spots.length - foundCount();
    say('Found: ' + spots[hit].label + '! ' + (left > 0 ? left + ' to go.' : ''));
    refreshHud();
    render();
    if (left === 0) endRound(true);
  } else {
    mistakes += 1;
    shakeUntil = performance.now() + 260;
    beep(200, 0.16, 'square');
    say('Not there. ' + (MAX_MISTAKES - mistakes) + ' chances left.');
    refreshHud();
    render();
    setTimeout(render, 280);
    if (mistakes >= MAX_MISTAKES) endRound(false);
  }
}

function panelPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * PANEL_W,
    y: ((event.clientY - rect.top) / rect.height) * PANEL_H,
  };
}

leftCanvas.addEventListener('click', (event) => { const p = panelPoint(event, leftCanvas); cursor = { x: p.x, y: p.y, side: 0 }; guess(p.x, p.y); });
rightCanvas.addEventListener('click', (event) => { const p = panelPoint(event, rightCanvas); cursor = { x: p.x, y: p.y, side: 1 }; guess(p.x, p.y); });

document.addEventListener('keydown', (event) => {
  if (!playing) return;
  const step = event.shiftKey ? 22 : 9;
  if (event.key === 'ArrowLeft') { cursor.x = Math.max(0, cursor.x - step); event.preventDefault(); }
  else if (event.key === 'ArrowRight') { cursor.x = Math.min(PANEL_W, cursor.x + step); event.preventDefault(); }
  else if (event.key === 'ArrowUp') { cursor.y = Math.max(0, cursor.y - step); event.preventDefault(); }
  else if (event.key === 'ArrowDown') { cursor.y = Math.min(PANEL_H, cursor.y + step); event.preventDefault(); }
  else if (event.key === 'Tab') { cursor.side = cursor.side === 0 ? 1 : 0; event.preventDefault(); }
  else if (event.key === 'Enter' || event.key === ' ') { guess(cursor.x, cursor.y); event.preventDefault(); }
  else if (event.key === 'h' || event.key === 'H') { useHint(); return; }
  else return;
  render();
});

function useHint() {
  if (!playing) return;
  const open = spots.filter((spot, i) => !foundFlags[i]);
  if (open.length === 0) return;
  hintSpot = open[Math.floor(Math.random() * open.length)];
  hintUntil = performance.now() + 2200;
  seconds += HINT_PENALTY;
  beep(440, 0.12, 'sine');
  say('Hint: look inside the orange ring. (+' + HINT_PENALTY + 's)');
  refreshHud();
  render();
  setTimeout(render, 2300);
}

document.getElementById('btn-hint').addEventListener('click', useHint);
document.getElementById('btn-restart').addEventListener('click', () => startLevel(levelIndex));
document.getElementById('btn-levels').addEventListener('click', () => levelMenu.classList.remove('hidden'));
document.getElementById('btn-sound').addEventListener('click', (event) => {
  soundOn = !soundOn;
  event.currentTarget.textContent = soundOn ? 'Sound on' : 'Sound off';
  event.currentTarget.setAttribute('aria-pressed', String(soundOn));
});
document.getElementById('btn-next').addEventListener('click', () => startLevel((levelIndex + 1) % LEVELS.length));
document.getElementById('btn-replay').addEventListener('click', () => startLevel(levelIndex));
document.getElementById('btn-menu').addEventListener('click', () => { overlay.classList.add('hidden'); levelMenu.classList.remove('hidden'); });
levelMenu.querySelectorAll('[data-level]').forEach((button) => {
  button.addEventListener('click', () => startLevel(Number(button.getAttribute('data-level'))));
});

// Screenshot staging (?shot=play&seed=1): deterministic scenes for the
// entry's screenshots, rendered by this same code, then __shotReady.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  const staged = stageShot(shot, { startLevel, guess, render, endRound, levelMenu, overlay });
  if (staged) {
    let paints = 0;
    const paintTwice = () => {
      render();
      paints += 1;
      if (paints < 2) requestAnimationFrame(paintTwice);
      else window.__shotReady = true;
    };
    requestAnimationFrame(paintTwice);
  }
} else {
  startLevel(0);
}
