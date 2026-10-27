import { Minus, Plus } from 'lucide-react';
import type { QuantityInputProps } from './shared-types';
import { useQuantityInput } from './useQuantityInput';

export function QuantityInput(props: QuantityInputProps) {
  const { decreaseDisabled, increaseDisabled, decrease, increase, change } =
    useQuantityInput(props);
  return (
    <div className="quantity-control">
      <button
        type="button"
        aria-label={`Diminuir ${props.label}`}
        onClick={decrease}
        disabled={decreaseDisabled}
      >
        <Minus size={13} aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={props.label}
        min={props.min ?? 1}
        max={props.max}
        value={props.value}
        onChange={change}
        disabled={props.disabled}
      />
      <button
        type="button"
        aria-label={`Aumentar ${props.label}`}
        onClick={increase}
        disabled={increaseDisabled}
      >
        <Plus size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
