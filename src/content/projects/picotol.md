---
title: "@kidthales/picotol"
summary: "Pure-CSS, ultra-minified (<10 KB core) semantic HTML framework powered strictly by scientific colorblind-safe color schemes."
repo: "kidthales/picotol"
status: "Active"
tags: ["CSS", "Design System", "Accessibility", "WCAG", "Semantic HTML"]
tier: 2
cluster: "ui-design"
clusterLabel: "Accessible UI & Design Systems"
clusterOrder: 1
featured: true
release: "v0.1.0"
demo: "https://kidthales.github.io/picotol/"
docs: "https://github.com/kidthales/picotol#readme"
---

`@kidthales/picotol` is a pure-CSS, ultra-minified semantic HTML framework designed for fast, clean, accessible web development without the overhead of utility class soup.

## Core Architectural Invariants

- **Scientific Colorblind-Safe Palettes**: Every hex code is drawn directly from established, mathematically calibrated qualitative color schemes. Zero invented hex codes, zero arbitrary synthetic ramps.
- **Cross-Scheme Perceptual Lightness Ladder**: Instead of darkening colors with arbitrary math, interactive states (hover, surface, focus) step across scientifically calibrated contrast layers:
  $$\text{pale} \longrightarrow \text{light} \longrightarrow \text{medium-contrast} \longrightarrow \text{bright} \longrightarrow \text{dark} \longrightarrow \text{high-contrast}$$
- **100% Pure Modern CSS**: Leverages native CSS `@layer`, `light-dark()`, and `color-mix()` with zero Sass or PostCSS preprocessors. Runtime `[data-theme="light|dark"]` and `[data-accent="blue|cyan|green|yellow|red|purple"]` switching in a single unified stylesheet.
- **Certified WCAG 2.2 AA/AAA Accessibility**:
  - High-contrast `:focus-visible` outlines (`2px solid`) that survive Windows High Contrast mode (`@media (forced-colors: active)`).
  - Explicit non-color validation cues (`2px` border + `✓` / `✗` prefix icons on `[aria-invalid]`) and $\ge 24\times24\text{px}$ touch target sizes.
  - Zero horizontal overflow at `320px` viewport width (WCAG 2.2 SC 1.4.10 Reflow), `.skip-to-content`, and `.sr-only` accessibility helpers.
- **Two-Tier Ultra-Minified Distribution**:
  - **`picotol.core.min.css`** ($\sim 9.1\text{ KB}$ minified, $\sim 2.5\text{ KB}$ gzip): Landmarks (`body > header, main, footer`), `.container`, `.grid`, fluid typography, native forms, tables, and nav.
  - **`picotol.min.css`** ($\sim 15.0\text{ KB}$ minified, $\sim 3.6\text{ KB}$ gzip): Core + `<article>` cards, `<details>` accordions, `<dialog>` modals, `<progress>`, and `[role="switch"]`.

## Quick Start

```html
<link rel="stylesheet" href="https://unpkg.com/@kidthales/picotol/dist/picotol.min.css" />
<html lang="en" data-theme="dark" data-accent="cyan">
  <body>
    <main>
      <h1>Semantic HTML with Certified Colorblind Safety</h1>
      <p>Clean HTML5 with zero utility classes.</p>
    </main>
  </body>
</html>
```
