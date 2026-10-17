import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileForRoute, missingRoutes } from '../scripts/check-routes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const { routes, redirects } = JSON.parse(readFileSync(join(root, 'routes.json'), 'utf8'));

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

test('redirects map /spiderex/ to /tools/spiderex/ with meta refresh', () => {
  assert.equal(redirects['/spiderex/'], '/tools/spiderex/');
  const spiderexHtmlPath = join(dist, 'spiderex', 'index.html');
  if (existsSync(spiderexHtmlPath)) {
    const html = readFileSync(spiderexHtmlPath, 'utf8');
    assert.match(html, /url=\/tools\/spiderex\//);
  }
});

test('new tool routes exist in dist when built', () => {
  const toolsIndex = join(dist, 'tools', 'index.html');
  const spiderexIndex = join(dist, 'tools', 'spiderex', 'index.html');
  if (existsSync(dist)) {
    assert.ok(existsSync(toolsIndex), 'dist/tools/index.html missing');
    assert.ok(existsSync(spiderexIndex), 'dist/tools/spiderex/index.html missing');
  }
});
