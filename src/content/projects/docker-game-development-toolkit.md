---
title: "Docker Game Development Toolkit"
summary: "A multi-platform container suite providing headless, curated asset-processing toolchains (Tiled, tile-extruder, YAML) for 2D game development CI/CD workflows."
repo: "kidthales/docker-game-development-toolkit"
status: "Active"
tags: ["Docker", "DevOps", "CI/CD", "GameDev", "Tiled", "GHCR"]
tier: 2
cluster: "devops-toolchains"
clusterLabel: "DevOps & Game Asset Toolchains"
clusterOrder: 2
featured: true
release: "2026.10.0"
registry:
  image: "ghcr.io/kidthales/gdtk:latest"
  tags: ["latest", "2026.10.0"]
  pullSnippet: "docker pull ghcr.io/kidthales/gdtk:latest"
docs: "https://github.com/kidthales/docker-game-development-toolkit#readme"
---

The **Docker Game Development Toolkit** provides automated, headless asset-processing toolchains for 2D game development build scripts, local Taskfile automations, and GitHub Actions CI pipelines.

Built on **Ubuntu 24.04 LTS (Noble Numbat)** with native multi-architecture support for **`linux/amd64`** (x86_64) and **`linux/arm64`** (Apple Silicon / ARM64).

## Contained Tools & Bill of Materials

| Tool | Version | CLI Binary | Tier | Purpose | Upstream License |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[Tiled](https://github.com/mapeditor/tiled)** | 1.12.2 | `tiled` | Free (`gdtk`) | 2D tilemap export (JSON, Lua, CSV) via headless Xvfb | GPL-2.0-or-later |
| **[tile-extruder](https://github.com/sporadic-labs/tile-extruder)** | 2.1.1 | `tile-extruder` | Free (`gdtk`) | Extrudes tile borders to prevent camera rendering seams | MIT |
| **[yaml](https://github.com/eemeli/yaml)** | 2.9.1 | `yaml` | Free (`gdtk`) | Fast YAML-to-JSON and JSON-to-YAML formatting & parsing | Apache-2.0 |
| **[Aseprite](https://github.com/aseprite/aseprite)** | v1.3.18.6 | `aseprite`, `ase` | Non-Free (`gdtk-non-free`) | Headless sprite slicing, tags export, and sheet packing | EULA (Proprietary) |

## CI/CD Pipeline Integration

```yaml
name: Compile Game Assets

on:
  push:
    branches: [main]

jobs:
  build-assets:
    runs-on: ubuntu-latest
    container:
      image: ghcr.io/kidthales/gdtk:latest
    steps:
      - uses: actions/checkout@v4
      - name: Export Tiled Maps
        run: tiled --export-map json raw-assets/maps/dungeon.tmx game/assets/maps/dungeon.json
      - name: Extrude Tilesets
        run: tile-extruder --tileWidth 16 --tileHeight 16 --input raw-assets/tilesets/dungeon.png --output game/assets/tilesets/dungeon_extruded.png
```
