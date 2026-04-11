import React, { useState } from "react";
import { FileText, Plus, Trash2, Edit2, Package } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import ConfirmDialog from "./ui/ConfirmDialog";

const TechCardsManager = ({ techCards, services, inventory, onUpdateTechCards, ownerUid }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [materials, setMaterials] = useState([]);

  const openNewCard = () => {
    setEditingCard({
      id: "",
      serviceId: "",
      serviceName: "",
      materials: [],
      ownerUid,
    });
    setMaterials([]);
    setIsModalOpen(true);
  };

  const openEditCard = (card) => {
    setEditingCard(card);
    setMaterials(card.materials || []);
    setIsModalOpen(true);
  };

  const addMaterial = () => {
    setMaterials([...materials, { inventoryId: "", quantity: 1 }]);
  };

  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const serviceId = fd.get("serviceId");
    const service = services.find((s) => s.id === serviceId);

    const validMaterials = materials.filter((m) => m.inventoryId && m.quantity > 0);

    const newCard = {
      id: editingCard?.id || Math.random().toString(36).substr(2, 9),
      serviceId,
      serviceName: service?.name || "Неизвестная услуга",
      materials: validMaterials,
      ownerUid,
    };

    if (editingCard?.id) {
      onUpdateTechCards(techCards.map((c) => (c.id === editingCard.id ? newCard : c)));
    } else {
      onUpdateTechCards([...techCards, newCard]);
    }
    setIsModalOpen(false);
    setEditingCard(null);
    setMaterials([]);
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      onUpdateTechCards(techCards.filter((c) => c.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const getInventoryName = (inventoryId) => {
    const item = inventory.find((i) => i.id === inventoryId);
    return item?.name || "Неизвестный товар";
  };

  const calculateTotalCost = (card) => {
    return card.materials.reduce((sum, m) => {
      const item = inventory.find((i) => i.id === m.inventoryId);
      return sum + (item?.price || 0) * m.quantity;
    }, 0);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="header-font text-4xl font-black text-slate-800 mb-2">
            Технологические карты
          </h2>
          <p className="text-slate-600 font-medium">
            Расход материалов на услуги
          </p>
        </div>
        <Button onClick={openNewCard} icon={<Plus size={16} />}>
          Создать техкарту
        </Button>
      </div>

      {techCards.length === 0 ? (
        <div className="glass-panel rounded-[2.5rem] border border-slate-200 p-20 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            Нет технологических карт. Создайте первую карту.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {techCards.map((card) => (
            <div
              key={card.id}
              className="glass-panel rounded-[2rem] border border-slate-200 p-6 hover:bg-orange-50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-800 text-xl mb-1">
                    {card.serviceName}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Расход материалов: {calculateTotalCost(card).toLocaleString()} ₽
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditCard(card)}
                    className="p-2 text-slate-700 hover:text-orange-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(card.id)}
                    className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {card.materials.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm bg-white rounded-lg p-3 border border-slate-200"
                  >
                    <Package size={16} className="text-orange-600" />
                    <span className="font-semibold text-slate-800">
                      {getInventoryName(m.inventoryId)}
                    </span>
                    <span className="text-slate-500">×</span>
                    <span className="font-bold text-slate-700">{m.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
          setMaterials([]);
        }}
        title={editingCard?.id ? "Редактировать техкарту" : "Новая техкарта"}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Услуга
            </label>
            <select
              name="serviceId"
              defaultValue={editingCard?.serviceId || ""}
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-orange-500 outline-none transition-all"
              required
            >
              <option value="" disabled>
                Выберите услугу
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Материалы
              </label>
              <button
                type="button"
                onClick={addMaterial}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <Plus size={14} /> Добавить материал
              </button>
            </div>

            {materials.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Нет материалов. Добавьте материалы для расхода.
              </p>
            ) : (
              <div className="space-y-2">
                {materials.map((material, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <select
                      value={material.inventoryId}
                      onChange={(e) => updateMaterial(idx, "inventoryId", e.target.value)}
                      className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-orange-500 outline-none"
                      required
                    >
                      <option value="">Выберите товар</option>
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} (остаток: {item.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={material.quantity}
                      onChange={(e) => updateMaterial(idx, "quantity", parseInt(e.target.value, 10))}
                      className="w-24 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-orange-500 outline-none"
                      placeholder="Кол-во"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeMaterial(idx)}
                      className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            {editingCard?.id && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setConfirmDeleteId(editingCard.id);
                  setIsModalOpen(false);
                }}
                className="flex-1"
              >
                Удалить
              </Button>
            )}
            <Button type="submit" className="flex-[2]">
              {editingCard?.id ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Удаление техкарты"
        message="Вы уверены, что хотите удалить эту технологическую карту? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default TechCardsManager;
