import React, { useMemo } from "react";
import { UserCheck, Calculator, Settings } from "lucide-react";
// Types removed - using plain objects
import Button from "./ui/Button";

const PayrollCalculator = ({ staff, appointments }) => {
  const revenueByStaff = useMemo(() => {
    const m = new Map();
    for (const a of appointments) {
      if (a.status !== "confirmed") continue;
      m.set(a.staffId, (m.get(a.staffId) || 0) + (a.price || 0));
    }
    return m;
  }, [appointments]);

  const rows = useMemo(
    () =>
      staff.map((s) => {
        const rev = revenueByStaff.get(s.id) || 0;
        const base = s.baseSalary ?? 0;
        const pct = s.commissionPercent ?? 0;
        const bonus = Math.round(rev * (pct / 100));
        const total = base + bonus;
        return { s, rev, base, pct, bonus, total };
      }),
    [staff, revenueByStaff],
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="header-font text-3xl md:text-4xl font-black text-slate-800 mb-2">
            Зарплаты
          </h2>
          <p className="text-slate-600 font-medium">
            Оклад и процент задаются в карточке сотрудника; бонус считается от
            подтверждённой выручки по записям
          </p>
        </div>
      </div>

      <div className="glass-panel p-10 md:p-12 rounded-[2.5rem] border border-slate-200 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="w-20 h-20 bg-orange-600/10 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
          <Calculator size={32} />
        </div>
        <h2 className="header-font text-2xl md:text-3xl font-black text-slate-800 mb-4">
          Расчёт по данным журнала
        </h2>
        <p className="text-slate-600 mx-auto font-medium mb-8 text-sm px-4">
          Итог = оклад + (сумма подтверждённых услуг сотрудника × процент комиссии).
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="secondary"
            icon={<Settings size={18} />}
            className="px-8"
            type="button"
            disabled
            title="Настройки в карточке сотрудника"
          >
            Поля оклада и %
          </Button>
        </div>
      </div>

      {staff.length === 0 ? (
        <div className="glass-panel rounded-[2rem] border border-slate-200 py-24 text-center">
          <UserCheck size={56} className="mx-auto mb-6 text-slate-400" />
          <p className="header-font text-lg font-bold text-slate-500 uppercase tracking-[0.2em]">
            Добавьте сотрудников в разделе «Команда»
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rows.map(({ s, rev, base, pct, bonus, total }) => (
            <div
              key={s.id}
              className="glass-panel p-8 rounded-[2rem] border border-slate-200 hover:border-orange-500/20 transition-all group"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors border border-slate-200">
                  <UserCheck size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-800 leading-tight tracking-tight truncate">
                    {s.name}
                  </h4>
                  <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mt-1 truncate">
                    {s.role}
                  </p>
                </div>
              </div>
              <div className="space-y-4 border-t border-slate-200 pt-6">
                <div className="flex justify-between text-xs gap-2">
                  <span className="text-slate-600 font-bold uppercase tracking-widest shrink-0">
                    Выручка (подтв.)
                  </span>
                  <span className="font-black text-slate-700 text-right">
                    {rev.toLocaleString()} ₽
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-bold uppercase tracking-widest">
                    Оклад
                  </span>
                  <span className="font-black text-slate-700">
                    {base.toLocaleString()} ₽
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-bold uppercase tracking-widest">
                    Комиссия ({pct}%)
                  </span>
                  <span className="font-black text-orange-500">
                    +{bonus.toLocaleString()} ₽
                  </span>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Итого
                  </span>
                  <span className="text-2xl font-black text-slate-800 tracking-tighter">
                    {total.toLocaleString()} ₽
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayrollCalculator;
