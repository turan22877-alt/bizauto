import React, { useState, useEffect } from 'react';
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
  X,
} from 'lucide-react';
import { AppSection } from '../types';

const Sidebar = ({
  activeSection,
  onSectionChange,
  businessName,
  pendingAppointmentsCount = 0,
  mobileOpen = false,
  onMobileClose
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Reset collapsed state when mobile menu opens
  useEffect(() => {
    if (mobileOpen) {
      setCollapsed(false);
    }
  }, [mobileOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileOpen && onMobileClose) {
        onMobileClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen, onMobileClose]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleItemClick = (section) => {
    onSectionChange(section);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const menuGroups = [
    {
      label: 'Основное',
      icon: Zap,
      items: [
        { id: AppSection.DASHBOARD, label: 'Обзор', icon: LayoutDashboard, badge: pendingAppointmentsCount || undefined },
        { id: AppSection.BOOKING_JOURNAL, label: 'Журнал записей', icon: Calendar },
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
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-stone-900 border-r border-stone-700/50 flex flex-col h-screen z-50 transition-all duration-300
          ${collapsed && !mobileOpen ? 'w-20' : 'w-80'}
          lg:sticky lg:top-0
          fixed top-0 left-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full min-h-0 p-5">
          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bugatti-gradient rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0">
                S
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <h1 className="header-font text-sm font-black text-white tracking-tight truncate">SELLIZ</h1>
                  <p className="text-[10px] font-semibold text-orange-400/80 uppercase tracking-wider truncate">
                    {businessName || 'Управление продажами'}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            {!collapsed && (
              <button
                type="button"
                onClick={onMobileClose}
                className="lg:hidden p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-all"
                aria-label="Закрыть меню"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Collapse toggle - desktop only */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`mb-4 rounded-lg border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 transition-all hidden lg:flex ${
              collapsed ? 'mx-auto w-10 h-10 items-center justify-center' : 'w-full items-center justify-end p-2'
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
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                          collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                        } ${
                          isActive
                            ? 'bg-orange-600 text-white shadow-lg'
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
                              <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                                {item.badge > 9 ? '9+' : item.badge}
                              </span>
                            )}
                          </>
                        )}

                        {collapsed && item.badge && item.badge > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full" />
                        )}
                      </button>

                      {/* Tooltip when collapsed */}
                      {collapsed && isHovered && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-[60] whitespace-nowrap pointer-events-none">
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
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-stone-400">Онлайн</span>
            </div>
          )}
        </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;