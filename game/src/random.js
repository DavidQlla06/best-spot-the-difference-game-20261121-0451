// Seeded pseudo-random generator (mulberry32). Every harbor scene is built
// from one seed, so both panels start from the identical layout and the
// only differences are the ones the planter deliberately introduces.
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function between(next, low, high) {
  return low + next() * (high - low);
}

export function choose(next, list) {
  return list[Math.floor(next() * list.length)];
}

export function shuffled(next, list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}
