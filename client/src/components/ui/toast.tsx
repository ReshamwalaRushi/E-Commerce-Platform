import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast = ({ message, type = 'info', onClose }: ToastProps) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm',
        type === 'success' && 'bg-green-600',
        type === 'error' && 'bg-red-600',
        type === 'info' && 'bg-blue-600'
      )}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ToastContext = React.createContext<ToastContextValue>({ showToast: () => {} });

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = React.useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => React.useContext(ToastContext);
