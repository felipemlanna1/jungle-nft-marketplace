export interface SelectOption<Value extends string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<Value extends string> {
  id?: string;
  value: Value;
  options: readonly SelectOption<Value>[];
  onValueChange: (value: Value) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}
