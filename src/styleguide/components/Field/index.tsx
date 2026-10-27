import type { ReactNode } from 'react';
export const Field = ({
  label,
  error,
  id,
  children,
  hint,
}: {
  label: string;
  error?: string;
  id: string;
  children: ReactNode;
  hint?: string;
}) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    {children}
    {hint && (
      <p className="field-hint" id={`${id}-hint`}>
        {hint}
      </p>
    )}
    {error && (
      <p className="field-error" role="alert" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);
