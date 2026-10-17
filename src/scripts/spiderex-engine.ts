/**
 * Spiderex Guitar Fingering Drill Generator
 *
 * Deterministic PRNG implementation matching Johannes Baagøe's Alea algorithm
 * (historically provided by rot.js) for 100% parity with legacy kidthales.com.
 */

export interface SpiderexConfig {
  strings: number;
  permutations: [number, number, number, number][];
}

export interface SpiderexDrills {
  date: string;
  warmup: string[];
  twister: string;
}

export class AleaRNG {
  private static readonly FRAC = 2.3283064365386963e-10; // 2^-32
  private _seed = 0;
  private _s0 = 0;
  private _s1 = 0;
  private _s2 = 0;
  private _c = 0;

  constructor(seed?: number) {
    if (seed !== undefined) {
      this.setSeed(seed);
    }
  }

  getSeed(): number {
    return this._seed;
  }

  setSeed(seed: number): this {
    let t = seed < 1 ? 1 / seed : seed;
    this._seed = t;
    this._s0 = (t >>> 0) * AleaRNG.FRAC;
    t = (69069 * t + 1) >>> 0;
    this._s1 = t * AleaRNG.FRAC;
    t = (69069 * t + 1) >>> 0;
    this._s2 = t * AleaRNG.FRAC;
    this._c = 1;
    return this;
  }

  getUniform(): number {
    const t = 2091639 * this._s0 + this._c * AleaRNG.FRAC;
    this._s0 = this._s1;
    this._s1 = this._s2;
    this._c = 0 | t;
    this._s2 = t - this._c;
    return this._s2;
  }

  getUniformInt(lower: number, upper: number): number {
    const max = Math.max(lower, upper);
    const min = Math.min(lower, upper);
    return Math.floor(this.getUniform() * (max - min + 1)) + min;
  }

  getItem<T>(arr: readonly T[]): T | null {
    if (!arr.length) return null;
    const item = arr[Math.floor(this.getUniform() * arr.length)];
    return item ?? null;
  }

  shuffle<T>(arr: readonly T[]): T[] {
    const result: T[] = [];
    const copy = arr.slice();
    while (copy.length) {
      const item = this.getItem(copy);
      if (item === null) break;
      const idx = copy.indexOf(item);
      const removed = copy.splice(idx, 1)[0];
      if (removed !== undefined) {
        result.push(removed);
      }
    }
    return result;
  }
}

/**
 * Validates a YYYY-MM-DD date string.
 * Returns normalized string if valid calendar date, undefined otherwise.
 */
export function parseDate(candidate: string | null | undefined): string | undefined {
  if (!candidate || !candidate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return undefined;
  }
  const date = new Date(candidate);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== candidate) {
    return undefined;
  }
  return candidate;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in the local user's timezone.
 */
export function getTodayDate(now: Date = new Date()): string {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Generates Spiderex warmup drills and twister tablature for a given config and date.
 */
export function generateSpiderexDrills(config: SpiderexConfig, dateStr: string): SpiderexDrills {
  const validDate = parseDate(dateStr);
  if (!validDate) {
    throw new Error(`Invalid date format (expected YYYY-MM-DD): "${dateStr}"`);
  }

  const firstPerm = config.permutations[0];
  if (!firstPerm) {
    throw new Error('Config has empty permutations');
  }

  const patternLength = firstPerm.length;
  const patterns: [number, number, number, number][][] = Array.from({ length: patternLength }, () => []);

  for (const perm of config.permutations) {
    const group = patterns[perm[0] - 1];
    if (group) {
      group.push(perm);
    }
  }

  const rng = new AleaRNG();
  const seed = parseInt(validDate.replace(/-/g, ''), 10);
  rng.setSeed(seed);

  const warmupPatterns: [number, number, number, number][] = [];
  for (let i = 0; i < patterns.length; i++) {
    const group = patterns[i];
    if (group && group.length) {
      const picked = rng.getItem(rng.shuffle(group));
      if (picked) {
        warmupPatterns.push(picked);
      }
    }
  }

  // 6 standard guitar strings: E, B, G, D, A, E
  const stringPrefixes = ['E|-', 'B|-', 'G|-', 'D|-', 'A|-', 'E|-'];
  const twisterTablature = stringPrefixes.slice(0, config.strings);

  const twisterSet = rng.shuffle([
    ...warmupPatterns,
    ...warmupPatterns,
    ...warmupPatterns,
    ...warmupPatterns,
  ]);

  for (const twisterPattern of twisterSet) {
    for (const position of twisterPattern) {
      const activeString = rng.getUniformInt(0, config.strings - 1);
      for (let s = 0; s < config.strings; s++) {
        const prefix = twisterTablature[s];
        if (prefix !== undefined) {
          twisterTablature[s] = prefix + (s === activeString ? position.toString() : '-');
        }
      }
    }
  }

  return {
    date: validDate,
    warmup: warmupPatterns.map((p) => p.join('')),
    twister: twisterTablature.join('\n'),
  };
}
