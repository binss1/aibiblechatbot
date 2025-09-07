import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connection
    await connectToDatabase();

    // Check environment variables
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasMongoURI = !!process.env.MONGODB_URI;

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: 'connected',
        openai: hasOpenAIKey ? 'configured' : 'missing',
        mongodb: hasMongoURI ? 'configured' : 'missing',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        mock: process.env.MOCK_AI_RESPONSES === '1',
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: 'disconnected',
        },
      },
      { status: 500 },
    );
  }
}
