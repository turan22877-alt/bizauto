
import React, { useState } from 'react';
import { Search, UserPlus, MoreVertical, Mail, Phone, Calendar, X, Trash2 } from 'lucide-react';
import { Client } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import ConfirmDialog from './ui/ConfirmDialog';

interface ClientManagementProps {
  clients: Client[];
  onUpdateClients: (clients: Client[]) => void;
  ownerUid: string;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ clients, onUpdateClients, ownerUid }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
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
          <h2 className="header-font text-4xl font-black text-white mb-2">Client Database</h2>
          <p className="text-slate-500 font-medium">Управление базой клиентов и историей взаимодействий</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          icon={<UserPlus size={16} />}
        >
          Новый клиент
        </Button>
      </div>

      <div className="glass-panel p-6 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по имени или телефону..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="glass-panel rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Клиент</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Контакты</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Визиты</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Последний визит</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Статус</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 font-black text-lg">
                        {client.name.charAt(0)}
                      </div>
                      <span className="font-black text-white tracking-tight">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Phone size={12} className="text-blue-500" /> {client.phone}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <Mail size={12} /> {client.email || '—'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg">{client.visits}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar size={14} className="text-slate-600" /> {client.lastVisit}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      client.status === 'VIP' ? 'bg-amber-500/20 text-amber-500' :
                      client.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' :
                      client.status === 'New' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-white/5 text-slate-500'
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
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-600 uppercase font-black tracking-widest opacity-20">База клиентов пуста</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Contract New Client"
      >
        <form onSubmit={handleAddClient} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Имя и фамилия</label>
            <input name="name" type="text" placeholder="Иван Иванов" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Телефон</label>
            <input name="phone" type="tel" placeholder="+7 (900) 000-00-00" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email (опционально)</label>
            <input name="email" type="email" placeholder="client@example.com" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all" />
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
        title="Terminate Relationship"
        message="Вы уверены, что хотите удалить этого клиента из базы данных? Это действие необратимо."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default ClientManagement;
