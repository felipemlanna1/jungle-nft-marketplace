import { describe, expect, it } from 'vitest';
import { fromWei, multiplyEth, sumEth, toWei } from './money';
describe('exact ETH arithmetic', () => {
  it('never introduces floating point rounding', () => expect(sumEth(['0.1', '0.2'])).toBe('0.3'));
  it('round trips all 18 decimal places', () =>
    expect(fromWei(toWei('1.000000000000000001'))).toBe('1.000000000000000001'));
  it('multiplies quantities without precision loss', () =>
    expect(multiplyEth('0.123456789012345678', 3)).toBe('0.370370367037037034'));
  it.each(['-1', 'NaN', '1e18', '0.0000000000000000001', '01', ''])(
    'rejects invalid amount %s',
    (value) => expect(() => toWei(value)).toThrow(),
  );
  it('rejects fractional quantities', () => expect(() => multiplyEth('1', 1.5)).toThrow());
});
