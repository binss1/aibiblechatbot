import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { retryWithBackoff, withCircuitBreaker } from '@/lib/retry';
import { chatRequestSchema, chatResponseSchema } from '@/features/chat/constants/schema';
import { allowRequest, remainingFor } from '@/lib/ratelimit';
import { connectToDatabase } from '@/lib/mongodb';
import { Session } from '@/lib/models/session';
import { ChatRecord } from '@/lib/models/chat-record';
import { searchRelevantVerses } from '@/lib/services/bible-embedding';

export const runtime = 'nodejs';

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

  // 관련 성경 구절 검색
  const relevantVerses = await searchRelevantVerses(message, 3);

  // Allow switching models via env; default keeps cost low
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Optional mock mode for development without external calls
  if (process.env.MOCK_AI_RESPONSES === '1') {
    const mockVerses =
      relevantVerses.length > 0
        ? relevantVerses.map((v) => ({
            book: v.book,
            chapter: v.chapter.toString(),
            verse: v.verse.toString(),
          }))
        : [{ book: '마태복음', chapter: '11', verse: '28' }];

    const mock = {
      content:
        '주님의 평안이 함께하길 기도합니다. 아래 구절을 묵상해 보세요.\n\n마태복음 11장 28절에서 예수님께서 말씀하셨습니다: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라"',
      verses: mockVerses,
      prayer:
        '주님, 무거운 마음을 주님께 맡기며 참 평안을 누리게 하소서. 오늘 하루 주님의 은혜로 힘을 얻어 살게 하소서.',
      mocked: true,
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

  const openai = new OpenAI({ apiKey });
  try {
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
    const extractVersesAndPrayer = (text: string) => {
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
    };

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
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
    return NextResponse.json({ message: `OpenAI error: ${message}` }, { status: 502 });
  }
}
