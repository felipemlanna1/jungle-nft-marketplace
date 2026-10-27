export interface QuantityInputProps {
  value: number;
  min?: number;
  max: number;
  label: string;
  disabled?: boolean;
  onValueChange: (value: number) => void;
}
