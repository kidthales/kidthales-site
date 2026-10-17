import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const styles = join(root, 'src', 'styles');
const read = (p) => readFileSync(join(styles, p), 'utf8');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

// ---- minimal custom-property resolver (var() and light-dark() over hex values) ----
const files = ['vendor/tol/bright.css', 'vendor/tol/dark.css', 'vendor/tol/pale.css', 'vendor/tol/light.css', 'shared/tokens-base.css', 'site/tokens.css'];
const props = new Map();
for (const f of files) {
  for (const m of stripComments(read(f)).matchAll(/(--[\w-]+):\s*([^;]+);/g)) props.set(m[1], m[2].trim());
}

function resolve(value, theme, depth = 0) {
  if (depth > 10) throw new Error(`var() nesting too deep: ${value}`);
  let v = value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    assert.ok(props.has(name), `undefined custom property ${name}`);
    return resolve(props.get(name), theme, depth + 1);
  });
  v = v.replace(/light-dark\(\s*(#[0-9A-Fa-f]{6})\s*,\s*(#[0-9A-Fa-f]{6})\s*\)/g, (_, light, dark) => (theme === 'light' ? light : dark));
  return v.trim();
}
const color = (name, theme) => {
  assert.ok(props.has(name), `missing token ${name}`);
  const v = resolve(props.get(name), theme);
  assert.match(v, /^#[0-9A-Fa-f]{6}$/, `${name} did not resolve to a hex colour: ${v}`);
  return v;
};

// ---- WCAG 2.x contrast ----
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground token, background token, minimum ratio]
const pairs = [
  ['--color-text', '--color-bg', 4.5],
  ['--color-text-muted', '--color-bg', 4.5],
  ['--color-text', '--color-surface', 4.5],
  ['--color-text-muted', '--color-surface', 4.5],
  ['--color-link', '--color-bg', 4.5],
  ['--color-link', '--color-surface', 4.5],
  ['--color-link-hover', '--color-bg', 4.5],
  ['--color-bg', '--color-link', 4.5], // button text on button background
  ['--color-bg', '--color-link-hover', 4.5], // button text on hover background
  ['--color-text', '--color-mark-bg', 4.5],
  ['--color-border', '--color-bg', 3], // input borders (non-text UI)
  ['--color-focus', '--color-bg', 3], // focus ring
];

for (const theme of ['light', 'dark']) {
  test(`contrast in the ${theme} theme meets WCAG AA`, () => {
    const report = [];
    for (const [fg, bg, min] of pairs) {
      const r = ratio(color(fg, theme), color(bg, theme));
      report.push(`${fg} on ${bg}: ${r.toFixed(2)} (min ${min})`);
      assert.ok(r >= min, `${theme}: ${fg} on ${bg} is ${r.toFixed(2)}, needs ${min}`);
    }
    if (process.env.SHOW_CONTRAST) console.log(report.join('\n'));
  });
}

test('every colour token resolves to a Tol value or white', () => {
  const allowed = new Set(
    files.slice(0, 4).flatMap((f) => [...stripComments(read(f)).matchAll(/:\s*(#[0-9A-Fa-f]{6});/g)].map((m) => m[1].toUpperCase())),
  );
  allowed.add('#FFFFFF');
  for (const name of [...props.keys()].filter((k) => k.startsWith('--color-'))) {
    for (const theme of ['light', 'dark']) assert.ok(allowed.has(color(name, theme).toUpperCase()), `${name} (${theme}) is not a Tol value`);
  }
});

test('cascade layers are declared in order and every import is assigned to a layer', () => {
  const main = stripComments(read('main.css'));
  assert.match(main, /@layer reset, tokens, base, layout, components;/);
  const imports = [...main.matchAll(/@import\s+'([^']+)'([^;]*);/g)];
  assert.ok(imports.length >= 8);
  for (const [, path, rest] of imports) {
    assert.match(rest, /layer\((reset|tokens|base|layout|components)\)/, `${path} has no layer`);
    assert.ok(existsSync(join(styles, path)), `${path} does not exist`);
  }
});

test('shared styles do not reference brand or vendor tokens', () => {
  for (const f of readdirSync(join(styles, 'shared'))) {
    const css = stripComments(read(`shared/${f}`));
    assert.doesNotMatch(css, /--tol-/, `${f} references a Tol token`);
  }
});

test('dependency tree has no Sass, Bootstrap, Tailwind or Pico', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  for (const banned of [/sass/, /bootstrap/, /tailwind/, /pico/]) {
    assert.deepEqual(names.filter((n) => banned.test(n)), [], String(banned));
  }
});

test('vendored palette files are documented in SYNC.md and carry the attribution header', () => {
  const sync = read('vendor/tol/SYNC.md');
  assert.match(sync, /Source commit/);
  for (const n of ['bright', 'dark', 'pale', 'light']) {
    assert.ok(sync.includes(n), `SYNC.md does not mention ${n}`);
    assert.match(read(`vendor/tol/${n}.css`), /not affiliated with or endorsed by Paul Tol/);
  }
});
