import type { RangeValue } from '../../../../styleguide/components/RangeSlider/shared-types';

function project(value: string, fallback: number) {
  const number = Number(value.trim().replace(',', '.'));
  return value.trim() && Number.isFinite(number) ? Math.min(20, Math.max(0, number)) : fallback;
}

export function usePriceRange(
  minimum: string,
  maximum: string,
  onMinimum: (value: string) => void,
  onMaximum: (value: string) => void,
) {
  const projected = [project(minimum, 0), project(maximum, 20)] as const;
  const ordered = projected[0] <= projected[1];
  const value: RangeValue = ordered ? projected : [projected[1], projected[0]];
  const text = ordered ? [minimum, maximum] : [maximum, minimum];
  function change(next: RangeValue) {
    // Slider geometry is approximate; preserve exact ETH text for untouched boundaries.
    const exact = next.map((number, index) => {
      if (number === value[index]) return text[index];
      const previous = value.indexOf(number);
      return previous >= 0 ? text[previous] : String(number);
    });
    if (exact[0] !== minimum) onMinimum(exact[0]);
    if (exact[1] !== maximum) onMaximum(exact[1]);
  }
  return { value, change };
}
