import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { retryWithBackoff, withCircuitBreaker } from '@/lib/retry';
import { chatRequestSchema, chatResponseSchema, CounselingStep } from '@/features/chat/constants/schema';
import { allowRequest, remainingFor } from '@/lib/ratelimit';
import { connectToDatabase } from '@/lib/mongodb';
import { Session } from '@/lib/models/session';
import { ChatRecord } from '@/lib/models/chat-record';
import { searchRelevantVerses } from '@/lib/services/bible-embedding';
import { CounselingSessionService } from '@/lib/services/counseling-session';

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

  // 간단한 다단계 상담 시스템 구현
  const openai = new OpenAI({ apiKey });
  
  // 세션별 상담 상태를 간단하게 관리 (실제로는 Redis나 DB 사용 권장)
  const counselingState = await getCounselingState(sessionId);
  console.log('Current counseling state:', counselingState);

  // Allow switching models via env; default keeps cost low
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Optional mock mode for development without external calls
  if (process.env.MOCK_AI_RESPONSES === '1') {
    return await handleMockResponse(sessionId, counselingState, message);
  }

  const openai = new OpenAI({ apiKey });
  
  try {
    // 상담 단계에 따른 처리
    if (counselingState.step === 'initial') {
      return await handleInitialStep(openai, model, sessionId, message, counselingState);
    } else if (counselingState.step === 'exploration') {
      return await handleExplorationStep(openai, model, sessionId, message, counselingState);
    } else if (counselingState.step === 'analysis') {
      return await handleAnalysisStep(openai, model, sessionId, message, counselingState);
    } else {
      return await handleFollowupStep(openai, model, sessionId, message, counselingState);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Chat API Error:', errorMessage);
    
    // Fallback to mock if allowed
    if (process.env.MOCK_AI_RESPONSES === '1') {
      const mock = {
        content: '현재 모델 연결이 원활하지 않습니다. 임시 응답을 제공합니다.',
        verses: [],
        prayer: undefined,
        mocked: true,
      };
      await ChatRecord.create({ sessionId, role: 'assistant', content: mock.content });
      return NextResponse.json(mock, { status: 200 });
    }
    return NextResponse.json({ message: `OpenAI error: ${errorMessage}` }, { status: 502 });
  }
}

// 초기 단계: 고민 접수 및 탐색 질문 생성
async function handleInitialStep(
  openai: OpenAI,
  model: string,
  sessionId: string,
  message: string,
  counselingState: any
) {
  // 초기 고민 저장
  const updatedState = await updateCounselingState(sessionId, {
    step: 'exploration',
    initialConcern: message,
    questionCount: 0,
    answers: []
  });

  const completion = await withCircuitBreaker(() =>
    retryWithBackoff(
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          return await openai.chat.completions.create(
            {
              model,
              temperature: 0.3,
              messages: [
                            {
                              role: 'system',
                              content: `당신은 공감 능력이 뛰어난 기독교 상담 챗봇입니다.

사용자가 고민을 털어놓았습니다. 이제 더 자세한 상담을 위해 4-5개의 구체적인 질문을 생성해야 합니다.

질문 생성 규칙:
1. 사용자의 고민을 더 깊이 이해할 수 있는 질문들
2. 감정, 상황, 관계, 신앙적 측면을 포함
3. 각 질문은 간단하고 명확하게
4. 공감적이고 따뜻한 톤으로
5. 질문만 생성하고 답변은 하지 마세요

응답 형식:
"고민을 나눠주셔서 감사합니다. 더 나은 도움을 드리기 위해 몇 가지 질문을 드릴게요:

1. 이 상황이 언제부터 시작되었나요?
2. 가장 힘든 부분은 무엇인가요?
3. 주변 사람들의 반응은 어떤가요?
4. 신앙적으로 어떤 도전을 느끼시나요?
5. 어떤 변화를 원하시나요?

편하게 답변해 주세요."`,
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
  
  // 질문들을 추출하여 저장
  const questions = extractQuestions(content);
  console.log('Extracted questions:', questions);
  if (questions.length > 0) {
    await updateCounselingState(sessionId, {
      questions: questions,
      totalQuestions: questions.length
    });
  }

  const payload = chatResponseSchema.parse({
    content: content || '죄송합니다. 잠시 후 다시 시도해주세요.',
    verses: [],
    prayer: undefined,
    counselingStep: 'exploration',
    isQuestionPhase: true,
    progress: { current: 0, total: questions.length },
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

// 탐색 단계: 질문에 대한 답변 수집
async function handleExplorationStep(
  openai: OpenAI,
  model: string,
  sessionId: string,
  message: string,
  counselingState: any
) {
  // 답변 저장
  const updatedState = await updateCounselingState(sessionId, {
    answers: [...counselingState.answers, message],
    questionCount: counselingState.questionCount + 1
  });

  // 모든 질문에 답변했는지 확인 (4-5개 질문)
  if (updatedState.questionCount >= 4) {
    // 모든 답변이 완료되었으므로 종합 분석 단계로
    await updateCounselingState(sessionId, { step: 'analysis' });
    return await handleAnalysisStep(openai, model, sessionId, message, updatedState);
  }

  // 다음 질문 제시
  const nextQuestionIndex = updatedState.questionCount;
  const questions = updatedState.questions || [];
  const nextQuestion = questions[nextQuestionIndex] || "이 상황에서 가장 중요한 것은 무엇이라고 생각하시나요?";

  const payload = chatResponseSchema.parse({
    content: `감사합니다. 다음 질문에 답변해 주세요:\n\n${nextQuestion}`,
    verses: [],
    prayer: undefined,
    counselingStep: 'exploration',
    isQuestionPhase: true,
    progress: { current: nextQuestionIndex, total: questions.length || 5 },
  });

  await ChatRecord.create({
    sessionId,
    role: 'assistant',
    content: payload.content,
  });

  return NextResponse.json(payload);
}

// 분석 단계: 종합적인 상담 답변 제공
async function handleAnalysisStep(
  openai: OpenAI,
  model: string,
  sessionId: string,
  message: string,
  counselingState: any
) {
  // 관련 성경 구절 검색
  const allContent = [
    counselingState.initialConcern,
    ...counselingState.answers
  ].join(' ');
  const relevantVerses = await searchRelevantVerses(allContent, 5);

  const completion = await withCircuitBreaker(() =>
    retryWithBackoff(
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          // 관련 성경 구절을 시스템 프롬프트에 포함
          const versesContext =
            relevantVerses.length > 0
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
                              content: `초기 고민: ${counselingState.initialConcern}\n\n상세 답변들:\n${counselingState.answers.map((answer: string, index: number) => `${index + 1}. ${answer}`).join('\n')}`,
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

  // AI 응답에서 구절과 기도를 추출하는 로직
  const { verses, prayer } = extractVersesAndPrayer(content);

  // 검색된 관련 구절과 추출된 구절을 결합
  const combinedVerses = [
    ...relevantVerses.map((v) => ({
      book: v.book,
      chapter: v.chapter.toString(),
      verse: v.verse.toString(),
    })),
    ...verses,
  ];

  // 중복 제거
  const uniqueVerses = combinedVerses.filter(
    (verse, index, self) =>
      index ===
      self.findIndex(
        (v) => v.book === verse.book && v.chapter === verse.chapter && v.verse === verse.verse,
      ),
  );

  // 상담 완료 처리
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
}

// 후속 상담 단계
async function handleFollowupStep(
  openai: OpenAI,
  model: string,
  sessionId: string,
  message: string,
  counselingState: any
) {
  // 관련 성경 구절 검색
  const relevantVerses = await searchRelevantVerses(message, 3);

  const completion = await withCircuitBreaker(() =>
    retryWithBackoff(
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          // 관련 성경 구절을 시스템 프롬프트에 포함
          const versesContext =
            relevantVerses.length > 0
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

  // AI 응답에서 구절과 기도를 추출하는 로직
  const { verses, prayer } = extractVersesAndPrayer(content);

  // 검색된 관련 구절과 추출된 구절을 결합
  const combinedVerses = [
    ...relevantVerses.map((v) => ({
      book: v.book,
      chapter: v.chapter.toString(),
      verse: v.verse.toString(),
    })),
    ...verses,
  ];

  // 중복 제거
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

// 질문 추출 함수
function extractQuestions(text: string): string[] {
  const questions: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // 더 유연한 질문 패턴 매칭
    if (trimmed.match(/^\d+\.\s*.*\?/) || trimmed.match(/^\d+\.\s*.*나요/) || trimmed.match(/^\d+\.\s*.*까요/)) {
      const question = trimmed.replace(/^\d+\.\s*/, '').trim();
      if (question.length > 0) {
        questions.push(question);
      }
    }
  }

  // 질문이 추출되지 않으면 기본 질문들 사용
  if (questions.length === 0) {
    return [
      "이 상황이 언제부터 시작되었나요?",
      "가장 힘든 부분은 무엇인가요?",
      "주변 사람들의 반응은 어떤가요?",
      "신앙적으로 어떤 도전을 느끼시나요?",
      "어떤 변화를 원하시나요?"
    ];
  }

  return questions;
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

// Mock 응답 처리
async function handleMockResponse(sessionId: string, counselingState: any, message: string) {
  const mockVerses = [{ book: '마태복음', chapter: '11', verse: '28' }];

  let mockContent = '';
  let mockStep: CounselingStep = 'initial';
  let isQuestionPhase = false;
  let progress = undefined;

  switch (counselingState.step) {
    case 'initial':
      mockContent = '고민을 나눠주셔서 감사합니다. 더 나은 도움을 드리기 위해 몇 가지 질문을 드릴게요:\n\n1. 이 상황이 언제부터 시작되었나요?\n2. 가장 힘든 부분은 무엇인가요?\n3. 주변 사람들의 반응은 어떤가요?\n4. 신앙적으로 어떤 도전을 느끼시나요?\n5. 어떤 변화를 원하시나요?';
      mockStep = 'exploration';
      isQuestionPhase = true;
      progress = { current: 0, total: 5 };
      break;
    case 'exploration':
      mockContent = '감사합니다. 다음 질문에 답변해 주세요:\n\n이 상황에서 가장 중요한 것은 무엇이라고 생각하시나요?';
      mockStep = 'exploration';
      isQuestionPhase = true;
      progress = { current: 1, total: 5 };
      break;
    case 'analysis':
      mockContent = '주님의 평안이 함께하길 기도합니다. 아래 구절을 묵상해 보세요.\n\n마태복음 11장 28절에서 예수님께서 말씀하셨습니다: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라"';
      mockStep = 'followup';
      isQuestionPhase = false;
      break;
    default:
      mockContent = '주님의 평안이 함께하길 기도합니다. 아래 구절을 묵상해 보세요.\n\n마태복음 11장 28절에서 예수님께서 말씀하셨습니다: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라"';
      mockStep = 'followup';
      isQuestionPhase = false;
  }

  const mock = {
    content: mockContent,
    verses: mockVerses,
    prayer: '주님, 무거운 마음을 주님께 맡기며 참 평안을 누리게 하소서. 오늘 하루 주님의 은혜로 힘을 얻어 살게 하소서.',
    mocked: true,
    counselingStep: mockStep,
    isQuestionPhase,
    progress,
  } as const;

  await ChatRecord.create({
    sessionId,
    role: 'assistant',
    content: mock.content,
    verses: mock.verses,
    prayer: mock.prayer,
  });

  return NextResponse.json(mock);
}

// 폴백 응답 처리 (상담 세션 서비스 오류 시)
async function handleFallbackResponse(
  openai: OpenAI,
  model: string,
  sessionId: string,
  message: string
) {
  // 관련 성경 구절 검색
  const relevantVerses = await searchRelevantVerses(message, 3);

  const completion = await withCircuitBreaker(() =>
    retryWithBackoff(
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          // 관련 성경 구절을 시스템 프롬프트에 포함
          const versesContext =
            relevantVerses.length > 0
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

  // AI 응답에서 구절과 기도를 추출하는 로직
  const { verses, prayer } = extractVersesAndPrayer(content);

  // 검색된 관련 구절과 추출된 구절을 결합
  const combinedVerses = [
    ...relevantVerses.map((v) => ({
      book: v.book,
      chapter: v.chapter.toString(),
      verse: v.verse.toString(),
    })),
    ...verses,
  ];

  // 중복 제거
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
