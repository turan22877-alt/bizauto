import React, { useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { UserProfile } from '../types';

export type BackupPayload = {
  version: 1;
  exportedAt: string;
  ownerUid: string;
  clients: unknown[];
  staff: unknown[];
  appointments: unknown[];
  inventory: unknown[];
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (patch: { displayName: string; businessName: string }) => void;
  onImportBackup: (payload: BackupPayload) => void;
  buildBackup: () => BackupPayload;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  onImportBackup,
  buildBackup,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [businessName, setBusinessName] = useState(user.businessName || '');
  const [importError, setImportError] = useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setDisplayName(user.displayName);
      setBusinessName(user.businessName || '');
      setImportError('');
    }
  }, [isOpen, user]);

  const handleExport = () => {
    const data = buildBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bizauto-backup-${user.uid.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = reader.result as string;
        const j = JSON.parse(raw) as BackupPayload;
        if (j.version !== 1 || !Array.isArray(j.clients) || j.ownerUid !== user.uid) {
          setImportError('Файл не подходит: нужен бэкап этой же учётной записи (version 1).');
          return;
        }
        onImportBackup(j);
        onClose();
      } catch {
        setImportError('Не удалось прочитать JSON.');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки и данные" maxWidth="max-w-lg">
      <div className="space-y-8">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Профиль</h4>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Отображаемое имя</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Название бизнеса</label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="input-field"
              placeholder="Как в шапке и сайдбаре"
            />
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={() => onSaveProfile({ displayName, businessName })}
          >
            Сохранить профиль
          </Button>
        </div>

        <div className="border-t border-slate-200 pt-8 space-y-4">
          <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Резервное копирование</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Экспорт и импорт затрагивают только данные текущего аккаунта (клиенты, команда, журнал, склад).
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" variant="secondary" className="flex-1" icon={<Download size={18} />} onClick={handleExport}>
              Скачать JSON
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              icon={<Upload size={18} />}
              onClick={() => fileRef.current?.click()}
            >
              Восстановить из файла
            </Button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
          </div>
          {importError && <p className="text-sm text-rose-400">{importError}</p>}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3 text-slate-600 hover:text-green-700 text-xs font-bold uppercase tracking-widest"
        >
          <X size={16} /> Закрыть
        </button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
