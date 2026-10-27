import { Eye } from 'lucide-react';
import { Input } from '../../../../styleguide';
import type { PasswordFieldProps } from '../../shared-types';
import { usePasswordField } from './usePasswordField';
export function PasswordField({
  label,
  hideLabel = false,
  id: providedId,
  ...props
}: PasswordFieldProps) {
  const { id, visible, toggle } = usePasswordField(providedId);
  return (
    <div className="field password-field">
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : undefined}>
        {label}
      </label>
      <span className="password-input-wrap">
        <Input {...props} id={id} type={visible ? 'text' : 'password'} />
        <button
          className="password-toggle"
          type="button"
          onClick={toggle}
          aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? (
            <Eye size={17} aria-hidden="true" />
          ) : (
            <img src="/figma/login/imgHide.svg" alt="" />
          )}
        </button>
      </span>
    </div>
  );
}
