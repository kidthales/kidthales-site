/**
 * Vanilla Theme Switcher
 *
 * Respects OS prefers-color-scheme, supports explicit light/dark overrides,
 * persists choice to localStorage, and updates accessible toggle controls.
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const LEGACY_STORAGE_KEY = 'app/theme/prefers-dark';

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'light' || val === 'dark') return val;

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === 'true') return 'dark';
    if (legacy === 'false') return 'light';
  } catch (_) {
    // localStorage blocked
  }
  return null;
}

export function getActiveTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.dataset.theme;
  if (attr === 'light' || attr === 'dark') return attr;
  return getStoredTheme() ?? getSystemTheme();
}

export function setTheme(theme: Theme | 'system'): void {
  if (typeof document === 'undefined') return;

  if (theme === 'system') {
    delete document.documentElement.dataset.theme;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (_) {}
  } else {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(theme === 'dark'));
    } catch (_) {}
  }

  updateToggleButtons();
}

export function toggleTheme(): Theme {
  const current = getActiveTheme();
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function updateToggleButtons(): void {
  if (typeof document === 'undefined') return;
  const current = getActiveTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  const buttons = document.querySelectorAll<HTMLElement>('[data-theme-toggle]');

  buttons.forEach((btn) => {
    btn.setAttribute('aria-label', `Switch to ${next} theme (current: ${current})`);
    btn.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
    btn.setAttribute('data-current-theme', current);

    // Update text content if text container exists
    const labelSpan = btn.querySelector<HTMLElement>('[data-theme-label]');
    if (labelSpan) {
      labelSpan.textContent = current === 'dark' ? 'Dark' : 'Light';
    }
  });
}

export function initThemeToggle(): void {
  if (typeof document === 'undefined') return;

  updateToggleButtons();

  document.addEventListener('click', (e) => {
    const target = (e.target as Element | null)?.closest('[data-theme-toggle]');
    if (target) {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Listen to OS preference changes if no manual override is set
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!getStoredTheme()) {
        updateToggleButtons();
      }
    });
  }
}

// Auto-run if loaded directly in browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
}
