
import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Package,
  Wallet,
  BarChart,
  Gift,
  Bell,
  Layers,
} from 'lucide-react';
import { AppSection } from '../types';

interface SidebarProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  businessName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, businessName }) => {
  const menu = [
    { id: AppSection.DASHBOARD, label: 'Обзор', icon: LayoutDashboard },
    { id: AppSection.BOOKING_JOURNAL, label: 'Журнал', icon: Calendar },
    { id: AppSection.CLIENTS, label: 'Клиенты', icon: Users },
    { id: AppSection.STAFF, label: 'Команда', icon: UserCog },
    { id: AppSection.INVENTORY, label: 'Склад', icon: Package },
    { id: AppSection.FINANCE, label: 'Финансы', icon: Wallet },
    { id: AppSection.ANALYTICS, label: 'Аналитика', icon: BarChart },
    { id: AppSection.PAYROLL, label: 'Зарплаты', icon: Layers },
    { id: AppSection.LOYALTY, label: 'Лояльность', icon: Gift },
    { id: AppSection.NOTIFICATIONS, label: 'Центр связи', icon: Bell },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-[#0c0c10] border-r border-white/[0.06] flex flex-col sticky top-0 h-screen z-50 shadow-[4px_0_40px_rgba(0,0,0,0.35)]">
      <div className="p-6 lg:p-10 flex flex-col h-full min-h-0">
        <div className="flex flex-col gap-1 mb-8 lg:mb-12 shrink-0">
          <h1 className="header-font text-xl lg:text-2xl font-black text-white tracking-tighter flex items-center gap-2">
            <span className="w-8 h-8 bugatti-gradient rounded-xl flex items-center justify-center text-xs shadow-lg shadow-blue-900/30">
              B
            </span>
            BIZAUTO
          </h1>
          <p className="text-[10px] font-bold text-blue-500/90 uppercase tracking-[0.25em] line-clamp-2">
            {businessName || 'Управление сервисом'}
          </p>
        </div>

        <nav className="space-y-1.5 overflow-y-auto flex-1 min-h-0 pr-1 sidebar-scroll">
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3.5 rounded-2xl text-xs lg:text-sm font-semibold transition-all duration-300 ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white shadow-[0_0_28px_rgba(0,102,255,0.35)] border border-blue-400/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <item.icon size={20} strokeWidth={activeSection === item.id ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-white/[0.06] shrink-0">
          <div className="p-4 lg:p-5 glass-panel rounded-2xl lg:rounded-3xl border border-white/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Статус</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-xs font-bold text-white">Синхронизация локальная</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
