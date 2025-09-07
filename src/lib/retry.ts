export type AsyncFn<T> = () => Promise<T>;

export async function retryWithBackoff<T>(
  fn: AsyncFn<T>,
  opts?: { retries?: number; baseMs?: number },
): Promise<T> {
  const retries = opts?.retries ?? 2;
  const baseMs = opts?.baseMs ?? 500;
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i === retries) break;
      const delay = baseMs * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

let open = true;
let nextTryAt = 0;
export async function withCircuitBreaker<T>(fn: AsyncFn<T>, openMs = 15000): Promise<T> {
  const now = Date.now();
  if (!open && now < nextTryAt) {
    throw new Error('circuit_open');
  }
  try {
    const res = await fn();
    open = true;
    return res;
  } catch (e) {
    open = false;
    nextTryAt = Date.now() + openMs;
    throw e;
  }
}
