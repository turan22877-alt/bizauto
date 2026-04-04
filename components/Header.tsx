
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, LogOut, Users, Calendar, UserCog, Package, ChevronRight } from 'lucide-react';
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
}) => {
  const titles: Record<AppSection, string> = {
    [AppSection.DASHBOARD]: 'DASHBOARD',
    [AppSection.BOOKING_JOURNAL]: 'MISSION CONTROL',
    [AppSection.CLIENTS]: 'CLIENT RELATIONS',
    [AppSection.STAFF]: 'ENGINEERING TEAM',
    [AppSection.INVENTORY]: 'INVENTORY HUB',
    [AppSection.FINANCE]: 'FINANCIAL VAULT',
    [AppSection.ANALYTICS]: 'TELEMETRY DATA',
    [AppSection.LOYALTY]: 'ROYAL PASS',
    [AppSection.PAYROLL]: 'PAYROLL SYSTEM',
    [AppSection.NOTIFICATIONS]: 'COMMS CENTER',
    [AppSection.INTEGRATIONS]: 'LINK SYSTEM',
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
      case 'client':
        return <Users size={14} />;
      case 'staff':
        return <UserCog size={14} />;
      case 'product':
        return <Package size={14} />;
      default:
        return <Calendar size={14} />;
    }
  };

  return (
    <header className="h-[4.5rem] md:h-24 bg-[#06060a]/88 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 md:px-10 sticky top-0 z-40">
      <div className="flex flex-col min-w-0 flex-1 pr-2">
        <h2 className="header-font text-[10px] md:text-xs font-black text-blue-500 tracking-[0.2em] md:tracking-[0.35em] mb-0.5 truncate">
          {titles[activeSection]}
        </h2>
        <p className="text-[10px] md:text-xs text-slate-500 font-bold truncate">
          {user.businessName || 'BizAuto'} · личный кабинет
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-6 shrink-0">
        <div ref={searchRef} className="relative group hidden md:block">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors z-10"
            size={16}
          />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Глобальный поиск..."
            className="pl-12 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-xs font-bold focus:outline-none focus:border-blue-500/50 w-56 lg:w-72 transition-all placeholder:text-slate-700"
            autoComplete="off"
          />
          {searchOpen && q.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 py-2 rounded-2xl border border-white/10 bg-[#0e1018]/95 backdrop-blur-xl shadow-2xl z-[60] max-h-80 overflow-y-auto">
              {hits.length === 0 ? (
                <p className="px-4 py-6 text-xs text-slate-500 text-center">Ничего не найдено</p>
              ) : (
                hits.map((h) => (
                  <button
                    key={`${h.kind}-${h.id}`}
                    type="button"
                    onClick={() => pickHit(h)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <span className="text-blue-500 shrink-0">{iconFor(h)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-white truncate">{h.title}</span>
                      <span className="block text-[10px] text-slate-500 truncate">{h.sub}</span>
                    </span>
                    <ChevronRight size={14} className="text-slate-600 shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 md:gap-1">
          <button
            type="button"
            onClick={() => onNavigate(AppSection.BOOKING_JOURNAL)}
            className="p-2.5 md:p-3 text-slate-500 hover:text-white transition-colors relative rounded-xl hover:bg-white/5"
            aria-label="Записи"
            title={pendingAppointmentsCount ? `${pendingAppointmentsCount} в ожидании` : 'Журнал'}
          >
            <Bell size={20} />
            {pendingAppointmentsCount > 0 && (
              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                {pendingAppointmentsCount > 9 ? '9+' : pendingAppointmentsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2.5 md:p-3 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/5 hidden sm:block"
            aria-label="Настройки"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="w-px h-8 bg-white/10 mx-0 md:mx-1 hidden sm:block" />

        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white uppercase tracking-tighter truncate max-w-[120px] lg:max-w-[140px]">
              {user.displayName}
            </p>
            <p className="text-[10px] text-blue-500 font-bold uppercase truncate max-w-[120px] lg:max-w-[140px]">{user.email}</p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bugatti-gradient p-[2px] shrink-0 shadow-[0_0_24px_rgba(0,102,255,0.25)]">
            <div className="w-full h-full bg-[#06060a] rounded-[14px] flex items-center justify-center font-black text-blue-400 text-xs md:text-sm">
              {initials}
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Выйти"
            aria-label="Выйти"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
