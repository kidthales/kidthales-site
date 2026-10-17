export interface ToolItem {
  id: string;
  name: string;
  description: string;
  href: string;
}

export const tools: readonly ToolItem[] = [
  {
    id: 'spiderex',
    name: 'Spiderex',
    description: 'Daily guitar fingering drills (warmup permutations and string-crossing twister tablature).',
    href: '/tools/spiderex/',
  },
];
