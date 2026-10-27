import { useEffect, useState } from 'react';
export const useLiveNotice = () => {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (typeof detail === 'string') setMessage(detail);
    };
    window.addEventListener('marketplace:notice', handleUpdate);
    return () => window.removeEventListener('marketplace:notice', handleUpdate);
  }, []);
  return { message, clearMessage: () => setMessage('') };
};
