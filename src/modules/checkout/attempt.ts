import type { OrderInput } from '../../contracts';
import { purchaseAttemptSchema } from '../../domain/schemas';
export interface PurchaseAttempt {
  userId: string;
  input: OrderInput;
  orderId?: string;
}
const keyFor = (id: string) => `kurio:purchase-attempt:${id}`;
export function readAttempt(userId: string): PurchaseAttempt | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(keyFor(userId)) ?? 'null');
    const result = purchaseAttemptSchema.safeParse(value);
    return result.success && result.data.userId === userId ? result.data : null;
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
    // A confirmed order remains recoverable from its URL if storage cleanup is blocked.
  }
}

export function clearAttemptForOrder(userId: string, orderId: string) {
  if (readAttempt(userId)?.orderId === orderId) clearAttempt(userId);
}
