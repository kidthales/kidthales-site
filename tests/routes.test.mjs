import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileForRoute, missingRoutes } from '../scripts/check-routes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { routes } = JSON.parse(readFileSync(join(root, 'routes.json'), 'utf8'));

test('routes.json lists the nine legacy routes and no CNAME', () => {
  assert.equal(routes.length, 9);
  assert.equal(new Set(routes).size, routes.length, 'duplicates');
  for (const r of routes) assert.match(r, /^\/(.*\/|.*\.[a-z]+)?$/, r);
  assert.ok(!routes.includes('/CNAME'));
});

test('directory routes map to index.html, file routes to themselves', () => {
  assert.ok(fileForRoute('/pgmmv/').endsWith(join('pgmmv', 'index.html')));
  assert.ok(fileForRoute('/404.html').endsWith('404.html'));
});

test('missingRoutes reports routes absent from dist', () => {
  assert.deepEqual(missingRoutes(['/definitely-not-a-route/']), ['/definitely-not-a-route/']);
});
