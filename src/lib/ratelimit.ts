type Key = string;

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per window per key
export const remainingFor = (key: Key): number => {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const bucket = keyToBucket.get(key);
  if (!bucket) return MAX_REQUESTS;
  const count = bucket.timestamps.filter((t) => t > windowStart).length;
  return Math.max(0, MAX_REQUESTS - count);
};

type Bucket = { timestamps: number[] };
const keyToBucket: Map<Key, Bucket> = new Map();

export const allowRequest = (key: Key): boolean => {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const bucket = keyToBucket.get(key) ?? { timestamps: [] };
  // prune old
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);
  if (bucket.timestamps.length >= MAX_REQUESTS) {
    keyToBucket.set(key, bucket);
    return false;
  }
  bucket.timestamps.push(now);
  keyToBucket.set(key, bucket);
  return true;
};


