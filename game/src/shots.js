// Screenshot scenes for ?shot=start|play|levels|end. Each scene drives the
// real game: start is a fresh level, play marks three real differences
// (so markers show and the counter reads 4 remaining), levels opens the
// level picker, and end completes the level to show the win card.
import { LEVELS, buildScene, plantDifferences } from './scene.js';

export function stageShot(name, api) {
  if (name === 'levels') {
    api.startLevel(0);
    api.levelMenu.classList.remove('hidden');
    return true;
  }
  if (name === 'play') {
    api.startLevel(0);
    const scene = buildScene(LEVELS[0]);
    const planted = plantDifferences(scene, LEVELS[0]);
    planted.spots.slice(0, 3).forEach((spot) => api.guess(spot.x, spot.y));
    return true;
  }
  if (name === 'end') {
    api.startLevel(0);
    const scene = buildScene(LEVELS[0]);
    const planted = plantDifferences(scene, LEVELS[0]);
    planted.spots.forEach((spot) => api.guess(spot.x, spot.y));
    return true;
  }
  api.startLevel(0);
  return true;
}
