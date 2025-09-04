import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ChatRecord } from '@/lib/models/chat-record';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId') || '';
  const cursor = searchParams.get('cursor'); // ISO string of createdAt
  const limitParam = Number(searchParams.get('limit') || '20');
  const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100 ? limitParam : 20;
  const q = searchParams.get('q')?.trim();
  const from = searchParams.get('from'); // ISO date
  const to = searchParams.get('to');     // ISO date
  if (!sessionId) {
    return NextResponse.json({ message: 'sessionId is required' }, { status: 400 });
  }

  await connectToDatabase();
  const query: Record<string, unknown> = { sessionId };
  if (cursor) {
    query.createdAt = { ...(query.createdAt as any), $gt: new Date(cursor) };
  }
  if (from) {
    query.createdAt = { ...(query.createdAt as any), $gte: new Date(from) };
  }
  if (to) {
    query.createdAt = { ...(query.createdAt as any), $lte: new Date(to) };
  }
  if (q) {
    query.content = { $regex: q, $options: 'i' };
  }

  const records = await ChatRecord.find(query)
    .sort({ createdAt: 1 })
    .limit(limit + 1)
    .select({ _id: 0, role: 1, content: 1, verses: 1, prayer: 1, createdAt: 1 })
    .lean();

  const hasMore = records.length > limit;
  const items = hasMore ? records.slice(0, limit) : records;
  const nextCursor = hasMore ? items[items.length - 1]?.createdAt : undefined;
  return NextResponse.json({ items, nextCursor });
}


