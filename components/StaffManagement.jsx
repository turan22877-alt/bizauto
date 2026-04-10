import React, { useState } from 'react';
import { UserPlus, Briefcase, Trash2, ShieldCheck, X } from 'lucide-react';
// Staff type removed - using plain objects
import Modal from './ui/Modal';
import Button from './ui/Button';
import ConfirmDialog from './ui/ConfirmDialog';

const StaffManagement = ({ staff, onUpdateStaff, ownerUid }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAddStaff = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStaff = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name'),
      role: formData.get('role'),
      specialization: formData.get('specialization'),
      baseSalary: parseInt(String(formData.get('baseSalary') || '0'), 10) || 0,
      commissionPercent: Math.min(100, Math.max(0, parseInt(String(formData.get('commissionPercent') || '0'), 10) || 0)),
      ownerUid,
    };
    onUpdateStaff([...staff, newStaff]);
    setIsModalOpen(false);
  };

  const handleDeleteStaff = () => {
    if (confirmDeleteId) {
      onUpdateStaff(staff.filter(s => s.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="header-font text-4xl font-black text-slate-800 mb-2">Команда</h2>
          <p className="text-slate-600 font-medium">Команда специалистов высочайшего класса</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<UserPlus size={16} />}
        >
          Нанять специалиста
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.length > 0 ? staff.map((member) => (
          <div key={member.id} className="glass-panel p-8 rounded-[2.5rem] border border-slate-200 relative group hover:border-orange-500/30 transition-all">
            <button
              onClick={() => setConfirmDeleteId(member.id)}
              className="absolute top-6 right-6 p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-[1.25rem] bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-600 font-black text-2xl">
                {member.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-xl text-slate-800 tracking-tight">{member.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck size={12} className="text-orange-600" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{member.role}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold uppercase">Специализация:</span>
                <span className="font-black text-slate-800 uppercase tracking-tighter">{member.specialization}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold uppercase">Оклад / %</span>
                <span className="font-black text-slate-700">
                  {(member.baseSalary ?? 0).toLocaleString()} ₽ · {member.commissionPercent ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold uppercase">Статус:</span>
                <span className="text-orange-500 font-black uppercase tracking-widest text-[9px]">В сети</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="lg:col-span-3 py-32 text-center opacity-20">
             <UserPlus size={64} className="mx-auto mb-6" />
             <p className="header-font text-xl font-bold uppercase tracking-[0.4em]">Команда пуста</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Нанять специалиста"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleAddStaff} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Полное имя</label>
            <input name="name" type="text" className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:border-orange-500 transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Должность</label>
            <select name="role" className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:border-orange-500 transition-all appearance-none" required>
              <option className="bg-white" value="Ведущий специалист">Ведущий специалист</option>
              <option className="bg-white" value="Специалист">Специалист</option>
              <option className="bg-white" value="Менеджер">Менеджер</option>
              <option className="bg-white" value="Младший специалист">Младший специалист</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Специализация</label>
            <input name="specialization" type="text" className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:border-orange-500 transition-all" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Оклад (₽)</label>
              <input name="baseSalary" type="number" min={0} step={1000} defaultValue={0} className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:border-orange-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Комиссия (%)</label>
              <input name="commissionPercent" type="number" min={0} max={100} step={1} defaultValue={0} className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:border-orange-500 transition-all" />
            </div>
          </div>
          <Button type="submit" className="w-full py-5 mt-4">
            Подписать контракт
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteStaff}
        title="Увольнение сотрудника"
        message="Вы уверены, что хотите освободить сотрудника от должности? Это действие удалит специалиста из системы."
        confirmText="Уволить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default StaffManagement;