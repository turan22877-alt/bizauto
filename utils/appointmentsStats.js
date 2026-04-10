import { Appointment } from '../types';

/** Parses YYYY-MM-DD or falls back to Date.parse */
export function parseAppointmentDate(dateStr) {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const t = Date.parse(dateStr);
  return Number.isNaN(t) ? null : new Date(t);
}

export function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabelRu(key) {
  const [y, m] = key.split('-').map(Number);
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return `${months[(m || 1) - 1]} ${y}`;
}

export function confirmedRevenueByMonth(appointments) {
  const map = new Map();
  for (const a of appointments) {
    if (a.status !== 'confirmed') continue;
    const dt = parseAppointmentDate(a.date);
    if (!dt) continue;
    const key = monthKey(dt);
    map.set(key, (map.get(key) || 0) + (a.price || 0));
  }
  const keys = Array.from(map.keys()).sort();
  return keys.map((key) => ({
    key,
    revenue: map.get(key) || 0,
    label: monthLabelRu(key),
  }));
}

export function appointmentsCountByMonth(appointments) {
  const map = new Map();
  for (const a of appointments) {
    const dt = parseAppointmentDate(a.date);
    if (!dt) continue;
    const key = monthKey(dt);
    map.set(key, (map.get(key) || 0) + 1);
  }
  const keys = Array.from(map.keys()).sort();
  return keys.map((key) => ({
    key,
    count: map.get(key) || 0,
    label: monthLabelRu(key),
  }));
}

export function revenueInMonth(appointments, year, month0) {
  return appointments
    .filter((a) => {
      if (a.status !== 'confirmed') return false;
      const dt = parseAppointmentDate(a.date);
      return dt && dt.getFullYear() === year && dt.getMonth() === month0;
    })
    .reduce((s, a) => s + (a.price || 0), 0);
}