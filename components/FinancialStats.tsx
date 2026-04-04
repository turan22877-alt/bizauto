
import React, { useMemo } from 'react';
import { Appointment } from '../types';
import { ArrowDownRight, ArrowUpRight, Activity, Wallet } from 'lucide-react';
import { revenueInMonth } from '../utils/appointmentsStats';

const FinancialStats: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  const confirmed = useMemo(() => appointments.filter((a) => a.status === 'confirmed'), [appointments]);
  const revenue = useMemo(() => confirmed.reduce((s, a) => s + (a.price || 0), 0), [confirmed]);
  const pendingRevenue = useMemo(
    () => appointments.filter((a) => a.status === 'pending').reduce((s, a) => s + (a.price || 0), 0),
    [appointments]
  );

  const { growthLabel, growthPositive, growthNeutral } = useMemo(() => {
    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth();
    const prevM = curM === 0 ? 11 : curM - 1;
    const prevY = curM === 0 ? curY - 1 : curY;
    const curRev = revenueInMonth(appointments, curY, curM);
    const prevRev = revenueInMonth(appointments, prevY, prevM);
    if (prevRev > 0) {
      const pct = ((curRev - prevRev) / prevRev) * 100;
      const rounded = pct.toFixed(1);
      return {
        growthLabel: `${pct >= 0 ? '+' : ''}${rounded}%`,
        growthPositive: pct >= 0,
        growthNeutral: false,
      };
    }
    if (curRev > 0 && prevRev === 0) {
      return { growthLabel: 'Первый доход в периоде', growthPositive: true, growthNeutral: true };
    }
    return { growthLabel: 'Нет данных за прошлый месяц', growthPositive: true, growthNeutral: true };
  }, [appointments]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="header-font text-3xl md:text-4xl font-black text-white mb-2">Финансы</h2>
          <p className="text-slate-500 font-medium">Суммы только из подтверждённых записей; сравнение — текущий и прошлый календарный месяц</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/[0.07] bg-gradient-to-br from-blue-600 to-indigo-950 shadow-[0_30px_60px_-15px_rgba(0,102,255,0.35)] relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-[0.08]">
            <Wallet size={280} className="text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase text-blue-100/90 tracking-[0.3em] mb-3">Подтверждённая выручка (всего)</p>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tighter">{revenue.toLocaleString()} ₽</h2>
            <div className="flex flex-wrap gap-8 md:gap-10">
              <div>
                <p className="text-[10px] font-bold text-blue-200/90 uppercase mb-1 tracking-widest">Подтверждено записей</p>
                <p className="text-2xl font-black text-white">{confirmed.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-200/90 uppercase mb-1 tracking-widest">Ожидается (pending)</p>
                <p className="text-2xl font-black text-white">{pendingRevenue.toLocaleString()} ₽</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-[1.75rem] border border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  growthNeutral ? 'bg-slate-500/10 text-slate-400' : growthPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {growthNeutral ? <Activity size={24} /> : growthPositive ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">К прошлому месяцу</p>
                <p
                  className={`text-lg font-black ${
                    growthNeutral ? 'text-slate-200' : growthPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {growthLabel}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 md:p-8 rounded-[1.75rem] border border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Средний чек</p>
                <p className="text-xl font-black text-white">
                  {confirmed.length ? Math.round(revenue / confirmed.length).toLocaleString() : 0} ₽
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] border border-white/[0.07] overflow-hidden">
        <div className="p-8 border-b border-white/[0.06] bg-white/[0.03]">
          <h3 className="header-font text-lg font-bold text-white">Подтверждённые операции</h3>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {confirmed.length > 0 ? (
            confirmed.map((app) => (
              <div key={app.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors gap-4">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-black text-white tracking-tight truncate">{app.clientName}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] mt-1 truncate">{app.service}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-white text-lg">{app.price.toLocaleString()} ₽</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{app.date}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-slate-600 text-sm font-bold uppercase tracking-widest">
              Нет подтверждённых записей
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialStats;
