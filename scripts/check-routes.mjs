// Verifies every route in routes.json exists in dist/ (run after `npm run build`).
// "/dir/" must produce dist/dir/index.html; "/file.ext" must produce dist/file.ext.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

export function fileForRoute(route) {
  return route.endsWith('/') ? join(dist, route, 'index.html') : join(dist, route);
}

export function missingRoutes(routes) {
  return routes.filter((r) => !existsSync(fileForRoute(r)) || statSync(fileForRoute(r)).size === 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (!existsSync(dist)) {
    console.error('dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }
  const { routes } = JSON.parse(readFileSync(join(root, 'routes.json'), 'utf8'));
  const missing = missingRoutes(routes);
  if (missing.length) {
    console.error(`Missing routes (${missing.length}):\n  ${missing.join('\n  ')}`);
    process.exit(1);
  }
  const hasCname = existsSync(join(dist, 'CNAME'));
  if (hasCname) {
    console.error('dist/CNAME must not exist before the cutover ticket (#12).');
    process.exit(1);
  }
  console.log(`All ${routes.length} routes present; no CNAME in the build output.`);
}
