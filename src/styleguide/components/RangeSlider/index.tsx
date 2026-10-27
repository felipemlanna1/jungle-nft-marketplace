import * as Slider from '@radix-ui/react-slider';
import type { RangeSliderProps } from './shared-types';
import './styles.css';

export function RangeSlider({
  value,
  labels,
  onValueChange,
  min = 0,
  max = 20,
  step = 0.01,
}: RangeSliderProps) {
  return (
    <Slider.Root
      className="range-slider"
      value={[...value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(next) => {
        if (next.length === 2) onValueChange([next[0], next[1]]);
      }}
    >
      <Slider.Track className="range-slider-track">
        <Slider.Range className="range-slider-selection" />
      </Slider.Track>
      <Slider.Thumb className="range-slider-thumb" aria-label={labels[0]} />
      <Slider.Thumb className="range-slider-thumb" aria-label={labels[1]} />
    </Slider.Root>
  );
}
