import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info'
};

const Toast = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-orange-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />
  };

  const bgColors = {
    success: 'bg-orange-50 border-orange-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div
      className={`
        fixed top-4 right-4 left-4 sm:left-auto z-50 max-w-md sm:max-w-md mx-auto sm:mx-0
        ${isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-full'}
        transition-all duration-300
      `}
    >
      <div className={`${bgColors[type]} border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        {icons[type]}
        <p className="flex-1 text-sm font-medium text-stone-900">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-stone-400 hover:text-stone-600 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;