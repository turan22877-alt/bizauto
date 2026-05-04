import React, { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Trash2,
  History,
  Scissors,
  Package,
  TrendingUp,
  ChevronRight,
  X,
} from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import ConfirmDialog from "./ui/ConfirmDialog";

const ClientManagement = ({ clients, onUpdateClients, ownerUid, appointments = [], sales = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleAddClient = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      visits: 0,
      totalSpent: 0,
      points: 0,
      lastVisit: "-",
      status: "New",
      ownerUid,
    };
    onUpdateClients([newClient, ...clients]);
    setIsModalOpen(false);
  };

  const handleDeleteClient = () => {
    if (confirmDeleteId) {
      onUpdateClients(clients.filter((c) => c.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm),
  );

  // Получение истории клиента
  const getClientHistory = (clientId) => {
    const clientAppointments = appointments
      .filter((a) => a.clientId === clientId && a.status === 'confirmed')
      .map((a) => ({
        type: 'appointment',
        date: a.date,
        name: a.service,
        price: a.price,
        staffId: a.staffId,
      }));

    const clientSales = sales
      .filter((s) => s.clientId === clientId)
      .map((s) => ({
        type: 'sale',
        date: s.date,
        name: s.itemName,
        price: s.total,
        quantity: s.quantity,
        paymentMethod: s.paymentMethod,
      }));

    return [...clientAppointments, ...clientSales].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );
  };

  const getClientStats = (clientId) => {
    const history = getClientHistory(clientId);
    return {
      totalSpent: history.reduce((sum, h) => sum + (h.price || 0), 0),
      visitCount: history.filter((h) => h.type === 'appointment').length,
      purchaseCount: history.filter((h) => h.type === 'sale').length,
      lastVisit: history[0]?.date || '-',
    };
  };

  const openHistory = (client) => {
    setSelectedClient(client);
    setShowHistoryModal(true);
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      cash: 'Наличные',
      card: 'Карта',
      transfer: 'Перевод',
    };
    return methods[method] || method;
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="header-font text-4xl font-black text-slate-800 mb-2">
            Клиенты
          </h2>
          <p className="text-slate-600 font-medium">
            Управление базой клиентов и историей взаимодействий
          </p>
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
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Клиент
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Контакты
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">
                  Визиты
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">
                  Покупки
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">
                  Потрачено
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Последний визит
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Статус
                </th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const stats = getClientStats(client.id);
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-orange-50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-600 font-black text-lg">
                            {client.name.charAt(0)}
                          </div>
                          <span className="font-black text-slate-800 tracking-tight">
                            {client.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Phone size={12} className="text-orange-600" />{" "}
                            {client.phone}
                          </div>
                          {client.email && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                              <Mail size={12} /> {client.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-xs font-black text-blue-600 bg-blue-500/10 px-3 py-1 rounded-lg">
                          {stats.visitCount}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-xs font-black text-purple-600 bg-purple-500/10 px-3 py-1 rounded-lg">
                          {stats.purchaseCount}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-bold text-orange-600">
                          {stats.totalSpent.toLocaleString()} ₽
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Calendar size={14} className="text-slate-500" />{" "}
                          {stats.lastVisit}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            client.status === "VIP"
                              ? "bg-amber-500/20 text-amber-500"
                              : client.status === "Active"
                                ? "bg-orange-500/20 text-orange-500"
                                : client.status === "New"
                                  ? "bg-orange-500/15 text-orange-600"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openHistory(client)}
                            className="p-2 text-slate-700 hover:text-orange-600 transition-all"
                            title="История клиента"
                          >
                            <History size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(client.id)}
                            className="p-2 text-slate-700 hover:text-rose-500 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-8 py-20 text-center text-slate-500 uppercase font-black tracking-widest opacity-20"
                  >
                    База клиентов пуста
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Новый клиент"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleAddClient} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Имя и фамилия
            </label>
            <input
              name="name"
              type="text"
              placeholder="Иван Иванов"
              className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500/50 transition-all"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Телефон
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="+7 (900) 000-00-00"
              className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500/50 transition-all"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Email (опционально)
            </label>
            <input
              name="email"
              type="email"
              placeholder="client@example.com"
              className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
          <Button type="submit" className="w-full py-5 mt-4">
            Добавить в базу
          </Button>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedClient(null);
        }}
        title={selectedClient ? `История: ${selectedClient.name}` : "История клиента"}
        maxWidth="max-w-3xl"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Client Stats */}
            <div className="grid grid-cols-3 gap-4">
              {(() => {
                const stats = getClientStats(selectedClient.id);
                return (
                  <>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">Всего потрачено</p>
                      <p className="text-2xl font-black text-orange-600">
                        {stats.totalSpent.toLocaleString()} ₽
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">Визитов</p>
                      <p className="text-2xl font-black text-blue-600">{stats.visitCount}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">Покупок</p>
                      <p className="text-2xl font-black text-purple-600">{stats.purchaseCount}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* History List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {(() => {
                const history = getClientHistory(selectedClient.id);
                if (history.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400">
                      <History size={48} className="mx-auto mb-3 opacity-30" />
                      <p>Нет записей в истории</p>
                    </div>
                  );
                }
                return history.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.type === 'appointment' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {item.type === 'appointment' ? <Scissors size={20} /> : <Package size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {item.date}
                        </span>
                        {item.type === 'sale' && item.quantity && (
                          <span>× {item.quantity}</span>
                        )}
                        {item.type === 'sale' && item.paymentMethod && (
                          <span className="text-purple-600">
                            {getPaymentMethodName(item.paymentMethod)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{item.price?.toLocaleString()} ₽</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.type === 'appointment' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {item.type === 'appointment' ? 'Услуга' : 'Товар'}
                      </span>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}
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
