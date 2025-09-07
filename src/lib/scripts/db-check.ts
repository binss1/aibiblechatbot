/* eslint-disable no-console */
import { config } from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from '../mongodb';
import { Session } from '../models/session';

async function main(): Promise<void> {
  // Load env from .env.local if present, fallback to .env
  config({ path: '.env.local' });
  await connectToDatabase();
  const id = `test-${Date.now()}`;
  await Session.create({ sessionId: id });
  const found = await Session.findOne({ sessionId: id });
  console.log('db ok:', Boolean(found));
  await disconnectFromDatabase();
}

main().catch((err) => {
  console.error('db-check failed:', err);
  process.exit(1);
});
