import { X } from 'lucide-react';
import { useLiveNotice } from './useLiveNotice';
export const LiveNotice = () => {
  const { message, clearMessage } = useLiveNotice();
  return (
    <div className="live-notice" role="status" aria-live="polite" aria-atomic="true">
      {message && (
        <>
          <span>{message}</span>
          <button aria-label="Fechar aviso" onClick={clearMessage}>
            <X size={16} />
          </button>
        </>
      )}
    </div>
  );
};
