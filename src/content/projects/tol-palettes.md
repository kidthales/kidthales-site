---
title: "@kidthales/tol-palettes"
summary: "Scientifically calibrated colorblind-safe color schemes with deterministic multi-environment code generators for CSS, TypeScript, Python, Godot 4, and Aseprite."
repo: "kidthales/tol-palettes"
status: "Active"
tags: ["Design System", "Colorblind Safety", "TypeScript", "Python", "Godot", "Aseprite"]
tier: 2
cluster: "ui-design"
clusterLabel: "Accessible UI & Design Systems"
clusterOrder: 1
featured: true
release: "v0.1.0"
docs: "https://github.com/kidthales/tol-palettes#readme"
---

`@kidthales/tol-palettes` provides colorblind-safe palette data sourced from Dr. Paul Tol's scientific research (SRON Netherlands Institute for Space Research), with automated multi-environment code generators for game development, data science, and web applications.

## Key Capabilities & Scope

- **Values Only, with Rigorous Attribution**: Stores verified color values and structural lookup rules across 22 distinct qualitative, sequential, and diverging color schemes.
- **Single Source of Truth**: One schema-validated JSON file per scheme (`data/schemes/*.json`) drives every compiled environment output in `dist/`.
- **Multi-Environment Outputs**:
  - **CSS Custom Properties**: Per-scheme stylesheets (`bright.css`, `muted.css`) and bundle (`tol.css`).
  - **JavaScript / TypeScript**: Tree-shakeable ESM module with full `.d.ts` type declarations and color interpolation functions.
  - **Python (`tol_palettes.py`)**: Standalone module with optional `matplotlib` colormap integration.
  - **Godot 4.x & Pixel Art**: Godot `ColorPalette` `.tres` resources, GDScript constants (`tol_palettes.gd`), and GIMP/Aseprite `.gpl` palettes.
  - **Offline HTML Gallery**: Zero-dependency reference gallery with copyable hex values and WCAG contrast ratio calculations.

## Installation & Quickstart

```bash
npm install @kidthales/tol-palettes
```

```typescript
import { bright, muted, interpolate } from '@kidthales/tol-palettes';

console.log(bright.colors); // [{ hex: '#4477AA', name: 'blue' }, ...]
console.log(interpolate('sunset', 0.5)); // '#FEDA8B'
```
