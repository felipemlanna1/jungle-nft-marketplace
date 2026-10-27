const SCALE = 10n ** 18n;
/** ETH transport uses canonical decimal strings. Never route financial arithmetic through Number. */
export function toWei(value: string): bigint {
  if (!/^(0|[1-9]\d*)(\.\d{1,18})?$/.test(value)) throw new Error('Invalid ETH amount');
  const [whole, decimal = ''] = value.split('.');
  return BigInt(whole) * SCALE + BigInt(decimal.padEnd(18, '0'));
}
export function fromWei(value: bigint): string {
  if (value < 0n) throw new Error('Negative amount');
  const whole = value / SCALE;
  const fraction = (value % SCALE).toString().padStart(18, '0').replace(/0+$/, '');
  return `${whole}${fraction ? `.${fraction}` : ''}`;
}
export function sumEth(values: string[]): string {
  return fromWei(values.reduce((sum, value) => sum + toWei(value), 0n));
}
export function multiplyEth(value: string, quantity: number): string {
  if (!Number.isSafeInteger(quantity) || quantity < 0) throw new Error('Invalid quantity');
  return fromWei(toWei(value) * BigInt(quantity));
}
