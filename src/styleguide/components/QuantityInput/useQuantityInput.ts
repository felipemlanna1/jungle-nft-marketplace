import type { ChangeEvent } from 'react';
import type { QuantityInputProps } from './shared-types';

export function useQuantityInput({
  value,
  min = 1,
  max,
  disabled,
  onValueChange,
}: QuantityInputProps) {
  const changeValue = (next: number) => {
    if (!disabled && Number.isInteger(next) && next >= min && next <= max) onValueChange(next);
  };
  return {
    decreaseDisabled: Boolean(disabled || max < min || value <= min),
    increaseDisabled: Boolean(disabled || value >= max),
    decrease: () => changeValue(Math.min(value - 1, max)),
    increase: () => changeValue(value + 1),
    change: (event: ChangeEvent<HTMLInputElement>) => changeValue(Number(event.target.value)),
  };
}
