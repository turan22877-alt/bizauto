import { useState, useCallback } from 'react';
import { ToastType } from '../components/ui/Toast';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message) => showToast(message, 'error'), [showToast]);
  const info = useCallback((message) => showToast(message, 'info'), [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info
  };
}