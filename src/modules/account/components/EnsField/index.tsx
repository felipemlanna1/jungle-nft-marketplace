import { Input } from '../../../../styleguide';
import type { EnsFieldProps } from '../../shared-types';
export function EnsField({ value, onChange, id = 'ens-name' }: EnsFieldProps) {
  return (
    <label className="field" htmlFor={id}>
      Nome ENS
      <span className="ens-input">
        <span className="ens-domain">
          .eth
          <img src="/figma/profile/imgArrowDown.svg" alt="" />
        </span>
        <Input
          id={id}
          aria-label="Nome ENS"
          value={value.endsWith('.eth') ? value.slice(0, -4) : value}
          onChange={(event) =>
            onChange(event.target.value ? `${event.target.value.replace(/\.eth$/i, '')}.eth` : '')
          }
          maxLength={253}
          autoCapitalize="none"
          spellCheck={false}
        />
      </span>
    </label>
  );
}
