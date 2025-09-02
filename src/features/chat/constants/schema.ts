import { z } from 'zod';

export const chatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  locale: z.string().optional(),
  userAgent: z.string().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;


