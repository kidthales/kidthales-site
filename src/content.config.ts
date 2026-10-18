import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    repo: z.string(),
    status: z.string(),
    tags: z.array(z.string()),
    tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    cluster: z.enum(['ui-design', 'devops-toolchains', 'tools-ecosystem']),
    clusterLabel: z.string(),
    clusterOrder: z.number().default(1),
    featured: z.boolean().default(false),
    release: z.string().optional(),
    registry: z
      .object({
        image: z.string(),
        tags: z.array(z.string()).optional(),
        pullSnippet: z.string().optional(),
      })
      .optional(),
    docs: z.string().optional(),
    demo: z.string().optional(),
    link: z.string().optional(),
  }),
});

export const collections = { projects };
