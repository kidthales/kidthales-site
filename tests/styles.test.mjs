import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const styles = join(root, 'src', 'styles');
const picotolRoot = join(root, 'node_modules', '@kidthales', 'picotol');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

const tolData = JSON.parse(readFileSync(join(picotolRoot, 'data', 'tol-qualitative.json'), 'utf8'));
const allowedHexSet = new Set(tolData.allowedHexes.map((h) => h.toUpperCase()));

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const schemeColor = (schemeId, nameOrIndex) => {
  const list = tolData.schemes[schemeId].colors;
  if (typeof nameOrIndex === 'number') return list[nameOrIndex].hex;
  return list.find((c) => c.name === nameOrIndex).hex;
};

const achromaticColor = (name) => tolData.achromatic.find((a) => a.name === name).hex;

test('dependency tree integrates @kidthales/picotol and has no Sass, Bootstrap, Tailwind or Pico', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.ok(pkg.dependencies['@kidthales/picotol'], '@kidthales/picotol must be in dependencies');
  const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  for (const banned of [/sass/, /bootstrap/, /tailwind/, /^@?picocss/]) {
    assert.deepEqual(names.filter((n) => banned.test(n)), [], String(banned));
  }
});

test('main.css imports @kidthales/picotol and site extensions cleanly', () => {
  const main = stripComments(readFileSync(join(styles, 'main.css'), 'utf8'));
  assert.match(main, /@import\s+'@kidthales\/picotol';/);
  assert.match(main, /@import\s+'\.\/site\/branding\.css';/);
  assert.match(main, /@import\s+'\.\/site\/spiderex\.css';/);
  assert.ok(!existsSync(join(styles, 'vendor')), 'Redundant src/styles/vendor directory must be removed');
  assert.ok(!existsSync(join(styles, 'shared')), 'Redundant src/styles/shared directory must be removed');
});

test('contrast in light and dark themes (data-accent="cyan") meets WCAG 2.2 AA/AAA', () => {
  const lightBg = achromaticColor('white'); // #FFFFFF
  const lightText = achromaticColor('black'); // #000000
  const lightMuted = achromaticColor('grey-800'); // #444444
  const lightBorder = achromaticColor('grey-500'); // #888888

  const darkBg = achromaticColor('black'); // #000000
  const darkText = achromaticColor('white'); // #FFFFFF
  const darkMuted = achromaticColor('grey-200'); // #DDDDDD
  const darkBorder = achromaticColor('grey-700'); // #666666

  // Cyan accent ladder (--pt-p1..--pt-p5)
  const cyanP1 = schemeColor('pale', 1); // #CCEEFF
  const cyanP2 = schemeColor('light', 'light_cyan'); // #99DDFF
  const cyanP3 = schemeColor('vibrant', 'blue'); // #0077BB
  const cyanP4 = schemeColor('dark', 6); // #117788
  const cyanP5 = schemeColor('dark', 5); // #006644

  // Light theme checks
  assert.ok(ratio(lightText, lightBg) >= 7.0, 'Light text AAA');
  assert.ok(ratio(lightMuted, lightBg) >= 7.0, 'Light muted text AAA');
  assert.ok(ratio(lightBorder, lightBg) >= 3.0, 'Light border SC 1.4.11 >= 3.0');
  assert.ok(ratio(cyanP4, lightBg) >= 4.5, 'Light cyan primary link AA');
  assert.ok(ratio(cyanP5, lightBg) >= 4.5, 'Light cyan primary link hover AA');
  assert.ok(ratio(cyanP1, lightText) >= 7.0, 'Light cyan button fill AAA');
  assert.ok(ratio(cyanP2, lightText) >= 7.0, 'Light cyan button hover fill AAA');

  // Dark theme checks
  assert.ok(ratio(darkText, darkBg) >= 7.0, 'Dark text AAA');
  assert.ok(ratio(darkMuted, darkBg) >= 7.0, 'Dark muted text AAA');
  assert.ok(ratio(darkBorder, darkBg) >= 3.0, 'Dark border SC 1.4.11 >= 3.0');
  assert.ok(ratio(cyanP2, darkBg) >= 7.0, 'Dark cyan primary link AAA');
  assert.ok(ratio(cyanP1, darkBg) >= 7.0, 'Dark cyan primary link hover AAA');
  assert.ok(ratio(cyanP4, darkText) >= 4.5, 'Dark cyan button fill AA');
  assert.ok(ratio(cyanP3, darkText) >= 4.5, 'Dark cyan button hover fill AA');
});

test('site extension stylesheets maintain 100% Paul Tol hex purity and --pt-* token usage', () => {
  const siteDir = join(styles, 'site');
  for (const file of readdirSync(siteDir).filter((f) => f.endsWith('.css'))) {
    const css = stripComments(readFileSync(join(siteDir, file), 'utf8'));
    assert.doesNotMatch(css, /--color-/, `${file} must not reference legacy --color-* tokens`);
    assert.doesNotMatch(css, /--tc-/, `${file} must not reference legacy --tc-* tokens`);
    assert.doesNotMatch(css, /\b(?:rgb|rgba|hsl|hsla|oklch|lab|lch)\s*\(/i, `${file} uses forbidden color function`);
    for (const m of css.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
      assert.ok(allowedHexSet.has(m[0].toUpperCase()), `${file} contains non-Tol hex ${m[0]}`);
    }
  }
});
