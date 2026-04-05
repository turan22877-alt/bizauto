
import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { AppSection } from '../types';

interface SidebarProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  businessName?: string;
  pendingAppointmentsCount?: number;
}

type MenuGroup = {
  label: string;
  icon: React.FC<{ size?: number; strokeWidth?: number }>;
  items: { id: AppSection; label: string; icon: React.FC<{ size?: number; strokeWidth?: number }>; badge?: number }[];
};

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, businessName, pendingAppointmentsCount = 0 }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuGroups: MenuGroup[] = [
    {
      label: 'Основное',
      icon: Zap,
      items: [
        { id: AppSection.DASHBOARD, label: 'Обзор', icon: LayoutDashboard },
        { id: AppSection.BOOKING_JOURNAL, label: 'Журнал записей', icon: Calendar, badge: pendingAppointmentsCount || undefined },
      ],
    },
    {
      label: 'Управление',
      icon: Shield,
      items: [
        { id: AppSection.CLIENTS, label: 'Клиенты', icon: Users },
        { id: AppSection.STAFF, label: 'Команда', icon: UserCog },
        { id: AppSection.INVENTORY, label: 'Склад', icon: Package },
        { id: AppSection.LOYALTY, label: 'Лояльность', icon: Gift },
      ],
    },
    {
      label: 'Аналитика',
      icon: TrendingUp,
      items: [
        { id: AppSection.FINANCE, label: 'Финансы', icon: Wallet },
        { id: AppSection.ANALYTICS, label: 'Аналитика', icon: BarChart },
        { id: AppSection.PAYROLL, label: 'Зарплаты', icon: Layers },
        { id: AppSection.NOTIFICATIONS, label: 'Центр связи', icon: Bell },
      ],
    },
  ];

  return (
    <aside
      className={`bg-stone-900 border-r border-stone-700/50 flex flex-col sticky top-0 h-screen z-50 transition-all duration-300 ${
        collapsed ? 'w-[76px]' : 'w-72'
      }`}
    >
      <div className="flex flex-col h-full min-h-0 p-5">
        {/* Logo */}
        <div className={`flex items-center gap-3 mb-6 shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bugatti-gradient rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0">
            B
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden">
              <h1 className="header-font text-sm font-black text-white tracking-tight truncate">BIZAUTO</h1>
              <p className="text-[10px] font-semibold text-green-400/80 uppercase tracking-wider truncate">
                {businessName || 'Управление сервисом'}
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`mb-4 rounded-lg border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 transition-all ${
            collapsed ? 'mx-auto w-10 h-10 flex items-center justify-center' : 'w-full flex items-center justify-end p-2'
          }`}
          aria-label={collapsed ? 'Развернуть' : 'Свернуть'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Navigation */}
        <nav className="space-y-5 overflow-y-auto flex-1 min-h-0 pr-1 sidebar-scroll">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {/* Group label */}
              {!collapsed && (
                <div className="flex items-center gap-2 mb-2 px-3">
                  <group.icon size={12} className="text-stone-500" />
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{group.label}</span>
                </div>
              )}

              {/* Group items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  const isHovered = hoveredItem === item.id;

                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <button
                        type="button"
                        onClick={() => onSectionChange(item.id)}
                        className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                          collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                        } ${
                          isActive
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'text-stone-400 hover:text-white hover:bg-stone-800'
                        }`}
                      >
                        <item.icon
                          size={20}
                          strokeWidth={isActive ? 2.5 : 1.8}
                          className={`shrink-0 ${isActive ? 'text-white' : ''}`}
                        />

                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {item.badge && item.badge > 0 && (
                              <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                                {item.badge > 9 ? '9+' : item.badge}
                              </span>
                            )}
                          </>
                        )}

                        {collapsed && item.badge && item.badge > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full" />
                        )}
                      </button>

                      {/* Tooltip when collapsed */}
                      {collapsed && isHovered && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-[100] whitespace-nowrap pointer-events-none">
                          <span className="text-xs font-medium text-white">{item.label}</span>
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-stone-800" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Separator */}
              {!collapsed && <div className="h-px bg-stone-800 my-3 mx-3" />}
            </div>
          ))}
        </nav>

        {/* Status footer */}
        <div className={`mt-4 pt-4 border-t border-stone-800 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-stone-400">Онлайн</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
