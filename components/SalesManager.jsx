import React, { useState, useMemo } from "react";
import { ShoppingCart, Plus, Trash2, Edit2, CreditCard, Banknote, Smartphone, Package, Scissors, TrendingUp, Calendar, User } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import ConfirmDialog from "./ui/ConfirmDialog";

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Наличные', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'card', name: 'Карта', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'transfer', name: 'Перевод', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const SALE_TYPES = [
  { id: 'service', name: 'Услуга', icon: Scissors },
  { id: 'product', name: 'Товар', icon: Package },
];

const SalesManager = ({ sales, onUpdateSales, services, inventory, clients, staff, ownerUid }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const openNewSale = () => {
    setEditingSale({
      id: "",
      type: "service",
      itemId: "",
      itemName: "",
      clientId: "",
      clientName: "",
      staffId: "",
      staffName: "",
      quantity: 1,
      price: 0,
      total: 0,
      paymentMethod: "cash",
      date: new Date().toISOString().split('T')[0],
      notes: "",
      ownerUid,
    });
    setIsModalOpen(true);
  };

  const openEditSale = (sale) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = fd.get("type");
    const itemId = fd.get("itemId");
    const clientId = fd.get("clientId");
    const staffId = fd.get("staffId");
    const quantity = parseInt(fd.get("quantity"), 10);
    const price = parseInt(fd.get("price"), 10);

    let itemName = "";
    if (type === "service") {
      const service = services?.find((s) => s.id === itemId);
      itemName = service?.name || fd.get("itemName") || "Услуга";
    } else {
      const product = inventory?.find((i) => i.id === itemId);
      itemName = product?.name || fd.get("itemName") || "Товар";
    }

    const client = clients?.find((c) => c.id === clientId);
    const staffMember = staff?.find((s) => s.id === staffId);

    const newSale = {
      id: editingSale?.id || Math.random().toString(36).substr(2, 9),
      type,
      itemId,
      itemName,
      clientId,
      clientName: client?.name || fd.get("clientName") || "",
      staffId,
      staffName: staffMember?.name || "",
      quantity,
      price,
      total: quantity * price,
      paymentMethod: fd.get("paymentMethod"),
      date: fd.get("date"),
      notes: fd.get("notes") || "",
      ownerUid,
    };

    if (editingSale?.id) {
      onUpdateSales(sales.map((s) => (s.id === editingSale.id ? newSale : s)));
    } else {
      onUpdateSales([newSale, ...sales]);
    }
    setIsModalOpen(false);
    setEditingSale(null);
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      onUpdateSales(sales.filter((s) => s.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const filteredSales = useMemo(() => {
    let filtered = [...sales];

    if (filterType !== 'all') {
      filtered = filtered.filter((s) => s.type === filterType);
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentMonth = today.slice(0, 7);

      switch (filterPeriod) {
        case 'today':
          filtered = filtered.filter((s) => s.date === today);
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          filtered = filtered.filter((s) => s.date >= weekAgo);
          break;
        case 'month':
          filtered = filtered.filter((s) => s.date.startsWith(currentMonth));
          break;
      }
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sales, filterType, filterPeriod]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const serviceRevenue = filteredSales.filter((s) => s.type === 'service').reduce((sum, s) => sum + s.total, 0);
    const productRevenue = filteredSales.filter((s) => s.type === 'product').reduce((sum, s) => sum + s.total, 0);

    const byPaymentMethod = {};
    filteredSales.forEach((s) => {
      byPaymentMethod[s.paymentMethod] = (byPaymentMethod[s.paymentMethod] || 0) + s.total;
    });

    return {
      totalRevenue,
      serviceRevenue,
      productRevenue,
      count: filteredSales.length,
      byPaymentMethod,
    };
  }, [filteredSales]);

  const getPaymentMethodIcon = (methodId) => {
    const method = PAYMENT_METHODS.find((m) => m.id === methodId);
    return method ? method.icon : CreditCard;
  };

  const getPaymentMethodName = (methodId) => {
    const method = PAYMENT_METHODS.find((m) => m.id === methodId);
    return method ? method.name : methodId;
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="header-font text-4xl font-black text-slate-800 mb-2">
            Продажи
          </h2>
          <p className="text-slate-600 font-medium">
            Учёт продаж услуг и товаров с способами оплаты
          </p>
        </div>
        <Button onClick={openNewSale} icon={<Plus size={16} />}>
          Новая продажа
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500">Выручка</span>
          </div>
          <p className="text-xl font-black text-slate-800">{stats.totalRevenue.toLocaleString()} ₽</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Scissors size={16} className="text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500">Услуги</span>
          </div>
          <p className="text-xl font-black text-slate-800">{stats.serviceRevenue.toLocaleString()} ₽</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Package size={16} className="text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500">Товары</span>
          </div>
          <p className="text-xl font-black text-slate-800">{stats.productRevenue.toLocaleString()} ₽</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <ShoppingCart size={16} className="text-green-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500">Кол-во</span>
          </div>
          <p className="text-xl font-black text-slate-800">{stats.count}</p>
        </div>
      </div>

      {/* Payment Methods Stats */}
      {Object.keys(stats.byPaymentMethod).length > 0 && (
        <div className="glass-panel rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">По способам оплаты</h3>
          <div className="flex flex-wrap gap-4">
            {PAYMENT_METHODS.map((method) => {
              const amount = stats.byPaymentMethod[method.id] || 0;
              if (amount === 0) return null;
              return (
                <div key={method.id} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${method.bg}`}>
                  <method.icon size={16} className={method.color} />
                  <span className={`font-semibold ${method.color}`}>{method.name}: {amount.toLocaleString()} ₽</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-orange-500"
        >
          <option value="all">Все типы</option>
          <option value="service">Услуги</option>
          <option value="product">Товары</option>
        </select>
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-orange-500"
        >
          <option value="all">Весь период</option>
          <option value="today">Сегодня</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
        </select>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <div className="glass-panel rounded-[2.5rem] border border-slate-200 p-20 text-center">
          <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            Нет продаж. Создайте первую продажу.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-[2rem] border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Дата</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Тип</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Наименование</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Клиент</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Сотрудник</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Кол-во</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Сумма</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Оплата</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSales.map((sale) => {
                  const PaymentIcon = getPaymentMethodIcon(sale.paymentMethod);
                  const SaleTypeIcon = sale.type === 'service' ? Scissors : Package;
                  return (
                    <tr key={sale.id} className="hover:bg-orange-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Calendar size={14} className="text-slate-400" />
                          {sale.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${sale.type === 'service' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          <SaleTypeIcon size={12} />
                          <span className="text-xs font-semibold">{sale.type === 'service' ? 'Услуга' : 'Товар'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{sale.itemName}</td>
                      <td className="px-6 py-4">
                        {sale.clientName ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <User size={14} className="text-slate-400" />
                            {sale.clientName}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{sale.staffName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{sale.quantity}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-orange-600">{sale.total.toLocaleString()} ₽</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <PaymentIcon size={14} className="text-slate-400" />
                          <span className="text-xs text-slate-600">{getPaymentMethodName(sale.paymentMethod)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditSale(sale)}
                            className="p-2 text-slate-700 hover:text-orange-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(sale.id)}
                            className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSale(null);
        }}
        title={editingSale?.id ? "Изменить продажу" : "Новая продажа"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Тип</label>
              <select
                name="type"
                defaultValue={editingSale?.type || "service"}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
              >
                <option value="service">Услуга</option>
                <option value="product">Товар</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Дата</label>
              <input
                name="date"
                type="date"
                defaultValue={editingSale?.date || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Наименование</label>
            {editingSale?.type === 'service' && services?.length > 0 ? (
              <select
                name="itemId"
                defaultValue={editingSale?.itemId || ""}
                onChange={(e) => {
                  const service = services.find((s) => s.id === e.target.value);
                  if (service) {
                    const priceInput = e.target.form.querySelector('input[name="price"]');
                    if (priceInput) priceInput.value = service.price;
                  }
                }}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
              >
                <option value="">Выберите услугу</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.price} ₽
                  </option>
                ))}
              </select>
            ) : editingSale?.type === 'product' && inventory?.length > 0 ? (
              <select
                name="itemId"
                defaultValue={editingSale?.itemId || ""}
                onChange={(e) => {
                  const product = inventory.find((i) => i.id === e.target.value);
                  if (product) {
                    const priceInput = e.target.form.querySelector('input[name="price"]');
                    if (priceInput) priceInput.value = product.price;
                  }
                }}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
              >
                <option value="">Выберите товар</option>
                {inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} - {i.price} ₽ (остаток: {i.stock})
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="itemName"
                type="text"
                defaultValue={editingSale?.itemName || ""}
                placeholder="Наименование"
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Клиент (необязательно)</label>
              <select
                name="clientId"
                defaultValue={editingSale?.clientId || ""}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
              >
                <option value="">Без клиента</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Сотрудник (необязательно)</label>
              <select
                name="staffId"
                defaultValue={editingSale?.staffId || ""}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
              >
                <option value="">Не выбран</option>
                {staff?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Количество</label>
              <input
                name="quantity"
                type="number"
                min={1}
                defaultValue={editingSale?.quantity || 1}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Цена (₽)</label>
              <input
                name="price"
                type="number"
                min={0}
                defaultValue={editingSale?.price || 0}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Способ оплаты</label>
              <select
                name="paymentMethod"
                defaultValue={editingSale?.paymentMethod || "cash"}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Примечания</label>
            <textarea
              name="notes"
              defaultValue={editingSale?.notes || ""}
              placeholder="Дополнительная информация..."
              rows={2}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            {editingSale?.id && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setConfirmDeleteId(editingSale.id);
                  setIsModalOpen(false);
                }}
                className="flex-1"
              >
                Удалить
              </Button>
            )}
            <Button type="submit" className="flex-[2]">
              {editingSale?.id ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Удаление продажи"
        message="Вы уверены, что хотите удалить эту продажу?"
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default SalesManager;
