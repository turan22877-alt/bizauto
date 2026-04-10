import React, { useState } from 'react';
import { LogIn, UserPlus, Building2, Mail, Lock, User } from 'lucide-react';
import Button from './ui/Button';
import { loginUser, registerUser } from '../utils/auth';
import AuthScene3D from './three/AuthScene3D';

const AuthScreen = ({ onAuthed }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
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
    <div className="min-h-screen bg-stone-50 text-slate-700 flex items-center justify-center p-6 relative overflow-hidden">
      <AuthScene3D />
      <div className="pointer-events-none absolute inset-0 auth-aurora z-[1]" />
      <div className="pointer-events-none absolute top-1/4 left-1/4 w-[520px] h-[520px] rounded-full bg-orange-500/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full bg-orange-600/6 blur-[100px]" />

      <div className="w-full max-w-[480px] mx-auto relative z-20 px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-black shadow-xl mb-6">
            <span className="header-font text-3xl font-black text-orange-500">S</span>
          </div>
          <h1 className="header-font text-5xl font-black text-stone-900 tracking-tighter mb-3">Selliz</h1>
          <p className="text-stone-500 font-medium">Ваш бизнес под контролем.</p>
        </div>

        <div className="glass-panel rounded-[2rem] border border-slate-200 p-12 shadow-2xl w-full">
          <div className="flex gap-4 mb-10">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl text-base font-bold transition-all border-2 ${
                mode === 'login'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                  : 'bg-transparent text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              <LogIn size={20} /> <span>Вход</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl text-base font-bold transition-all border-2 ${
                mode === 'register'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                  : 'bg-transparent text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              <UserPlus size={20} /> <span>Регистрация</span>
            </button>
          </div>

          <form onSubmit={submit} className="space-y-8">
            {mode === 'register' && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-stone-600 ml-1 flex items-center gap-2">
                    <User size={16} /> Имя
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    placeholder="Как к вам обращаться"
                    required={mode === 'register'}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-stone-600 ml-1 flex items-center gap-2">
                    <Building2 size={16} /> Название бизнеса
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
            <div className="space-y-3">
              <label className="text-sm font-semibold text-stone-600 ml-1 flex items-center gap-2">
                <Mail size={16} /> Email
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
            <div className="space-y-3">
              <label className="text-sm font-semibold text-stone-600 ml-1 flex items-center gap-2">
                <Lock size={16} /> Пароль
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
              <p className="text-sm text-rose-500 font-medium bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" className="w-full py-5 mt-4 text-base bg-black hover:bg-stone-900" loading={loading}>
              {mode === 'register' ? 'Создать аккаунт' : 'Войти'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-500 mt-8 font-medium">
          Все данные хранятся локально в вашем браузере.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;