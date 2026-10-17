import {
  parseDate,
  getTodayDate,
  generateSpiderexDrills,
  type SpiderexConfig,
} from './spiderex-engine';

export async function initSpiderex(): Promise<void> {
  const container = document.querySelector<HTMLElement>('[data-spiderex]');
  if (!container) return;

  const form = container.querySelector<HTMLFormElement>('form');
  const queryInput = container.querySelector<HTMLInputElement>('[data-spiderex-query], input[name="date"]');
  const warmupTarget = container.querySelector<HTMLElement>('[data-spiderex-warmup-results]');
  const twisterTarget = container.querySelector<HTMLElement>('[data-spiderex-twister-results]');

  if (!queryInput || !warmupTarget || !twisterTarget) {
    return;
  }

  let config: SpiderexConfig;
  try {
    const res = await fetch('/assets/spiderex.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    config = (await res.json()) as SpiderexConfig;
  } catch (err) {
    console.error('Failed to load Spiderex configuration:', err);
    warmupTarget.textContent = 'Error loading configuration file (/assets/spiderex.json).';
    return;
  }

  function render(dateStr: string): void {
    const valid = parseDate(dateStr);
    if (!valid) {
      warmupTarget!.innerHTML = `<p role="alert">Please enter a valid date in YYYY-MM-DD format.</p>`;
      twisterTarget!.innerHTML = '';
      return;
    }

    queryInput!.value = valid;

    try {
      const drills = generateSpiderexDrills(config, valid);

      // Render warmup list
      const ul = document.createElement('ul');
      ul.className = 'spiderex-warmup-list';
      for (const pat of drills.warmup) {
        const li = document.createElement('li');
        li.innerHTML = `<pre><code>${pat}</code></pre>`;
        ul.appendChild(li);
      }
      warmupTarget!.replaceChildren(ul);

      // Render twister tablature
      const pre = document.createElement('pre');
      pre.className = 'tablature';
      const code = document.createElement('code');
      code.textContent = drills.twister;
      pre.appendChild(code);
      twisterTarget!.replaceChildren(pre);
    } catch (err) {
      console.error('Spiderex generation failed:', err);
      warmupTarget!.innerHTML = `<p role="alert">Generation error: ${String(err)}</p>`;
      twisterTarget!.innerHTML = '';
    }
  }

  function resolveDateFromUrl(): string {
    const params = new URLSearchParams(window.location.search);
    const candidate = params.get('date');
    const valid = parseDate(candidate);
    if (valid) return valid;

    const today = getTodayDate();
    const url = new URL(window.location.href);
    url.searchParams.set('date', today);
    window.history.replaceState({}, '', url.toString());
    return today;
  }

  // Initial load
  const initialDate = resolveDateFromUrl();
  render(initialDate);

  // Form submit handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = queryInput.value.trim();
      const valid = parseDate(val);
      if (valid) {
        const url = new URL(window.location.href);
        url.searchParams.set('date', valid);
        window.history.pushState({}, '', url.toString());
        render(valid);
      } else {
        render(val); // Triggers validation message
      }
    });
  }

  // Handle browser back/forward history
  window.addEventListener('popstate', () => {
    const date = resolveDateFromUrl();
    render(date);
  });
}

// Auto-run if loaded directly in browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void initSpiderex();
    });
  } else {
    void initSpiderex();
  }
}
