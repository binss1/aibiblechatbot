import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ ok: true, model: process.env.OPENAI_MODEL || null, mock: process.env.MOCK_AI_RESPONSES === '1' });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}


