import React, { useState } from 'react';
import { LogIn, UserPlus, Building2, Mail, Lock, User } from 'lucide-react';
import Button from './ui/Button';
import { loginUser, registerUser } from '../utils/auth';
import { UserProfile } from '../types';
import AuthScene3D from './three/AuthScene3D';

type Mode = 'login' | 'register';

interface AuthScreenProps {
  onAuthed: (profile: UserProfile, opts?: { isNew?: boolean }) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthed }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        const r = await registerUser(email, password, displayName, businessName);
        if (r.ok === false) {
          setError(r.error);
          return;
        }
        onAuthed(r.profile, { isNew: true });
      } else {
        const r = await loginUser(email, password);
        if (r.ok === false) {
          setError(r.error);
          return;
        }
        onAuthed(r.profile, { isNew: false });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
      <AuthScene3D />
      <div className="pointer-events-none absolute inset-0 auth-aurora z-[1]" />
      <div className="pointer-events-none absolute top-1/4 left-1/4 w-[520px] h-[520px] rounded-full bg-blue-600/12 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full bg-violet-600/10 blur-[100px]" />

      <div className="w-full max-w-md relative z-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bugatti-gradient shadow-[0_0_40px_rgba(0,102,255,0.35)] mb-6 border border-white/10">
            <span className="header-font text-xl font-black text-white">B</span>
          </div>
          <h1 className="header-font text-2xl font-black text-white tracking-tight mb-2">BizAuto</h1>
          <p className="text-sm text-slate-500 font-medium">Войдите или создайте аккаунт — данные хранятся локально в браузере</p>
        </div>

        <div className="glass-panel rounded-[2rem] border border-white/10 p-2 shadow-2xl">
          <div className="flex rounded-[1.5rem] bg-white/[0.04] p-1 mb-8">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              <LogIn size={16} /> Вход
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              <UserPlus size={16} /> Регистрация
            </button>
          </div>

          <form onSubmit={submit} className="px-6 pb-8 space-y-5">
            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <User size={12} /> Имя
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    placeholder="Как к вам обращаться"
                    required={mode === 'register'}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Building2 size={12} /> Название бизнеса
                  </label>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="input-field"
                    placeholder="Необязательно"
                  />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail size={12} /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@company.ru"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} /> Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Минимум 6 символов"
                required
                minLength={mode === 'register' ? 6 : undefined}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <p className="text-sm text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" className="w-full py-4 mt-2" loading={loading}>
              {mode === 'register' ? 'Создать аккаунт' : 'Войти'}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-8 font-medium">
          Регистрация не отправляет данные на сервер: пароль хэшируется и сохраняется только в этом браузере.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
