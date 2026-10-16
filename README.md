# kidthales-site

Personal site for kidthales: devlog, long-form writing, open-source projects and small web tools. Built with [Astro](https://astro.build) as a static site.

> Status: bootstrapping. Site code is tracked in the issues of this repository; start with the epic (#1).

## Production gate

`kidthales.com` is still served from the older [`kidthales.github.io`](https://github.com/kidthales/kidthales.github.io) repository. This repository must not change production until the explicit, owner-approved cutover ticket (#12). Until then, deployments from here are preview-only and never include a `CNAME`.

## Conventions

- Conventional Commits.
- Public repo hygiene: agent configuration and learnings are never tracked here (see `.gitignore`). CI fails if such paths are tracked.
- Colours come from the Paul Tol schemes; see the epic for the data source.
