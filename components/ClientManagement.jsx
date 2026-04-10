import React, { useState } from 'react';
import { Search, UserPlus, MoreVertical, Mail, Phone, Calendar, X, Trash2 } from 'lucide-react';
// Client type removed - using plain objects
import Modal from './ui/Modal';
import Button from './ui/Button';
import ConfirmDialog from './ui/ConfirmDialog';

const ClientManagement = ({ clients, onUpdateClients, ownerUid }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAddClient = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      visits: 0,
      totalSpent: 0,
      points: 0,
      lastVisit: '-',
      status: 'New',
      ownerUid
    };
    onUpdateClients([newClient, ...clients]);
    setIsModalOpen(false);
  };

  const handleDeleteClient = () => {
    if (confirmDeleteId) {
      onUpdateClients(clients.filter(c => c.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="header-font text-4xl font-black text-slate-800 mb-2">Клиенты</h2>
          <p className="text-slate-600 font-medium">Управление базой клиентов и историей взаимодействий</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<UserPlus size={16} />}
        >
          Новый клиент
        </Button>
      </div>

      <div className="glass-panel p-6 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Поиск по имени или телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="glass-panel rounded-[2.5rem] border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Клиент</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Контакты</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Визиты</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Последний визит</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Статус</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-orange-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-600 font-black text-lg">
                        {client.name.charAt(0)}
                      </div>
                      <span className="font-black text-slate-800 tracking-tight">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Phone size={12} className="text-orange-600" /> {client.phone}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                        <Mail size={12} /> {client.email || '—'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-black text-orange-600 bg-orange-500/10 px-3 py-1 rounded-lg">{client.visits}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar size={14} className="text-slate-500" /> {client.lastVisit}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      client.status === 'VIP' ? 'bg-amber-500/20 text-amber-500' :
                      client.status === 'Active' ? 'bg-orange-500/20 text-orange-500' :
                      client.status === 'New' ? 'bg-orange-500/15 text-orange-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => setConfirmDeleteId(client.id)}
                      className="p-2 text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-500 uppercase font-black tracking-widest opacity-20">База клиентов пуста</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Новый клиент"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleAddClient} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Имя и фамилия</label>
            <input name="name" type="text" placeholder="Иван Иванов" className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500/50 transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Телефон</label>
            <input name="phone" type="tel" placeholder="+7 (900) 000-00-00" className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500/50 transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Email (опционально)</label>
            <input name="email" type="email" placeholder="client@example.com" className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500/50 transition-all" />
          </div>
          <Button type="submit" className="w-full py-5 mt-4">
            Добавить в базу
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteClient}
        title="Удаление клиента"
        message="Вы уверены, что хотите удалить этого клиента из базы данных? Это действие необратимо."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default ClientManagement;