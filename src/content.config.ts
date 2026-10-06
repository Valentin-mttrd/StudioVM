import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    category: z.enum(['web', 'applications', '3d']),
    status: z.enum(['demo', 'personal', 'in-progress', 'concept']),
    summary: z.string(),
    // Concepts only: the real business the site was imagined for.
    subject: z.string().optional(),
    // Real screenshots of the site; projects without them keep an abstract cover.
    cover: image().optional(),
    coverMobile: image().optional(),
    highlights: z.array(z.string()).default([]),
    coverVariant: z.number().int().min(1).max(6).default(1),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

export const collections = { projects };
