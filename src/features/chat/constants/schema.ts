import { z } from 'zod';

// 상담 단계 타입
export const counselingStepSchema = z.enum([
  'initial',      // 초기 고민 접수
  'exploration',  // 상세 탐색 (4-5개 질문)
  'analysis',     // 종합 분석 및 답변
  'followup'      // 후속 상담
]);

export type CounselingStep = z.infer<typeof counselingStepSchema>;

// 상담 세션 상태
export const counselingSessionSchema = z.object({
  sessionId: z.string(),
  step: counselingStepSchema,
  initialConcern: z.string().optional(),
  explorationQuestions: z.array(z.string()).default([]),
  explorationAnswers: z.array(z.string()).default([]),
  currentQuestionIndex: z.number().default(0),
  isComplete: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type CounselingSession = z.infer<typeof counselingSessionSchema>;

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
  // 다단계 상담 관련 필드 추가
  counselingStep: counselingStepSchema.optional(),
  nextQuestion: z.string().optional(),
  isQuestionPhase: z.boolean().default(false),
  progress: z.object({
    current: z.number(),
    total: z.number(),
  }).optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
