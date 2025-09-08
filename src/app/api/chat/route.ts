import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { retryWithBackoff, withCircuitBreaker } from '@/lib/retry';
import { chatRequestSchema, chatResponseSchema, CounselingStep } from '@/features/chat/constants/schema';
import { allowRequest, remainingFor } from '@/lib/ratelimit';
import { connectToDatabase } from '@/lib/mongodb';
import { Session } from '@/lib/models/session';
import { ChatRecord } from '@/lib/models/chat-record';
import { searchRelevantVerses } from '@/lib/services/bible-embedding';

export const runtime = 'nodejs';

// 간단한 상담 상태 관리 (메모리 기반)
const counselingStates = new Map<string, any>();

async function getCounselingState(sessionId: string) {
  if (!counselingStates.has(sessionId)) {
    counselingStates.set(sessionId, {
      step: 'initial',
      questionCount: 0,
      answers: [],
      isComplete: false,
      initialConcern: '',
      questions: []
    });
  }
  return counselingStates.get(sessionId);
}

async function updateCounselingState(sessionId: string, updates: any) {
  const current = await getCounselingState(sessionId);
  const updated = { ...current, ...updates };
  counselingStates.set(sessionId, updated);
  console.log('Updated counseling state:', updated);
  return updated;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  const ip =
    forwarded.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const key = `chat:${ip}`;
  if (!allowRequest(key)) {
    return NextResponse.json(
      {
        message: '요청이 너무 잦습니다. 잠시 후 다시 시도하세요.',
        retryAfterMs: 60_000,
        remaining: 0,
      },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { sessionId, message, locale, userAgent } = parsed.data;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: 'Server misconfigured: OPENAI_API_KEY missing' },
      { status: 500 },
    );
  }

  await connectToDatabase();
  await Session.updateOne(
    { sessionId },
    { $setOnInsert: { sessionId }, $set: { locale, userAgent } },
    { upsert: true },
  );

  await ChatRecord.create({ sessionId, role: 'user', content: message });

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // 다단계 상담 시스템
  const state = await getCounselingState(sessionId);
  console.log('Current state:', state);

  if (state.step === 'initial') {
    // 첫 번째 메시지: 질문 생성
    await updateCounselingState(sessionId, { 
      step: 'exploration', 
      initialConcern: message,
      questionCount: 0,
      answers: []
    });
    
    const questions = [
      "이 상황이 언제부터 시작되었나요?",
      "가장 힘든 부분은 무엇인가요?", 
      "주변 사람들의 반응은 어떤가요?",
      "신앙적으로 어떤 도전을 느끼시나요?",
      "어떤 변화를 원하시나요?"
    ];
    
    await updateCounselingState(sessionId, { questions });
    
    const content = `고민을 나눠주셔서 감사합니다. 더 나은 도움을 드리기 위해 몇 가지 질문을 드릴게요:\n\n1. ${questions[0]}\n2. ${questions[1]}\n3. ${questions[2]}\n4. ${questions[3]}\n5. ${questions[4]}\n\n편하게 답변해 주세요.`;
    
    const payload = chatResponseSchema.parse({
      content,
      verses: [],
      prayer: undefined,
      counselingStep: 'exploration',
      isQuestionPhase: true,
      progress: { current: 0, total: 5 },
    });
    
    await ChatRecord.create({
      sessionId,
      role: 'assistant',
      content: payload.content,
    });
    
    return NextResponse.json(payload);
    
  } else if (state.step === 'exploration') {
    // 질문에 대한 답변 수집
    const updatedState = await updateCounselingState(sessionId, {
      answers: [...state.answers, message],
      questionCount: state.questionCount + 1
    });
    
    if (updatedState.questionCount >= 4) {
      // 모든 질문 완료 - 종합 분석
      await updateCounselingState(sessionId, { step: 'analysis' });
      
      // 종합 분석 및 최종 응답 생성
      const allContent = [state.initialConcern, ...updatedState.answers].join(' ');
      const relevantVerses = await searchRelevantVerses(allContent, 5);
      
      const completion = await withCircuitBreaker(() =>
        retryWithBackoff(
          async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            try {
              const versesContext = relevantVerses.length > 0
                ? `\n\n관련 성경 구절들:\n${relevantVerses.map((v) => `- ${v.book} ${v.chapter}:${v.verse} - ${v.text}`).join('\n')}`
                : '';

              return await openai.chat.completions.create(
                {
                  model,
                  temperature: 0.3,
                  messages: [
                    {
                      role: 'system',
                      content: `당신은 공감 능력이 뛰어난 기독교 상담 챗봇입니다.

사용자가 상세한 상담을 받았고, 이제 종합적인 분석과 조언을 제공해야 합니다.

응답 형식을 반드시 지켜주세요:
1. 먼저 사용자의 고민에 대한 깊은 공감과 이해 표현
2. 상황을 종합적으로 분석하고 성경적 관점에서 조언
3. 관련된 성경 구절을 명확하게 언급 (책명, 장, 절 포함)
4. 구체적이고 실용적인 해결 방안 제시
5. 마지막에 "오늘의 기도" 제안

성경 구절은 한국어 성경 기준으로 정확한 책명을 사용하세요.
기도는 간단하고 실용적으로 제시하세요.${versesContext}`,
                    },
                    {
                      role: 'user',
                      content: `초기 고민: ${state.initialConcern}\n\n상세 답변들:\n${updatedState.answers.map((answer: string, index: number) => `${index + 1}. ${answer}`).join('\n')}`,
                    },
                  ],
                },
                { signal: controller.signal as any },
              );
            } finally {
              clearTimeout(timeout);
            }
          },
          { retries: 2, baseMs: 700 },
        ),
      );

      const content = completion.choices[0]?.message?.content ?? '';
      const { verses, prayer } = extractVersesAndPrayer(content);

      const combinedVerses = [
        ...relevantVerses.map((v) => ({
          book: v.book,
          chapter: v.chapter.toString(),
          verse: v.verse.toString(),
        })),
        ...verses,
      ];

      const uniqueVerses = combinedVerses.filter(
        (verse, index, self) =>
          index ===
          self.findIndex(
            (v) => v.book === verse.book && v.chapter === verse.chapter && v.verse === verse.verse,
          ),
      );

      await updateCounselingState(sessionId, { 
        step: 'followup', 
        isComplete: true 
      });

      const payload = chatResponseSchema.parse({
        content: content || '죄송합니다. 잠시 후 다시 시도해주세요.',
        verses: uniqueVerses,
        prayer,
        counselingStep: 'followup',
        isQuestionPhase: false,
      });

      await ChatRecord.create({
        sessionId,
        role: 'assistant',
        content: payload.content,
        verses: payload.verses,
        prayer: payload.prayer,
      });

      return NextResponse.json(payload);
      
    } else {
      // 다음 질문 제시
      const nextQuestion = state.questions[updatedState.questionCount];
      const content = `감사합니다. 다음 질문에 답변해 주세요:\n\n${nextQuestion}`;
      
      const payload = chatResponseSchema.parse({
        content,
        verses: [],
        prayer: undefined,
        counselingStep: 'exploration',
        isQuestionPhase: true,
        progress: { current: updatedState.questionCount, total: 5 },
      });
      
      await ChatRecord.create({
        sessionId,
        role: 'assistant',
        content: payload.content,
      });
      
      return NextResponse.json(payload);
    }
    
  } else {
    // 후속 상담
    const relevantVerses = await searchRelevantVerses(message, 3);
    
    const completion = await withCircuitBreaker(() =>
      retryWithBackoff(
        async () => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          try {
            const versesContext = relevantVerses.length > 0
              ? `\n\n관련 성경 구절들:\n${relevantVerses.map((v) => `- ${v.book} ${v.chapter}:${v.verse} - ${v.text}`).join('\n')}`
              : '';

            return await openai.chat.completions.create(
              {
                model,
                temperature: 0.3,
                messages: [
                  {
                    role: 'system',
                    content: `당신은 공감 능력이 뛰어난 기독교 상담 챗봇입니다.

사용자가 이미 상담을 받았고, 추가적인 질문이나 고민을 하고 있습니다.

응답 형식을 반드시 지켜주세요:
1. 먼저 공감과 위로의 말씀을 제공
2. 관련된 성경 구절을 명확하게 언급 (책명, 장, 절 포함)
3. 마지막에 "오늘의 기도" 제안

성경 구절은 한국어 성경 기준으로 정확한 책명을 사용하세요.
기도는 간단하고 실용적으로 제시하세요.${versesContext}`,
                  },
                  { role: 'user', content: message },
                ],
              },
              { signal: controller.signal as any },
            );
          } finally {
            clearTimeout(timeout);
          }
        },
        { retries: 2, baseMs: 700 },
      ),
    );

    const content = completion.choices[0]?.message?.content ?? '';
    const { verses, prayer } = extractVersesAndPrayer(content);

    const combinedVerses = [
      ...relevantVerses.map((v) => ({
        book: v.book,
        chapter: v.chapter.toString(),
        verse: v.verse.toString(),
      })),
      ...verses,
    ];

    const uniqueVerses = combinedVerses.filter(
      (verse, index, self) =>
        index ===
        self.findIndex(
          (v) => v.book === verse.book && v.chapter === verse.chapter && v.verse === verse.verse,
        ),
    );

    const payload = chatResponseSchema.parse({
      content: content || '죄송합니다. 잠시 후 다시 시도해주세요.',
      verses: uniqueVerses,
      prayer,
      counselingStep: 'followup',
      isQuestionPhase: false,
    });

    await ChatRecord.create({
      sessionId,
      role: 'assistant',
      content: payload.content,
      verses: payload.verses,
      prayer: payload.prayer,
    });

    return NextResponse.json(payload);
  }
}

// AI 응답에서 구절과 기도를 추출하는 로직
function extractVersesAndPrayer(text: string) {
  const verses: Array<{ book: string; chapter: string; verse: string }> = [];
  const prayerMatch = text.match(/오늘의 기도[:\s]*([^\n]+)/);
  const prayer = prayerMatch ? prayerMatch[1].trim() : undefined;

  // 성경 구절 패턴 매칭 (예: 마태복음 11장 28절, 요한복음 3:16 등)
  const versePatterns = [
    /([가-힣]+복음|[가-힣]+서|[가-힣]+기)\s*(\d+)장\s*(\d+)절/g,
    /([가-힣]+복음|[가-힣]+서|[가-힣]+기)\s*(\d+):(\d+)/g,
  ];

  versePatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      verses.push({
        book: match[1],
        chapter: match[2],
        verse: match[3],
      });
    }
  });

  return { verses, prayer };
}