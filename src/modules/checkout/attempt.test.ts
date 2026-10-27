// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { readAttempt, saveAttempt, clearAttemptForOrder, type PurchaseAttempt } from './attempt';

const attempt: PurchaseAttempt = {
  userId: 'collector-1',
  input: {
    quoteFingerprint: 'quote-fingerprint',
    idempotencyKey: 'attempt-1',
    walletId: 'wallet-1',
    network: 'Ethereum',
    collectorName: 'Alex Collector',
    collectorEmail: 'collector@example.test',
  },
};
beforeEach(() => localStorage.clear());
describe('persisted purchase attempt validation', () => {
  it('restores a complete legacy attempt without optional metadata', () => {
    expect(saveAttempt(attempt)).toBe(true);
    expect(readAttempt(attempt.userId)).toEqual(attempt);
    expect(readAttempt('collector-2')).toBeNull();
  });
  it.each([
    { ...attempt, input: { idempotencyKey: 'attempt-1', quoteFingerprint: 'quote-fingerprint' } },
    { ...attempt, input: { ...attempt.input, network: 'Unsupported' } },
    { ...attempt, input: { ...attempt.input, collectorEmail: 'invalid' } },
    { ...attempt, orderId: { id: 'order-1' } },
  ])('discards a malformed stored payload before recovery', (payload) => {
    localStorage.setItem('kurio:purchase-attempt:collector-1', JSON.stringify(payload));
    expect(readAttempt(attempt.userId)).toBeNull();
  });
  it('discards truncated JSON without interrupting checkout', () => {
    localStorage.setItem('kurio:purchase-attempt:collector-1', '{');
    expect(readAttempt(attempt.userId)).toBeNull();
  });
});

describe('purchase attempt completion ownership', () => {
  it('preserves another purchase when an older receipt is opened', () => {
    saveAttempt({ ...attempt, orderId: 'order-current' });
    clearAttemptForOrder(attempt.userId, 'order-older');
    expect(readAttempt(attempt.userId)?.orderId).toBe('order-current');
  });
  it('preserves an uncertain attempt until its order identity is recovered', () => {
    saveAttempt(attempt);
    clearAttemptForOrder(attempt.userId, 'order-confirmed');
    expect(readAttempt(attempt.userId)).toEqual(attempt);
  });
  it('removes only the completed matching attempt', () => {
    saveAttempt({ ...attempt, orderId: 'order-current' });
    clearAttemptForOrder(attempt.userId, 'order-current');
    expect(readAttempt(attempt.userId)).toBeNull();
  });
});
