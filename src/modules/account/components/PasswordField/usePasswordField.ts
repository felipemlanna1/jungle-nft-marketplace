import { useId, useState } from 'react';
export function usePasswordField(providedId?: string) {
  const generatedId = useId();
  const [visible, setVisible] = useState(false);
  return { id: providedId ?? generatedId, visible, toggle: () => setVisible((value) => !value) };
}
