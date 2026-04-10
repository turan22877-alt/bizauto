import React, { useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import { Download, FileText, Table as TableIcon, Activity } from 'lucide-react';
import Button from './ui/Button';
// Types removed - using plain objects
import { monthKey, monthLabelRu, parseAppointmentDate } from '../utils/appointmentsStats';

const COLORS = ['#f97316', '#ea580c', '#c2410c', '#fed7aa', '#fb923c', '#818cf8', '#0ea5e9'];

function buildLast12Months() {
  const out = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    out.push({ key, label: monthLabelRu(key) });
  }
  return out;
}

const AnalyticsView = ({ appointments, clients }) => {
  const barData = useMemo(() => {
    const confirmed = appointments.filter((a) => a.status === 'confirmed');
    const revenueByKey = new Map();
    for (const a of confirmed) {
      const dt = parseAppointmentDate(a.date);
      if (!dt) continue;
      const key = monthKey(dt);
      revenueByKey.set(key, (revenueByKey.get(key) || 0) + (a.price || 0));
    }
    return buildLast12Months().map(({ key, label }) => ({
      name: label,
      key,
      value: revenueByKey.get(key) || 0,
    }));
  }, [appointments]);

  const lineData = useMemo(() => {
    const byKey = new Map();
    for (const a of appointments) {
      const dt = parseAppointmentDate(a.date);
      if (!dt) continue;
      const key = monthKey(dt);
      byKey.set(key, (byKey.get(key) || 0) + 1);
    }
    return buildLast12Months().map(({ key, label }) => ({
      name: label,
      key,
      value: byKey.get(key) || 0,
    }));
  }, [appointments]);

  const hasAnyBar = barData.some((d) => d.value > 0);
  const hasAnyLine = lineData.some((d) => d.value > 0);

  const downloadCsv = useCallback(
    (filename, rows) => {
      if (!rows.length) return;
      const headers = Object.keys(rows[0]);
      const esc = (v) => {
        const s = String(v);
        if (s.includes(';') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const body = [headers.join(';'), ...rows.map((r) => headers.map((h) => esc(r[h])).join(';'))].join('\n');
      const blob = new Blob(['\ufeff' + body], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    []
  );

  const exportRevenueCsv = () => {
    downloadCsv(
      'bizauto-vyruchka-po-mesyacam.csv',
      barData.map((r) => ({ Месяц: r.name, Период: r.key, 'Выручка_подтверждено_RUB': r.value }))
    );
  };

  const exportClientsCsv = () => {
    downloadCsv(
      'bizauto-klienty.csv',
      clients.map((c) => ({
        Имя: c.name,
        Телефон: c.phone,
        Email: c.email,
        Визитов: c.visits,
        Потрачено: c.totalSpent,
        Баллы: c.points,
        Статус: c.status,
      }))
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="header-font text-3xl md:text-4xl font-black text-slate-800 mb-2">Аналитика</h2>
          <p className="text-slate-600 font-medium">
            Графики строятся по датам и суммам из журнала записей (только ваш аккаунт)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="glass-panel p-8 md:p-10 rounded-[2rem] border border-slate-200">
          <h3 className="header-font text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
            <TableIcon className="text-orange-600" /> Выручка по месяцам
          </h3>
          <p className="text-xs text-slate-600 mb-4">Только подтверждённые записи, последние 12 месяцев</p>
          <div className="h-72">
            {!hasAnyBar ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm font-medium text-center px-4">
                Нет подтверждённых записей с распознаваемой датой — добавьте записи в журнале.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8faf9',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '1rem',
                      color: '#1e293b',
                    }}
                    formatter={(v) => [`${v.toLocaleString()} ₽`, 'Выручка']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-[2rem] border border-slate-200">
          <h3 className="header-font text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
            <Activity className="text-orange-600" /> Записей по месяцам
          </h3>
          <p className="text-xs text-slate-600 mb-4">Все статусы, количество записей в календаре</p>
          <div className="h-72">
            {!hasAnyLine ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm font-medium text-center px-4">
                Нет записей с датой — создайте записи в журнале.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8faf9',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '1rem',
                      color: '#1e293b',
                    }}
                    formatter={(v) => [v, 'Записей']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#f8faf9' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-10 md:p-12 rounded-[2.5rem] border border-slate-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
        <h3 className="header-font text-2xl md:text-3xl font-black text-slate-800 mb-3 tracking-tight">Экспорт данных</h3>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto font-medium text-sm leading-relaxed">
          Скачайте CSV с агрегированной выручкой по месяцам или актуальным списком клиентов.
          <br />
          Экспортируются только реальные данные вашего аккаунта.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="secondary" icon={<Download size={18} />} className="px-8" type="button" onClick={exportRevenueCsv}>
            CSV выручка
          </Button>
            <Button variant="secondary" icon={<FileText size={18} className="text-orange-600" />} className="px-8" type="button" onClick={exportClientsCsv}>
            CSV клиенты
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;