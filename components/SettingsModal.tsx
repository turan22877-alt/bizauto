import React, { useState } from 'react';
import { Download, Upload, X, User, Building, Coins, Save } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { UserProfile, Currency, CURRENCY_NAMES } from '../types';

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
  onSaveProfile: (patch: { displayName: string; businessName: string; currency: Currency }) => void;
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
  const [currency, setCurrency] = useState<Currency>(user.currency || 'RUB');
  const [importError, setImportError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setDisplayName(user.displayName);
      setBusinessName(user.businessName || '');
      setCurrency(user.currency || 'RUB');
      setImportError('');
      setSaved(false);
    }
  }, [isOpen, user]);

  const handleExport = () => {
    const data = buildBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selliz-backup-${user.uid.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
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

  const handleSave = () => {
    onSaveProfile({ displayName, businessName, currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки" maxWidth="max-w-3xl">
      <div className="space-y-6">

        {/* Profile Section */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center">
              <User size={20} className="text-orange-600" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">Профиль</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1.5 block">Отображаемое имя</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field"
                placeholder="Ваше имя"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1.5 block">Название бизнеса</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Selliz"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1.5 block">Валюта</label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="input-field pl-10 appearance-none"
                >
                  {(Object.keys(CURRENCY_NAMES) as Currency[]).map((curr) => (
                    <option key={curr} value={curr}>
                      {CURRENCY_NAMES[curr]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={handleSave}
              icon={<Save size={16} />}
            >
              {saved ? 'Сохранено!' : 'Сохранить'}
            </Button>
          </div>
        </div>

        {/* Backup Section */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center">
              <Download size={20} className="text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-800">Резервное копирование</h4>
              <p className="text-xs text-stone-500 mt-0.5">Экспорт и импорт данных вашего аккаунта</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="secondary" className="w-full" icon={<Download size={16} />} onClick={handleExport}>
              Скачать
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              icon={<Upload size={16} />}
              onClick={() => fileRef.current?.click()}
            >
              Импорт
            </Button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
          </div>

          {importError && (
            <p className="mt-3 text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{importError}</p>
          )}
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all text-sm font-semibold"
        >
          <X size={16} /> Закрыть
        </button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
