import type { OrderInput } from '../../contracts';
export interface PurchaseAttempt {
  userId: string;
  input: OrderInput;
  orderId?: string;
}
const keyFor = (id: string) => `kurio:purchase-attempt:${id}`;
export function readAttempt(userId: string): PurchaseAttempt | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(keyFor(userId)) ?? 'null');
    if (!value || typeof value !== 'object') return null;
    const row = value as Partial<PurchaseAttempt>;
    return row.userId === userId &&
      typeof row.input?.idempotencyKey === 'string' &&
      typeof row.input.quoteFingerprint === 'string'
      ? (row as PurchaseAttempt)
      : null;
  } catch {
    return null;
  }
}
export function saveAttempt(attempt: PurchaseAttempt) {
  try {
    localStorage.setItem(keyFor(attempt.userId), JSON.stringify(attempt));
    return true;
  } catch {
    return false;
  }
}
export function clearAttempt(userId: string) {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {
    /* no persistence available */
  }
}
