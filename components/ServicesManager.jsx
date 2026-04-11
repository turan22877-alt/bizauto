import React, { useState } from "react";
import { Scissors, Plus, Trash2, Edit2 } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import ConfirmDialog from "./ui/ConfirmDialog";

const ServicesManager = ({ services, onUpdateServices, ownerUid }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const openNewService = () => {
    setEditingService({
      id: "",
      name: "",
      duration: 60,
      price: 0,
      category: "",
      description: "",
      ownerUid,
    });
    setIsModalOpen(true);
  };

  const openEditService = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newService = {
      id: editingService?.id || Math.random().toString(36).substr(2, 9),
      name: fd.get("name"),
      duration: parseInt(fd.get("duration"), 10),
      price: parseInt(fd.get("price"), 10),
      category: fd.get("category"),
      description: fd.get("description") || "",
      ownerUid,
    };

    if (editingService?.id) {
      onUpdateServices(
        services.map((s) => (s.id === editingService.id ? newService : s))
      );
    } else {
      onUpdateServices([...services, newService]);
    }
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      onUpdateServices(services.filter((s) => s.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    const cat = service.category || "Без категории";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="header-font text-4xl font-black text-slate-800 mb-2">
            Виды услуг
          </h2>
          <p className="text-slate-600 font-medium">
            Управление каталогом услуг и их стоимостью
          </p>
        </div>
        <Button onClick={openNewService} icon={<Plus size={16} />}>
          Добавить услугу
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="glass-panel rounded-[2.5rem] border border-slate-200 p-20 text-center">
          <Scissors size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            Нет добавленных услуг. Создайте первую услугу.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedServices).map(([category, items]) => (
            <div
              key={category}
              className="glass-panel rounded-[2rem] border border-slate-200 overflow-hidden"
            >
              <div className="bg-slate-100 px-8 py-4">
                <h3 className="text-xs font-black uppercase text-slate-600 tracking-widest">
                  {category}
                </h3>
              </div>
              <div className="divide-y divide-slate-200">
                {items.map((service) => (
                  <div
                    key={service.id}
                    className="px-8 py-6 hover:bg-orange-50 transition-colors group flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-slate-800 text-lg">
                          {service.name}
                        </h4>
                        <span className="text-xs font-semibold text-slate-500">
                          {service.duration} мин
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-sm text-slate-600 mb-2">
                          {service.description}
                        </p>
                      )}
                      <p className="text-lg font-black text-orange-600">
                        {service.price.toLocaleString()} ₽
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditService(service)}
                        className="p-2 text-slate-700 hover:text-orange-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(service.id)}
                        className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
          setEditingService(null);
        }}
        title={editingService?.id ? "Редактировать услугу" : "Новая услуга"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Название услуги
            </label>
            <input
              name="name"
              type="text"
              defaultValue={editingService?.name || ""}
              placeholder="Например: Стрижка мужская"
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-orange-500 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Категория
            </label>
            <input
              name="category"
              type="text"
              defaultValue={editingService?.category || ""}
              placeholder="Например: Парикмахерские услуги"
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-orange-500 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Длительность (мин)
              </label>
              <input
                name="duration"
                type="number"
                min={15}
                step={15}
                defaultValue={editingService?.duration || 60}
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:border-orange-500 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Стоимость (₽)
              </label>
              <input
                name="price"
                type="number"
                min={0}
                defaultValue={editingService?.price || 0}
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:border-orange-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Описание (необязательно)
            </label>
            <textarea
              name="description"
              defaultValue={editingService?.description || ""}
              placeholder="Краткое описание услуги"
              rows={3}
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:border-orange-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            {editingService?.id && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setConfirmDeleteId(editingService.id);
                  setIsModalOpen(false);
                }}
                className="flex-1"
              >
                Удалить
              </Button>
            )}
            <Button type="submit" className="flex-[2]">
              {editingService?.id ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Удаление услуги"
        message="Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default ServicesManager;
