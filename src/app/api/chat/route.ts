import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { chatRequestSchema } from '@/features/chat/constants/schema';
import { allowRequest } from '@/lib/ratelimit';
import { connectToDatabase } from '@/lib/mongodb';
import { Session } from '@/lib/models/session';
import { ChatRecord } from '@/lib/models/chat-record';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  if (!allowRequest(`chat:${ip}`)) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request', issues: parsed.error.issues }, { status: 400 });
  }
  const { sessionId, message, locale, userAgent } = parsed.data;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: 'Server misconfigured: OPENAI_API_KEY missing' }, { status: 500 });
  }

  await connectToDatabase();
  await Session.updateOne(
    { sessionId },
    { $setOnInsert: { sessionId }, $set: { locale, userAgent } },
    { upsert: true },
  );

  await ChatRecord.create({ sessionId, role: 'user', content: message });

  const openai = new OpenAI({ apiKey });
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            '당신은 공감 능력이 뛰어난 기독교 상담 챗봇입니다. 성경 구절을 근거로 조언하고, 비판 대신 위로와 실제적 지침을 제공합니다.',
        },
        { role: 'user', content: message },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? '죄송합니다. 잠시 후 다시 시도해주세요.';
    await ChatRecord.create({ sessionId, role: 'assistant', content });
    return NextResponse.json({ content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ message: `OpenAI error: ${message}` }, { status: 502 });
  }
}


