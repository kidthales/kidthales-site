# kidthales-site

Personal site for kidthales: devlog, long-form writing, open-source projects and small web tools. Built with [Astro](https://astro.build) as a static site.

> Status: bootstrapping. Site code is tracked in the issues of this repository; start with the epic (#1).

## Production gate

`kidthales.com` is still served from the older [`kidthales.github.io`](https://github.com/kidthales/kidthales.github.io) repository. This repository must not change production until the explicit, owner-approved cutover ticket (#12). Until then, deployments from here are preview-only and never include a `CNAME`.

## Conventions

- Conventional Commits.
- Public repo hygiene: agent configuration and learnings are never tracked here (see `.gitignore`). CI fails if such paths are tracked.
- Colours come from the Paul Tol schemes; see the epic for the data source.

## License

Source code is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0). The license for written content (devlog and long-form posts) will be decided separately and recorded here.

## Development

Requires Node 22.22 or newer.

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run check` | Astro and TypeScript diagnostics (strictest mode) |
| `npm run build` | Static build into `dist/` |
| `npm run check:routes` | Verifies every route in `routes.json` exists in `dist/` (and that no `CNAME` is shipped) |
| `npm test` | Unit tests |

`routes.json` is the committed list of URLs that must keep working from the legacy site. Anything dropped or moved needs an entry in its `redirects` map and an owner-approved note before the cutover (#12).

## Previewing

There is no hosted preview before the production cutover (#12). Preview locally with `npm run build && npm run preview`, or download the `site-dist` artifact from a CI run (kept for 7 days).
