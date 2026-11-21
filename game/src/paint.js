// Canvas painter for one harbor panel. paintPanel draws the sky, sun,
// water, pier deck and every prop in back-to-front order; paintMarker
// draws the ring-and-tick shown on both panels once a difference is found.
import { PANEL_H, PANEL_W } from './scene.js';

export function paintPanel(ctx, scene, props) {
  const mood = scene.mood;
  const sky = ctx.createLinearGradient(0, 0, 0, 190);
  sky.addColorStop(0, mood.skyTop);
  sky.addColorStop(1, mood.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 190);

  ctx.fillStyle = mood.sun;
  ctx.beginPath();
  ctx.arc(scene.sunX, mood.sunY, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.arc(scene.sunX, mood.sunY, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = mood.water;
  ctx.fillRect(0, 190, PANEL_W, 72);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.6;
  for (let y = 202; y < 258; y += 13) {
    ctx.beginPath();
    for (let x = 0; x <= PANEL_W; x += 14) {
      const yy = y + Math.sin((x + y * 2) / 22) * 2;
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  ctx.fillStyle = mood.pier;
  ctx.fillRect(0, 262, PANEL_W, PANEL_H - 262);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  for (let x = 0; x < PANEL_W; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 262);
    ctx.lineTo(x - 8, PANEL_H);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(0, 262, PANEL_W, 4);

  const order = ['cloud', 'gull', 'lighthouse', 'boat', 'fish', 'buoy', 'flag', 'sign', 'crate', 'barrel', 'cat', 'shell'];
  for (const kind of order) {
    for (const prop of props) {
      if (prop.kind === kind) paintProp(ctx, prop);
    }
  }
}

function paintProp(ctx, p) {
  switch (p.kind) {
    case 'cloud': {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 26 * p.s, 11 * p.s, 0, 0, Math.PI * 2);
      ctx.ellipse(p.x + 18 * p.s, p.y + 3 * p.s, 18 * p.s, 8 * p.s, 0, 0, Math.PI * 2);
      ctx.ellipse(p.x - 18 * p.s, p.y + 3 * p.s, 16 * p.s, 7 * p.s, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'gull': {
      ctx.strokeStyle = '#33566b';
      ctx.lineWidth = 2.2;
      const d = p.flip ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(p.x - 9 * p.s * d, p.y);
      ctx.quadraticCurveTo(p.x - 3 * p.s * d, p.y - 6 * p.s, p.x, p.y);
      ctx.quadraticCurveTo(p.x + 3 * p.s * d, p.y - 6 * p.s, p.x + 9 * p.s * d, p.y);
      ctx.stroke();
      break;
    }
    case 'lighthouse': {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x - 9, p.y - 62, 18, 62);
      ctx.fillStyle = '#e85d75';
      ctx.fillRect(p.x - 9, p.y - 50, 18, 9);
      ctx.fillRect(p.x - 9, p.y - 32, 18, 9);
      ctx.fillStyle = '#1d2733';
      ctx.fillRect(p.x - 11, p.y - 72, 22, 10);
      ctx.fillStyle = '#ffd76e';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 67, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'boat': {
      ctx.fillStyle = p.hull;
      ctx.beginPath();
      ctx.moveTo(p.x - 20 * p.s, p.y);
      ctx.lineTo(p.x + 20 * p.s, p.y);
      ctx.lineTo(p.x + 13 * p.s, p.y + 8 * p.s);
      ctx.lineTo(p.x - 13 * p.s, p.y + 8 * p.s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#5b4632';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y - 24 * p.s);
      ctx.stroke();
      ctx.fillStyle = p.sail;
      ctx.beginPath();
      ctx.moveTo(p.x + 2 * p.s, p.y - 23 * p.s);
      ctx.lineTo(p.x + 2 * p.s, p.y - 2 * p.s);
      ctx.lineTo(p.x + 15 * p.s, p.y - 2 * p.s);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'fish': {
      const d = p.flip ? -1 : 1;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(p.x - 10 * d, p.y);
      ctx.lineTo(p.x - 17 * d, p.y - 5);
      ctx.lineTo(p.x - 17 * d, p.y + 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1d2733';
      ctx.beginPath();
      ctx.arc(p.x + 5 * d, p.y - 1, 1.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'buoy': {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x - 8, p.y - 2, 16, 4);
      ctx.strokeStyle = '#1d2733';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'flag': {
      ctx.strokeStyle = '#5b4632';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 18);
      ctx.lineTo(p.x, p.y - 14);
      ctx.stroke();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 14);
      ctx.lineTo(p.x + 20, p.y - 9);
      ctx.lineTo(p.x, p.y - 4);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'sign': {
      ctx.fillStyle = '#6b4a2f';
      ctx.fillRect(p.x - 3, p.y, 6, 26);
      ctx.fillStyle = '#fff7ea';
      ctx.fillRect(p.x - 34, p.y - 22, 68, 22);
      ctx.strokeStyle = '#6b4a2f';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 34, p.y - 22, 68, 22);
      ctx.fillStyle = '#1d2733';
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, p.x, p.y - 11);
      break;
    }
    case 'crate': {
      const w = 30 * p.s;
      const h = 24 * p.s;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - w / 2, p.y - h / 2, w, h);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(p.x - w / 2, p.y - h / 2, w, h);
      ctx.beginPath();
      ctx.moveTo(p.x - w / 2, p.y - h / 2);
      ctx.lineTo(p.x + w / 2, p.y + h / 2);
      ctx.moveTo(p.x + w / 2, p.y - h / 2);
      ctx.lineTo(p.x - w / 2, p.y + h / 2);
      ctx.stroke();
      break;
    }
    case 'barrel': {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 10, p.y - 14, 20, 28);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(p.x - 10, p.y - 5, 20, 4);
      ctx.fillRect(p.x - 10, p.y + 5, 20, 4);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(p.x - 10, p.y - 14, 20, 28);
      break;
    }
    case 'cat': {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 12, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x + 11, p.y - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(p.x + 7, p.y - 11);
      ctx.lineTo(p.x + 9, p.y - 16);
      ctx.lineTo(p.x + 12, p.y - 11);
      ctx.moveTo(p.x + 12, p.y - 11);
      ctx.lineTo(p.x + 15, p.y - 16);
      ctx.lineTo(p.x + 16, p.y - 10);
      ctx.fill();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x - 11, p.y);
      ctx.quadraticCurveTo(p.x - 19, p.y - 6, p.x - 17, p.y - 13);
      ctx.stroke();
      break;
    }
    case 'shell': {
      ctx.fillStyle = '#ffe9c9';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 * p.s, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#d9a05b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 * p.s, Math.PI, 0);
      ctx.stroke();
      break;
    }
    default:
      break;
  }
}

export function paintMarker(ctx, spot) {
  ctx.strokeStyle = '#17877b';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.arc(spot.x, spot.y, 17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5.4;
  ctx.beginPath();
  ctx.moveTo(spot.x - 7, spot.y + 1);
  ctx.lineTo(spot.x - 2, spot.y + 6);
  ctx.lineTo(spot.x + 8, spot.y - 5);
  ctx.stroke();
  ctx.strokeStyle = '#17877b';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(spot.x - 7, spot.y + 1);
  ctx.lineTo(spot.x - 2, spot.y + 6);
  ctx.lineTo(spot.x + 8, spot.y - 5);
  ctx.stroke();
}

export function paintCrosshair(ctx, cursor) {
  ctx.strokeStyle = '#e85d75';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(cursor.x, cursor.y, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cursor.x - 19, cursor.y);
  ctx.lineTo(cursor.x - 7, cursor.y);
  ctx.moveTo(cursor.x + 7, cursor.y);
  ctx.lineTo(cursor.x + 19, cursor.y);
  ctx.moveTo(cursor.x, cursor.y - 19);
  ctx.lineTo(cursor.x, cursor.y - 7);
  ctx.moveTo(cursor.x, cursor.y + 7);
  ctx.lineTo(cursor.x, cursor.y + 19);
  ctx.stroke();
}
