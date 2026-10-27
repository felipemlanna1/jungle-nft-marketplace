export type RangeValue = readonly [number, number];

export interface RangeSliderProps {
  value: RangeValue;
  labels: readonly [string, string];
  onValueChange: (value: RangeValue) => void;
  min?: number;
  max?: number;
  step?: number;
}
