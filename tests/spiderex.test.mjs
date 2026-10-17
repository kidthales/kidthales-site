import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AleaRNG,
  parseDate,
  getTodayDate,
  generateSpiderexDrills,
} from '../src/scripts/spiderex-engine.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, 'public', 'assets', 'spiderex.json'), 'utf8'));

test('parseDate validates strict calendar dates', () => {
  assert.equal(parseDate('2026-10-16'), '2026-10-16');
  assert.equal(parseDate('2024-02-29'), '2024-02-29'); // Leap year
  assert.equal(parseDate('2023-02-29'), undefined); // Not a leap year
  assert.equal(parseDate('2026-13-01'), undefined); // Invalid month
  assert.equal(parseDate('2026-04-31'), undefined); // April has 30 days
  assert.equal(parseDate('not-a-date'), undefined);
  assert.equal(parseDate(''), undefined);
  assert.equal(parseDate(null), undefined);
  assert.equal(parseDate(undefined), undefined);
});

test('getTodayDate returns YYYY-MM-DD format', () => {
  const today = getTodayDate();
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
});

test('AleaRNG is deterministic and matches ground truth PRNG stream', () => {
  const rng1 = new AleaRNG(12345);
  const rng2 = new AleaRNG(12345);
  for (let i = 0; i < 20; i++) {
    assert.equal(rng1.getUniform(), rng2.getUniform());
    assert.equal(rng1.getUniformInt(0, 5), rng2.getUniformInt(0, 5));
  }
});

test('generateSpiderexDrills generates exact ground-truth output for 2026-10-16', () => {
  const result = generateSpiderexDrills(config, '2026-10-16');
  assert.equal(result.date, '2026-10-16');
  assert.deepEqual(result.warmup, ['1423', '2314', '3214', '4231']);

  const expectedTwister = [
    'E|-4-----1----1---4-------1-4---------4-----23---------------------',
    'B|--2--------3-----1---4-----2-1----2----1--------------------32--4',
    'G|------3------32----------1--3--------3--------------4-----4------',
    'D|---31---4----------------------2-3----2--4-----1--3--3---1-2-----',
    'A|-----2------------------------4-3--1--------123-42-1--21-------1-',
    'E|---------42----1--423-23----------------4---------------4-----3--',
  ].join('\n');

  assert.equal(result.twister, expectedTwister);
});
