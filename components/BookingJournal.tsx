
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Scissors, Trash2, CalendarDays } from 'lucide-react';
import { Appointment, Staff, Client } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import ConfirmDialog from './ui/ConfirmDialog';
import { formatYMD, addDaysYMD, labelRuFromYMD } from '../utils/dateYmd';

interface BookingJournalProps {
  appointments: Appointment[];
  staff: Staff[];
  clients: Client[];
  onUpdateAppointments: (apps: Appointment[]) => void;
  ownerUid: string;
  focusRequest: { appointmentId: string } | null;
  onFocusConsumed: () => void;
}

const BookingJournal: React.FC<BookingJournalProps> = ({
  appointments,
  staff,
  clients,
  onUpdateAppointments,
  ownerUid,
  focusRequest,
  onFocusConsumed,
}) => {
  const todayYmd = formatYMD(new Date());
  const [viewDate, setViewDate] = useState(todayYmd);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (staff.length && !selectedStaffId) setSelectedStaffId(staff[0].id);
  }, [staff, selectedStaffId]);

  useEffect(() => {
    if (!focusRequest) return;
    const app = appointments.find((a) => a.id === focusRequest.appointmentId);
    if (!app) {
      onFocusConsumed();
      return;
    }
    setViewDate(app.date);
    setSelectedStaffId(app.staffId);
    setEditingAppointment(app);
    setIsModalOpen(true);
    onFocusConsumed();
  }, [focusRequest, appointments, onFocusConsumed]);

  const hours = Array.from({ length: 13 }, (_, i) => `${9 + i}:00`);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateStr = (formData.get('date') as string) || viewDate;

    const newApp: Appointment = {
      id: editingAppointment?.id || Math.random().toString(36).substr(2, 9),
      clientId: formData.get('clientId') as string,
      clientName: clients.find((c) => c.id === formData.get('clientId'))?.name || 'Неизвестный клиент',
      staffId: selectedStaffId,
      service: formData.get('service') as string,
      startTime: formData.get('startTime') as string,
      date: dateStr,
      duration: parseInt(formData.get('duration') as string, 10),
      status: formData.get('status') as Appointment['status'],
      price: parseInt(formData.get('price') as string, 10),
      ownerUid,
    };

    if (editingAppointment) {
      onUpdateAppointments(appointments.map((a) => (a.id === editingAppointment.id ? newApp : a)));
    } else {
      onUpdateAppointments([...appointments, newApp]);
    }

    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      onUpdateAppointments(appointments.filter((a) => a.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      setIsModalOpen(false);
      setEditingAppointment(null);
    }
  };

  const getSlotPosition = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const startH = 9;
    const pixelsPerHour = 80;
    return (h - startH) * pixelsPerHour + (m / 60) * pixelsPerHour;
  };

  const staffAppointments = appointments.filter((a) => a.staffId === selectedStaffId && a.date === viewDate);

  const goPrev = () => setViewDate((d) => addDaysYMD(d, -1));
  const goNext = () => setViewDate((d) => addDaysYMD(d, 1));
  const goToday = () => setViewDate(todayYmd);

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)] relative">
      <div className="mb-6 md:mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
            <button type="button" onClick={goPrev} className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all" aria-label="Предыдущий день">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 md:px-6 text-xs md:text-sm font-black text-white uppercase tracking-widest text-center max-w-[min(100%,280px)]">
              {labelRuFromYMD(viewDate)}
            </span>
            <button type="button" onClick={goNext} className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all" aria-label="Следующий день">
              <ChevronRight size={20} />
            </button>
          </div>
          {viewDate !== todayYmd && (
            <Button type="button" variant="secondary" size="sm" onClick={goToday} icon={<CalendarDays size={14} />}>
              Сегодня
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar min-h-[48px]">
            {staff.length === 0 ? (
              <span className="px-4 py-3 text-[10px] font-black text-slate-600 uppercase">Добавьте сотрудников</span>
            ) : (
              staff.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStaffId(s.id)}
                  className={`px-4 md:px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                    selectedStaffId === s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {s.name.split(' ')[0]}
                </button>
              ))
            )}
          </div>
          <Button
            onClick={() => {
              setEditingAppointment(null);
              setIsModalOpen(true);
            }}
            icon={<Plus size={18} />}
            disabled={!staff.length || !clients.length}
            title={!staff.length ? 'Нужен хотя бы один сотрудник' : !clients.length ? 'Нужен хотя бы один клиент' : undefined}
          >
            Запись
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto glass-panel rounded-[2rem] md:rounded-[2.5rem] border border-white/[0.07] p-6 md:p-8 no-scrollbar min-h-[420px]">
        {!staff.length ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 text-sm font-medium text-center px-4">
            Создайте сотрудника в разделе «Команда», чтобы вести журнал.
          </div>
        ) : (
          <div className="grid grid-cols-[72px_1fr] md:grid-cols-[100px_1fr] gap-4 md:gap-8 relative min-h-[1040px]">
            <div className="space-y-[68px] mt-2">
              {hours.map((h) => (
                <div key={h} className="text-[10px] font-black text-slate-600 text-right pr-2 md:pr-6 h-3 uppercase tracking-widest">
                  {h}
                </div>
              ))}
            </div>

            <div className="relative border-l border-white/5 bg-black/20 rounded-3xl overflow-hidden">
              {hours.map((_, i) => (
                <div key={i} className="h-20 border-b border-white/5 border-dashed" />
              ))}

              {staffAppointments.map((app) => (
                <div
                  key={app.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && (setEditingAppointment(app), setIsModalOpen(true))}
                  onClick={() => {
                    setEditingAppointment(app);
                    setIsModalOpen(true);
                  }}
                  style={{
                    top: `${getSlotPosition(app.startTime)}px`,
                    height: `${(app.duration / 60) * 80}px`,
                  }}
                  className={`absolute left-2 right-2 md:left-4 md:right-4 p-4 md:p-5 rounded-2xl border-l-4 shadow-2xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] z-10 ${
                    app.status === 'confirmed'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : app.status === 'cancelled'
                        ? 'bg-slate-500/10 border-slate-500 text-slate-400'
                        : 'bg-blue-500/10 border-blue-500 text-blue-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="text-xs font-black uppercase tracking-tight truncate">{app.clientName}</span>
                    <span className="text-[10px] font-black opacity-60 shrink-0">{app.startTime}</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 truncate">{app.service}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAppointment ? 'Изменить запись' : 'Новая запись'}>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Дата</label>
            <input
              name="date"
              type="date"
              defaultValue={editingAppointment?.date || viewDate}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Клиент</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select
                name="clientId"
                defaultValue={editingAppointment?.clientId}
                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                required
              >
                <option className="bg-[#111]" value="">
                  Выберите клиента
                </option>
                {clients.map((c) => (
                  <option className="bg-[#111]" key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Время</label>
              <div className="relative">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  name="startTime"
                  type="time"
                  defaultValue={editingAppointment?.startTime || '09:00'}
                  className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Длительность (мин)</label>
              <input
                name="duration"
                type="number"
                min={15}
                step={15}
                defaultValue={editingAppointment?.duration || 60}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Услуга</label>
            <div className="relative">
              <Scissors className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                name="service"
                type="text"
                defaultValue={editingAppointment?.service}
                placeholder="Например: Стрижка"
                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Стоимость</label>
              <input
                name="price"
                type="number"
                min={0}
                defaultValue={editingAppointment?.price || 0}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Статус</label>
              <select
                name="status"
                defaultValue={editingAppointment?.status || 'pending'}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
              >
                <option className="bg-[#111]" value="pending">
                  Ожидание
                </option>
                <option className="bg-[#111]" value="confirmed">
                  Подтверждено
                </option>
                <option className="bg-[#111]" value="cancelled">
                  Отменено
                </option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            {editingAppointment && (
              <Button type="button" variant="danger" onClick={() => setConfirmDeleteId(editingAppointment.id)} className="flex-1">
                Удалить
              </Button>
            )}
            <Button type="submit" className="flex-[2]">
              {editingAppointment ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить запись"
        message="Запись будет удалена без восстановления."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default BookingJournal;
