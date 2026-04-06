
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, LogOut, Users, Calendar, UserCog, Package, ChevronRight, Menu } from 'lucide-react';
import { AppSection, UserProfile, Client, Appointment, Staff, Product } from '../types';

export type SearchNavigateDetail = { appointmentId?: string };

interface HeaderProps {
  activeSection: AppSection;
  user: UserProfile;
  onLogout: () => void;
  clients: Client[];
  appointments: Appointment[];
  staff: Staff[];
  inventory: Product[];
  onNavigate: (section: AppSection, detail?: SearchNavigateDetail) => void;
  onOpenSettings: () => void;
  pendingAppointmentsCount: number;
  onMenuClick?: () => void;
}

type Hit =
  | { kind: 'client'; id: string; title: string; sub: string; section: AppSection.CLIENTS }
  | { kind: 'staff'; id: string; title: string; sub: string; section: AppSection.STAFF }
  | { kind: 'product'; id: string; title: string; sub: string; section: AppSection.INVENTORY }
  | { kind: 'appointment'; id: string; title: string; sub: string; section: AppSection.BOOKING_JOURNAL };

const Header: React.FC<HeaderProps> = ({
  activeSection,
  user,
  onLogout,
  clients,
  appointments,
  staff,
  inventory,
  onNavigate,
  onOpenSettings,
  pendingAppointmentsCount,
  onMenuClick,
}) => {
  const titles: Record<AppSection, string> = {
    [AppSection.DASHBOARD]: 'Обзор',
    [AppSection.BOOKING_JOURNAL]: 'Журнал записей',
    [AppSection.CLIENTS]: 'Клиенты',
    [AppSection.STAFF]: 'Команда',
    [AppSection.INVENTORY]: 'Склад',
    [AppSection.FINANCE]: 'Финансы',
    [AppSection.ANALYTICS]: 'Аналитика',
    [AppSection.LOYALTY]: 'Лояльность',
    [AppSection.PAYROLL]: 'Зарплаты',
    [AppSection.NOTIFICATIONS]: 'Центр связи',
    [AppSection.INTEGRATIONS]: 'Интеграции',
  };

  const initials = user.displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || user.email[0]?.toUpperCase() || '?';

  const [q, setQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 1) return [] as Hit[];
    const out: Hit[] = [];
    const pushLimit = 12;

    for (const c of clients) {
      if (out.length >= pushLimit) break;
      if (c.name.toLowerCase().includes(t) || c.phone.includes(t) || c.email.toLowerCase().includes(t)) {
        out.push({ kind: 'client', id: c.id, title: c.name, sub: c.phone || c.email, section: AppSection.CLIENTS });
      }
    }
    for (const s of staff) {
      if (out.length >= pushLimit) break;
      if (s.name.toLowerCase().includes(t) || s.role.toLowerCase().includes(t) || s.specialization.toLowerCase().includes(t)) {
        out.push({ kind: 'staff', id: s.id, title: s.name, sub: s.role, section: AppSection.STAFF });
      }
    }
    for (const p of inventory) {
      if (out.length >= pushLimit) break;
      if (p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t)) {
        out.push({ kind: 'product', id: p.id, title: p.name, sub: `${p.category} · ${p.stock} шт.`, section: AppSection.INVENTORY });
      }
    }
    for (const a of appointments) {
      if (out.length >= pushLimit) break;
      if (
        a.clientName.toLowerCase().includes(t) ||
        a.service.toLowerCase().includes(t) ||
        a.date.includes(t)
      ) {
        out.push({
          kind: 'appointment',
          id: a.id,
          title: `${a.clientName} — ${a.service}`,
          sub: `${a.date} · ${a.startTime}`,
          section: AppSection.BOOKING_JOURNAL,
        });
      }
    }
    return out.slice(0, 10);
  }, [q, clients, staff, inventory, appointments]);

  const pickHit = (h: Hit) => {
    setSearchOpen(false);
    setQ('');
    if (h.kind === 'appointment') onNavigate(AppSection.BOOKING_JOURNAL, { appointmentId: h.id });
    else onNavigate(h.section);
  };

  const iconFor = (h: Hit) => {
    switch (h.kind) {
      case 'client': return <Users size={14} />;
      case 'staff': return <UserCog size={14} />;
      case 'product': return <Package size={14} />;
      default: return <Calendar size={14} />;
    }
  };

  return (
    <header className="h-16 sm:h-16 bg-white border-b border-stone-200 flex items-center justify-between px-3 sm:px-4 md:px-8 sticky top-0 z-40 shadow-sm">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden p-2.5 text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all mr-2"
        aria-label="Открыть меню"
      >
        <Menu size={22} />
      </button>

      <div className="flex flex-col min-w-0 flex-1 pr-2">
        <h2 className="text-sm sm:text-base font-bold text-stone-800 truncate">
          {titles[activeSection]}
        </h2>
        <p className="text-xs text-stone-400 truncate hidden sm:block">
          {user.businessName || 'Selliz'}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search */}
        <div ref={searchRef} className="relative group hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-600 transition-colors z-10"
            size={16}
          />
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Поиск..."
            className="pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 w-56 lg:w-72 transition-all placeholder:text-stone-400 text-stone-700"
            autoComplete="off"
          />
          {searchOpen && q.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 py-1 rounded-lg border border-stone-200 bg-white shadow-xl z-50 max-h-80 overflow-y-auto">
              {hits.length === 0 ? (
                <p className="px-4 py-4 text-xs text-stone-400 text-center">Ничего не найдено</p>
              ) : (
                hits.map((h) => (
                  <button
                    key={`${h.kind}-${h.id}`}
                    type="button"
                    onClick={() => pickHit(h)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-50 transition-colors border-b border-stone-100 last:border-0"
                  >
                    <span className="text-orange-600 shrink-0">{iconFor(h)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium text-stone-700 truncate">{h.title}</span>
                      <span className="block text-[10px] text-stone-400 truncate">{h.sub}</span>
                    </span>
                    <ChevronRight size={14} className="text-stone-300 shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <button
          type="button"
          onClick={() => onNavigate(AppSection.BOOKING_JOURNAL)}
          className="p-2 sm:p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all relative"
          aria-label="Записи"
        >
          <Bell size={20} />
          {pendingAppointmentsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
              {pendingAppointmentsCount > 9 ? '9+' : pendingAppointmentsCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all hidden sm:block"
          aria-label="Настройки"
        >
          <Settings size={20} />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-stone-200 hidden sm:block" />

        {/* User */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-stone-700 truncate max-w-[120px]">
              {user.displayName}
            </p>
            <p className="text-[10px] text-stone-400 truncate max-w-[120px]">{user.email}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bugatti-gradient flex items-center justify-center font-bold text-white text-xs shrink-0">
            {initials}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all hidden sm:block"
            title="Выйти"
            aria-label="Выйти"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
