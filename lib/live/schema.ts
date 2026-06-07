import { z } from 'zod';

export const counterSchema = z.object({
  id: z.string().min(1).max(40),
  icon: z.string().max(8).optional(),
  value: z.number().int().nonnegative(),
  labelAm: z.string().min(1).max(120),
  labelEn: z.string().max(120).optional(),
  labelRu: z.string().max(120).optional(),
  note: z.string().max(160).optional(),
});

export const summaryContentSchema = z.object({
  badge: z.string().max(80).optional(),
  title: z.string().min(1).max(200),
  intro: z.string().max(4000).optional(),
  highlight: z.string().max(2000).optional(),
  issues: z.array(z.string().min(1).max(600)).max(30).optional(),
  cases: z
    .array(
      z.object({
        stations: z.string().max(120).optional(),
        text: z.string().min(1).max(800),
      }),
    )
    .max(30)
    .optional(),
  nextNote: z.string().max(2000).optional(),
  hashtags: z.array(z.string().min(1).max(60)).max(20).optional(),
});

export const livePostContentSchema = z.object({
  am: summaryContentSchema,
  en: summaryContentSchema.optional(),
  ru: summaryContentSchema.optional(),
});

export const livePostInputSchema = z.object({
  kind: z.enum(['interim_summary', 'flash']).default('interim_summary'),
  pinned: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
  asOf: z.coerce.date().nullish(),
  counters: z.array(counterSchema).max(12).default([]),
  content: livePostContentSchema,
});

export const livePostPatchSchema = livePostInputSchema.partial().extend({
  id: z.string().uuid(),
});

export type LivePostInput = z.infer<typeof livePostInputSchema>;
export type LivePostPatch = z.infer<typeof livePostPatchSchema>;
