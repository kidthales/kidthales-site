---
title: "Docker Aseprite Headless"
summary: "Multi-platform container builder featuring a headless Aseprite CLI binary suitable for automation, build scripts, and headless CI pipelines."
repo: "kidthales/docker-aseprite-headless"
status: "Active"
tags: ["Docker", "Aseprite", "DevOps", "CI/CD", "GameDev", "Buildx"]
tier: 2
cluster: "devops-toolchains"
clusterLabel: "DevOps & Game Asset Toolchains"
clusterOrder: 2
featured: true
release: "v1.3.18.6-headless"
registry:
  image: "ghcr.io/kidthales/aseprite:v1.3.18.6-headless"
  pullSnippet: "docker buildx bake -f docker-bake.hcl"
docs: "https://github.com/kidthales/docker-aseprite-headless#readme"
---

Build and distribute multi-platform container images featuring a headless [Aseprite](https://www.aseprite.org/) binary suitable for CLI automation, sprite packing scripts, and headless CI pipelines.

Built on **Ubuntu 24.04 LTS (Noble Numbat)** with zero critical vulnerabilities and native multi-architecture support for **`linux/amd64`** and **`linux/arm64`**.

## Downstream Dockerfile Integration

```dockerfile
FROM ubuntu:24.04

# Copy pre-compiled Aseprite CLI binary
COPY --from=ghcr.io/kidthales/aseprite:v1.3.18.6-headless /opt/aseprite/bin/aseprite /usr/local/bin/aseprite

# Minimal runtime libraries (fontconfig, x11)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc++1-18 \
    libfontconfig1 \
    libx11-6 \
    && rm -rf /var/lib/apt/lists/*

RUN aseprite --batch --version
```
