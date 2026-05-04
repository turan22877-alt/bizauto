import React, { useState, useRef, useEffect } from "react";
import { Download, Upload, X, User, Building, Coins, Save, Lock, Eye, EyeOff } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { CURRENCY_NAMES } from "../types";

const SettingsModal = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  onImportBackup,
  buildBackup,
  onChangePassword,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [businessName, setBusinessName] = useState(user.businessName || "");
  const [currency, setCurrency] = useState(user.currency || "RUB");
  const [importError, setImportError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(user.displayName);
      setBusinessName(user.businessName || "");
      setCurrency(user.currency || "RUB");
      setImportError("");
      setSaved(false);
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setPasswordSuccess("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
    }
  }, [isOpen, user]);

  const handleExport = () => {
    const data = buildBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selliz-backup-${user.uid.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = reader.result;
        const j = JSON.parse(raw);
        if (
          j.version !== 1 ||
          !Array.isArray(j.clients) ||
          j.ownerUid !== user.uid
        ) {
          setImportError(
            "Файл не подходит: нужен бэкап этой же учётной записи (version 1).",
          );
          return;
        }
        onImportBackup(j);
        onClose();
      } catch {
        setImportError("Не удалось прочитать JSON.");
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const handleSave = () => {
    onSaveProfile({ displayName, businessName, currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Введите текущий пароль");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Новый пароль должен содержать минимум 8 символов");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("Пароль должен содержать заглавную, строчную букву и цифру");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    setChangingPassword(true);
    const result = await onChangePassword(currentPassword, newPassword);
    setChangingPassword(false);

    if (result.ok) {
      setPasswordSuccess("Пароль успешно изменен");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } else {
      setPasswordError(result.error || "Ошибка при изменении пароля");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Настройки"
      maxWidth="max-w-3xl"
    >
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
              <label className="text-xs font-semibold text-stone-500 mb-1.5 block">
                Отображаемое имя
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field"
                placeholder="Ваше имя"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1.5 block">
                Название бизнеса
              </label>
              <div className="relative">
                <Building
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  size={16}
                />
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Selliz"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1.5 block">
                Валюта
              </label>
              <div className="relative">
                <Coins
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  size={16}
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field pl-10 appearance-none"
                >
                  {Object.keys(CURRENCY_NAMES).map((curr) => (
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
              {saved ? "Сохранено!" : "Сохранить"}
            </Button>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center">
              <Lock size={20} className="text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-800">Безопасность</h4>
              <p className="text-xs text-stone-500 mt-0.5">Изменение пароля</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1.5 block">
                Текущий пароль
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Введите текущий пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1.5 block">
                Новый пароль
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Минимум 8 символов, заглавная, строчная, цифра"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1.5 block">
                Подтвердите новый пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Повторите новый пароль"
              />
            </div>

            {passwordError && (
              <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                {passwordSuccess}
              </p>
            )}

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handlePasswordChange}
              loading={changingPassword}
            >
              Изменить пароль
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
              <h4 className="text-sm font-bold text-stone-800">
                Резервное копирование
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Экспорт и импорт данных вашего аккаунта
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              icon={<Download size={16} />}
              onClick={handleExport}
            >
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
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {importError && (
            <p className="mt-3 text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              {importError}
            </p>
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
