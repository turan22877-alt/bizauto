import React, { useState } from 'react';
// Product type removed - using plain objects
import { Package, Plus, Trash2, X } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import ConfirmDialog from './ui/ConfirmDialog';

const InventoryManager = ({ inventory, onUpdateInventory, ownerUid }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: fd.get('name'),
      stock: parseInt(fd.get('stock')),
      price: parseInt(fd.get('price')),
      category: fd.get('category'),
      ownerUid
    };
    onUpdateInventory([...inventory, newItem]);
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (confirmDeleteId) {
      onUpdateInventory(inventory.filter(i => i.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-10">
       <div className="flex justify-between items-end">
          <div>
            <h2 className="header-font text-4xl font-black text-slate-800 mb-2">Склад</h2>
            <p className="text-slate-600 font-medium">Управление запасами и ресурсами предприятия</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Поступление
          </Button>
        </div>

        <div className="glass-panel rounded-[2.5rem] border border-slate-200 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-100">
                 <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-600 tracking-widest">Наименование</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-600 tracking-widest">Категория</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-600 tracking-widest text-center">Остаток</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-600 tracking-widest">Стоимость</th>
                    <th className="px-8 py-5"></th>
                 </tr>
              </thead>
<tbody className="divide-y divide-slate-200">
                 {inventory.length > 0 ? inventory.map(item => (
                   <tr key={item.id} className="hover:bg-orange-50 transition-colors group">
                      <td className="px-8 py-6 font-black text-slate-800 tracking-tight">{item.name}</td>
                       <td className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.category}</td>
                      <td className="px-8 py-6 text-center">
                          <span className={`font-black px-3 py-1 rounded-lg ${item.stock < 5 ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-orange-500/10 text-orange-600'}`}>
                           {item.stock}
                         </span>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-800">{item.price.toLocaleString()} ₽</td>
                      <td className="px-8 py-6 text-right">
                         <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-2 text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                         >
                          <Trash2 size={18}/>
                         </button>
                      </td>
                   </tr>
                 )) : (
                   <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500 uppercase font-black tracking-widest opacity-20">Склад пуст</td></tr>
                 )}
              </tbody>
           </table>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Новый товар"
          maxWidth="max-w-3xl"
        >
           <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Название</label>
                <input name="name" type="text" className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-orange-500 outline-none transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Остаток</label>
                    <input name="stock" type="number" className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:border-orange-500 transition-all" required />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Цена</label>
                    <input name="price" type="number" className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:border-orange-500 transition-all" required />
                 </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Категория</label>
                <input name="category" type="text" className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-orange-500 outline-none transition-all" required />
              </div>
              <Button type="submit" className="w-full py-5 mt-4">
                Оприходовать
              </Button>
           </form>
        </Modal>

        <ConfirmDialog
          isOpen={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={handleDeleteItem}
          title="Удаление товара"
          message="Вы уверены, что хотите удалить этот товар из инвентаря? Это действие нельзя отменить."
          confirmText="Удалить"
          cancelText="Отмена"
        />
    </div>
  );
};

export default InventoryManager;