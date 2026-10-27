import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { SelectProps } from './shared-types';
import './styles.css';

export function Select<Value extends string>({
  id,
  value,
  options,
  onValueChange,
  disabled,
  className = '',
  placeholder,
  ...accessibleName
}: SelectProps<Value>) {
  return (
    <RadixSelect.Root
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        const option = options.find((item) => item.value === next);
        if (option && !option.disabled) onValueChange(option.value);
      }}
    >
      <RadixSelect.Trigger id={id} className={`select-trigger ${className}`} {...accessibleName}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon asChild>
          <ChevronDown size={14} aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="select-content"
          position="popper"
          sideOffset={6}
          collisionPadding={12}
        >
          <RadixSelect.ScrollUpButton className="select-scroll-button">
            <ChevronUp size={14} aria-hidden="true" />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="select-viewport">
            {options.map((option) => (
              <RadixSelect.Item
                className="select-item"
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="select-item-indicator">
                  <Check size={15} aria-hidden="true" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="select-scroll-button">
            <ChevronDown size={14} aria-hidden="true" />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
