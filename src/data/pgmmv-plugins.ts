// Plugin list used by the /pgmmv/ pages. This is a placeholder: ticket #9 replaces it with the
// offline snapshot (parameters, action commands, link conditions, downloads).
export interface PgmmvPlugin {
  slug: string;
  name: string;
}

export const pgmmvPlugins: readonly PgmmvPlugin[] = [
  { slug: 'collision-plugin', name: 'Collision Plugin' },
  { slug: 'coordinates-plugin', name: 'Coordinates Plugin' },
  { slug: 'snap-to-tile-plugin', name: 'Snap-To-Tile Plugin' },
  { slug: 'storage-plugin', name: 'Storage Plugin' },
];
