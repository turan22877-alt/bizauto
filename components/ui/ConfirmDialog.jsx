import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-lg">
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
          <AlertCircle className={type === 'danger' ? 'text-rose-500' : 'text-amber-500'} size={24} />
          <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all text-xs uppercase tracking-widest"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-4 font-bold rounded-2xl transition-all text-xs uppercase tracking-widest shadow-xl ${
              type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;