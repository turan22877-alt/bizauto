
import React, { useMemo } from 'react';
import { Appointment, Client, AppSection } from '../types';
import { TrendingUp, Users, Calendar, Wallet, Target, CalendarPlus, BarChart3, Sparkles } from 'lucide-react';
import DashboardHero3D from './three/DashboardHero3D';
import Button from './ui/Button';

interface DashboardProps {
  clients: Client[];
  appointments: Appointment[];
  onNavigate: (section: AppSection) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, appointments, onNavigate }) => {
  const confirmed = useMemo(() => appointments.filter((a) => a.status === 'confirmed'), [appointments]);
  const totalRevenue = useMemo(() => confirmed.reduce((sum, app) => sum + (app.price || 0), 0), [confirmed]);
  const avgCheck = confirmed.length ? Math.round(totalRevenue / confirmed.length) : 0;

  const completionRate = useMemo(() => {
    const total = appointments.length;
    if (!total) return null;
    return Math.round((confirmed.length / total) * 100);
  }, [appointments.length, confirmed.length]);

  const stats = [
    { label: 'Всего клиентов', value: clients.length, icon: Users, accent: 'from-blue-500/20 to-transparent', iconClass: 'text-blue-400' },
    { label: 'Всего записей', value: appointments.length, icon: Calendar, accent: 'from-amber-500/15 to-transparent', iconClass: 'text-amber-400' },
    { label: 'Выручка (подтверждено)', value: `${totalRevenue.toLocaleString()} ₽`, icon: Wallet, accent: 'from-emerald-500/20 to-transparent', iconClass: 'text-emerald-400' },
    { label: 'Средний чек', value: `${avgCheck.toLocaleString()} ₽`, icon: TrendingUp, accent: 'from-violet-500/20 to-transparent', iconClass: 'text-violet-400' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        <div className="xl:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h2 className="header-font text-3xl md:text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                Обзор
                <Sparkles className="text-blue-500 hidden sm:inline" size={28} />
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl">
                Показатели из ваших данных. Блок справа — интерактивная 3D-сцена (WebGL).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" icon={<CalendarPlus size={16} />} onClick={() => onNavigate(AppSection.BOOKING_JOURNAL)}>
              Журнал записей
            </Button>
            <Button type="button" variant="secondary" icon={<BarChart3 size={16} />} onClick={() => onNavigate(AppSection.ANALYTICS)}>
              Аналитика
            </Button>
            <Button type="button" variant="secondary" icon={<Users size={16} />} onClick={() => onNavigate(AppSection.CLIENTS)}>
              Клиенты
            </Button>
          </div>
        </div>
        <div className="xl:col-span-5 min-h-[240px]">
          <DashboardHero3D className="h-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-panel card-3d p-6 md:p-8 rounded-[1.75rem] border border-white/[0.07] relative overflow-hidden group hover:border-blue-500/25 transition-colors"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-80 pointer-events-none`} />
            <div className={`absolute top-0 right-0 w-28 h-28 opacity-[0.07] translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={112} className={stat.iconClass} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 relative">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-black text-white relative">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="glass-panel card-3d p-8 md:p-10 rounded-[2rem] border border-white/[0.07]">
          <h3 className="header-font text-lg font-bold mb-6 text-white">Ближайшие события</h3>
          {appointments.filter((a) => a.status === 'pending').length > 0 ? (
            <div className="space-y-3">
              {appointments
                .filter((a) => a.status === 'pending')
                .slice(0, 5)
                .map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-blue-600/90 rounded-xl flex items-center justify-center font-bold text-white shrink-0">
                        {app.clientName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{app.clientName}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{app.service}</p>
                      </div>
                    </div>
                    <p className="text-xs font-black text-blue-400 shrink-0 ml-2">{app.startTime}</p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-slate-600">
              <Calendar size={44} className="mb-4 opacity-40" />
              <p className="text-sm font-bold uppercase tracking-widest">Нет записей в ожидании</p>
            </div>
          )}
        </div>

        <div className="glass-panel card-3d p-8 md:p-10 rounded-[2rem] border border-white/[0.07] bg-gradient-to-br from-blue-600/[0.08] via-transparent to-violet-600/[0.06]">
          <h3 className="header-font text-lg font-bold mb-2 text-white flex items-center gap-2">
            <Target className="text-blue-400" size={22} />
            Доля подтверждённых записей
          </h3>
          <p className="text-sm text-slate-500 mb-8">Доля подтверждённых среди всех записей в журнале</p>

          {completionRate === null ? (
            <p className="text-slate-500 text-sm font-medium">Добавьте записи в журнале — здесь появится доля подтверждённых.</p>
          ) : (
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-[10px] font-black uppercase rounded-full bg-blue-600/20 text-blue-300 px-3 py-1 border border-blue-500/20">
                  Подтверждено / всего
                </span>
                <span className="text-xs font-black text-blue-400">{completionRate}%</span>
              </div>
              <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-white/10">
                <div
                  style={{ width: `${completionRate}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                Подтверждено: {confirmed.length} из {appointments.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
