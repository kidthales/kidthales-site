import { test } from 'node:test';
import assert from 'node:assert/strict';

// Test the core theme logic in a clean mock environment
test('theme resolution respects localStorage and prefers-color-scheme', async () => {
  // Setup global mocks
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  };

  let osDark = true;
  globalThis.window = {
    matchMedia: (query) => ({
      matches: query.includes('dark') ? osDark : !osDark,
      addEventListener: () => {},
    }),
  };

  const docEl = { dataset: {} };
  globalThis.document = {
    documentElement: docEl,
    querySelectorAll: () => [],
    addEventListener: () => {},
  };

  const { getActiveTheme, toggleTheme, setTheme, getStoredTheme } = await import(
    '../src/scripts/theme.ts'
  );

  // 1. Initial state: no stored theme -> matches OS preference (dark)
  assert.equal(getStoredTheme(), null);
  assert.equal(getActiveTheme(), 'dark');

  // 2. Toggle -> sets explicit light theme
  const next1 = toggleTheme();
  assert.equal(next1, 'light');
  assert.equal(docEl.dataset.theme, 'light');
  assert.equal(localStorage.getItem('theme'), 'light');
  assert.equal(getActiveTheme(), 'light');

  // 3. Toggle again -> sets explicit dark theme
  const next2 = toggleTheme();
  assert.equal(next2, 'dark');
  assert.equal(docEl.dataset.theme, 'dark');
  assert.equal(localStorage.getItem('theme'), 'dark');
  assert.equal(getActiveTheme(), 'dark');

  // 4. Set to system -> removes data-theme attribute and clears storage
  setTheme('system');
  assert.equal(docEl.dataset.theme, undefined);
  assert.equal(localStorage.getItem('theme'), null);
  assert.equal(getActiveTheme(), 'dark'); // Follows OS (dark)

  // 5. When OS changes to light
  osDark = false;
  assert.equal(getActiveTheme(), 'light');
});
