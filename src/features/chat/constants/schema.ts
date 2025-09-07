import { z } from 'zod';

export const chatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  locale: z.string().optional(),
  userAgent: z.string().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  content: z.string().min(1),
  verses: z
    .array(
      z.object({
        book: z.string(),
        chapter: z.string(),
        verse: z.string(),
      }),
    )
    .default([]),
  prayer: z.string().optional(),
  mocked: z.boolean().optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
