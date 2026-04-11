import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Scissors,
  CalendarDays,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GripVertical,
  Bell,
} from "lucide-react";
// Types removed - using plain objects
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import ConfirmDialog from "./ui/ConfirmDialog";
import { formatYMD, addDaysYMD, labelRuFromYMD } from "../utils/dateYmd";
import { checkUpcomingAppointments } from "../utils/notifications";

const BookingJournal = ({
  appointments,
  staff,
  clients,
  onUpdateAppointments,
  ownerUid,
  focusRequest,
  onFocusConsumed,
  services,
  techCards,
  inventory,
  onUpdateInventory,
}) => {
  const todayYmd = formatYMD(new Date());
  const [viewDate, setViewDate] = useState(todayYmd);
  const [viewMode, setViewMode] = useState("day");
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [draggedAppointment, setDraggedAppointment] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const gridRef = useRef(null);
  const [upcomingNotifications, setUpcomingNotifications] = useState([]);

  // Проверка предстоящих записей каждую минуту
  useEffect(() => {
    const checkNotifications = () => {
      const upcoming = checkUpcomingAppointments(appointments);
      setUpcomingNotifications(upcoming);
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000); // каждую минуту

    return () => clearInterval(interval);
  }, [appointments]);

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

  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) dates.push(addDaysYMD(viewDate, i));
    return dates;
  }, [viewDate]);

  const monthDates = useMemo(() => {
    const [y, m] = viewDate.split("-").map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const dates = [];
    for (
      let i = -startDay;
      i <
      lastDay.getDate() +
        ((7 - ((lastDay.getDay() === 0 ? 6 : lastDay.getDay() - 1) + 1)) % 7);
      i++
    ) {
      dates.push(formatYMD(new Date(y, m - 1, 1 + i)));
    }
    return dates;
  }, [viewDate]);

  const monthWeeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < monthDates.length; i += 7)
      weeks.push(monthDates.slice(i, i + 7));
    return weeks;
  }, [monthDates]);

  const monthName = useMemo(() => {
    const [y, m] = viewDate.split("-").map(Number);
    const months = [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ];
    return `${months[m - 1]} ${y}`;
  }, [viewDate]);

  const dayOfWeekShort = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const staffAppointments = useMemo(() => {
    const datesToShow =
      viewMode === "week"
        ? weekDates
        : viewMode === "month"
          ? monthDates
          : [viewDate];

    console.log("Filtering appointments:", {
      total: appointments.length,
      selectedStaffId,
      datesToShow,
      viewMode,
      sampleAppointment: appointments[0]
    });

    let filtered = appointments.filter((a) => {
      const staffMatch = a.staffId === selectedStaffId;
      const dateMatch = datesToShow.includes(a.date);

      if (!dateMatch && appointments.length > 0) {
        console.log("Date mismatch:", {
          appointmentDate: a.date,
          datesToShow,
          includes: datesToShow.includes(a.date)
        });
      }

      return staffMatch && dateMatch;
    });

    console.log("Filtered appointments:", filtered.length);

    if (statusFilter !== "all")
      filtered = filtered.filter((a) => a.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.clientName.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q),
      );
    }

    console.log("Final filtered appointments:", filtered);

    return filtered;
  }, [
    appointments,
    selectedStaffId,
    viewDate,
    viewMode,
    weekDates,
    monthDates,
    statusFilter,
    searchQuery,
  ]);

  const dayStats = useMemo(() => {
    const dayApps = appointments.filter(
      (a) => a.date === viewDate && a.staffId === selectedStaffId,
    );
    const confirmed = dayApps.filter((a) => a.status === "confirmed");
    return {
      total: dayApps.length,
      confirmed: confirmed.length,
      revenue: confirmed.reduce((s, a) => s + a.price, 0),
      occupancy: Math.round(
        (dayApps.reduce((s, a) => s + a.duration / 30, 0) /
          (hours.length * 2)) *
          100,
      ),
    };
  }, [appointments, viewDate, selectedStaffId, hours.length]);

  const monthStats = useMemo(() => {
    const monthApps = appointments.filter(
      (a) =>
        a.staffId === selectedStaffId &&
        a.date.startsWith(viewDate.slice(0, 7)),
    );
    const confirmed = monthApps.filter((a) => a.status === "confirmed");
    return {
      total: monthApps.length,
      confirmed: confirmed.length,
      revenue: confirmed.reduce((s, a) => s + a.price, 0),
    };
  }, [appointments, viewDate, selectedStaffId]);

  const getAppointmentsForDate = (date) =>
    staffAppointments.filter((a) => a.date === date);

  const openNewAppointment = (date, time) => {
    setEditingAppointment({
      id: "",
      clientId: "",
      clientName: "",
      staffId: selectedStaffId,
      service: "",
      serviceId: "",
      startTime: time || "10:00",
      date: date || viewDate,
      duration: 60,
      status: "pending",
      price: 0,
      ownerUid,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serviceId = formData.get("serviceId");
    const service = services?.find((s) => s.id === serviceId);
    const manualService = formData.get("service");
    const dateValue = formData.get("date");

    console.log("Saving appointment:", {
      serviceId,
      service,
      manualService,
      dateValue,
      viewDate,
      todayYmd
    });

    const newApp = {
      id: editingAppointment?.id || Math.random().toString(36).substr(2, 9),
      clientId: formData.get("clientId"),
      clientName:
        clients.find((c) => c.id === formData.get("clientId"))?.name ||
        "Неизвестный клиент",
      staffId: selectedStaffId,
      service: service?.name || manualService || "Услуга",
      serviceId: serviceId || "",
      startTime: formData.get("startTime"),
      date: dateValue || viewDate,
      duration: parseInt(formData.get("duration"), 10),
      status: formData.get("status"),
      price: parseInt(formData.get("price"), 10),
      ownerUid,
    };

    console.log("New appointment:", newApp);
    console.log("Current appointments:", appointments.length);
    console.log("Editing?", !!editingAppointment);

    // Списание материалов по техкарте при подтверждении записи
    if (newApp.status === "confirmed" && serviceId && techCards && inventory && onUpdateInventory) {
      const techCard = techCards.find((tc) => tc.serviceId === serviceId);
      if (techCard && techCard.materials.length > 0) {
        const updatedInventory = inventory.map((item) => {
          const material = techCard.materials.find((m) => m.inventoryId === item.id);
          if (material) {
            return { ...item, stock: Math.max(0, item.stock - material.quantity) };
          }
          return item;
        });
        onUpdateInventory(updatedInventory);
      }
    }

    if (editingAppointment?.id) {
      const updated = appointments.map((a) => (a.id === editingAppointment.id ? newApp : a));
      console.log("Updating existing appointment, new count:", updated.length);
      onUpdateAppointments(updated);
    } else {
      const updated = [...appointments, newApp];
      console.log("Adding new appointment, new count:", updated.length);
      onUpdateAppointments(updated);
    }
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      onUpdateAppointments(
        appointments.filter((a) => a.id !== confirmDeleteId),
      );
      setConfirmDeleteId(null);
      setIsModalOpen(false);
      setEditingAppointment(null);
    }
  };

  const handleQuickStatus = (appId, newStatus) => {
    onUpdateAppointments(
      appointments.map((a) =>
        a.id === appId ? { ...a, status: newStatus } : a,
      ),
    );
  };

  const getSlotPosition = (time) => {
    const [h, m] = time.split(":").map(Number);
    return (h - 9) * 80 + (m / 60) * 80;
  };

  const handleSlotClick = (time) => openNewAppointment(viewDate, time);

  const handleDragStart = (app) => setDraggedAppointment(app);
  const handleDrop = (time, date) => {
    if (!draggedAppointment) return;
    onUpdateAppointments(
      appointments.map((a) =>
        a.id === draggedAppointment.id ? { ...a, startTime: time, date } : a,
      ),
    );
    setDraggedAppointment(null);
  };

  const goPrev = () => {
    if (viewMode === "month") {
      setViewDate((d) => {
        const [y, m] = d.split("-").map(Number);
        const nm = m === 1 ? 12 : m - 1;
        const ny = m === 1 ? y - 1 : y;
        return `${ny}-${String(nm).padStart(2, "0")}-01`;
      });
    } else setViewDate((d) => addDaysYMD(d, -1));
  };

  const goNext = () => {
    if (viewMode === "month") {
      setViewDate((d) => {
        const [y, m] = d.split("-").map(Number);
        const nm = m === 12 ? 1 : m + 1;
        const ny = m === 12 ? y + 1 : y;
        return `${ny}-${String(nm).padStart(2, "0")}-01`;
      });
    } else setViewDate((d) => addDaysYMD(d, 1));
  };

  const statusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 size={12} />;
      case "cancelled":
        return <XCircle size={12} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  const statusColors = {
    confirmed: "bg-orange-50 border-orange-400 text-orange-700",
    pending: "bg-amber-50 border-amber-400 text-amber-700",
    cancelled: "bg-stone-100 border-stone-300 text-stone-500",
  };

  const statusDot = {
    confirmed: "bg-orange-500",
    pending: "bg-amber-500",
    cancelled: "bg-stone-400",
  };

  return (
    <div className="space-y-6">
      {/* Уведомления о предстоящих записях */}
      {upcomingNotifications.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <Bell className="text-orange-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-bold text-orange-800 mb-2">
                Предстоящие записи ({upcomingNotifications.length})
              </h3>
              <div className="space-y-1">
                {upcomingNotifications.map((app) => (
                  <div
                    key={app.id}
                    className="text-sm text-orange-700 cursor-pointer hover:text-orange-900"
                    onClick={() => {
                      setEditingAppointment(app);
                      setIsModalOpen(true);
                    }}
                  >
                    <span className="font-semibold">{app.startTime}</span> -{" "}
                    {app.clientName} - {app.service}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date navigation */}
          <div className="flex items-center bg-white rounded-lg border border-stone-200 shadow-sm">
            <button
              onClick={goPrev}
              className="p-2 hover:bg-stone-50 text-stone-500 hover:text-stone-700 rounded-l-lg transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 text-sm font-bold text-stone-800 min-w-[140px] text-center">
              {viewMode === "month" ? monthName : labelRuFromYMD(viewDate)}
            </span>
            <button
              onClick={goNext}
              className="p-2 hover:bg-stone-50 text-stone-500 hover:text-stone-700 rounded-r-lg transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {viewDate !== todayYmd && (
            <button
              onClick={() => setViewDate(todayYmd)}
              className="px-3 py-2 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Сегодня
            </button>
          )}

          {/* View mode */}
          <div className="flex bg-white rounded-lg border border-stone-200 shadow-sm p-0.5">
            {["day", "week", "month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === mode
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {mode === "day" ? "День" : mode === "week" ? "Неделя" : "Месяц"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Staff tabs */}
          <div className="flex bg-white rounded-lg border border-stone-200 shadow-sm p-0.5 overflow-x-auto max-w-[200px]">
            {staff.length === 0 ? (
              <span className="px-3 py-2 text-xs text-stone-400">
                Нет сотрудников
              </span>
            ) : (
              staff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaffId(s.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    selectedStaffId === s.id
                      ? "bg-orange-600 text-white"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {s.name.split(" ")[0]}
                </button>
              ))
            )}
          </div>

          {/* Add button */}
          <button
            onClick={() => {
              if (!staff.length) {
                alert("Сначала создайте сотрудника в разделе «Команда»");
                return;
              }
              if (!clients.length) {
                alert("Сначала добавьте клиента в разделе «Клиенты»");
                return;
              }
              openNewAppointment();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Запись
          </button>
        </div>
      </div>

      {/* Stats */}
      {viewMode === "day" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Записей",
              value: dayStats.total,
              icon: CalendarDays,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
            {
              label: "Подтверждено",
              value: dayStats.confirmed,
              icon: Users,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Выручка",
              value: `${dayStats.revenue.toLocaleString()} ₽`,
              icon: DollarSign,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Загрузка",
              value: `${dayStats.occupancy}%`,
              icon: TrendingUp,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon size={16} className={stat.color} />
                </div>
                <span className="text-xs font-semibold text-stone-500">
                  {stat.label}
                </span>
              </div>
              <p className="text-xl font-black text-stone-800">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {viewMode === "month" && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Записей за месяц",
              value: monthStats.total,
              icon: Calendar,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
            {
              label: "Подтверждено",
              value: monthStats.confirmed,
              icon: CheckCircle2,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Выручка",
              value: `${monthStats.revenue.toLocaleString()} ₽`,
              icon: DollarSign,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon size={16} className={stat.color} />
                </div>
                <span className="text-xs font-semibold text-stone-500">
                  {stat.label}
                </span>
              </div>
              <p className="text-xl font-black text-stone-800">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 lg:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Поиск по клиенту или услуге..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-stone-400"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
            size={16}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидание</option>
            <option value="confirmed">Подтверждено</option>
            <option value="cancelled">Отменено</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden"
        ref={gridRef}
      >
        {!staff.length ? (
          <div className="h-48 flex items-center justify-center text-stone-400 text-sm">
            Создайте сотрудника в разделе «Команда», чтобы вести журнал.
          </div>
        ) : viewMode === "day" ? (
          <div className="grid grid-cols-[64px_1fr] md:grid-cols-[90px_1fr] gap-0 relative min-h-[1040px]">
            {/* Time labels */}
            <div className="space-y-0 pt-2">
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-20 text-[11px] font-semibold text-stone-400 text-right pr-3 pt-1"
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="relative border-l border-stone-200 bg-stone-50/50">
              {hours.map((h, i) => (
                <div
                  key={i}
                  className="h-20 border-b border-stone-100 hover:bg-orange-50/50 transition-colors cursor-pointer"
                  onClick={() => handleSlotClick(h)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(h, viewDate)}
                >
                  <div className="opacity-0 hover:opacity-100 transition-opacity text-xs text-orange-600 font-medium p-2">
                    + Добавить
                  </div>
                </div>
              ))}

              {/* Appointments */}
              {staffAppointments.map((app) => {
                // Подсчитываем сколько записей на это же время
                const sameTimeApps = staffAppointments.filter(a => a.startTime === app.startTime);
                const columns = sameTimeApps.length;
                const idx = sameTimeApps.findIndex(a => a.id === app.id);

                return (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={() => handleDragStart(app)}
                    onClick={() => {
                      setEditingAppointment(app);
                      setIsModalOpen(true);
                    }}
                    onMouseEnter={() => setHoveredCard(app.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      top: `${getSlotPosition(app.startTime)}px`,
                      height: `${(app.duration / 60) * 80}px`,
                      left: `calc(${(idx / columns) * 100}% + 0.5rem)`,
                      width: `calc(${100 / columns}% - 1rem)`,
                    }}
                    className={`absolute z-10 transition-all ${
                      hoveredCard === app.id ? "scale-[1.02] shadow-md z-20" : ""
                    }`}
                  >
                    <div
                      className={`h-full p-3 rounded-lg border-l-[3px] shadow-sm cursor-pointer ${statusColors[app.status]}`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical
                          size={12}
                          className="opacity-30 shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold truncate">
                              {app.clientName}
                            </span>
                            <span className="text-[10px] font-semibold opacity-60 shrink-0">
                              {app.startTime}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium opacity-70 truncate">
                            {app.service}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-bold opacity-60">
                              {app.price} ₽
                            </span>
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${statusDot[app.status]}`}
                              />
                              {statusIcon(app.status)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick actions */}
                      {hoveredCard === app.id && (
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatus(app.id, "confirmed");
                            }}
                            className="w-7 h-7 bg-orange-500 hover:bg-orange-600 rounded-md flex items-center justify-center text-white shadow transition-colors"
                            title="Подтвердить"
                          >
                            <CheckCircle2 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatus(app.id, "cancelled");
                            }}
                            className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-md flex items-center justify-center text-white shadow transition-colors"
                            title="Отменить"
                          >
                            <XCircle size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === "month" ? (
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px mb-px">
              {dayOfWeekShort.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-bold text-stone-500 py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {monthWeeks.map((week, wi) => (
              <div
                key={wi}
                className="grid grid-cols-7 gap-px bg-stone-200 rounded-lg overflow-hidden border border-stone-200"
              >
                {week.map((date) => {
                  const dayApps = getAppointmentsForDate(date);
                  const isToday = date === todayYmd;
                  const isCurrentMonth = date.startsWith(viewDate.slice(0, 7));
                  const dayNum = parseInt(date.split("-")[2], 10);

                  return (
                    <div
                      key={date}
                      className={`min-h-[90px] p-2 bg-white transition-colors cursor-pointer ${
                        isToday
                          ? "bg-orange-50 ring-2 ring-orange-500 ring-inset"
                          : "hover:bg-stone-50"
                      } ${!isCurrentMonth ? "opacity-30" : ""}`}
                      onClick={() => {
                        setViewDate(date);
                        setViewMode("day");
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (staff.length) openNewAppointment(date);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-bold ${isToday ? "text-orange-600" : "text-stone-700"}`}
                        >
                          {dayNum}
                        </span>
                        {isCurrentMonth && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (staff.length) openNewAppointment(date);
                            }}
                            className="w-5 h-5 rounded bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Добавить запись"
                          >
                            <Plus size={12} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        {dayApps.slice(0, 3).map((app) => (
                          <div
                            key={app.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAppointment(app);
                              setIsModalOpen(true);
                            }}
                            className={`text-[10px] font-semibold truncate px-1.5 py-0.5 rounded ${statusColors[app.status]}`}
                          >
                            {app.startTime} {app.clientName.split(" ")[0]}
                          </div>
                        ))}
                        {dayApps.length > 3 && (
                          <div className="text-[10px] font-medium text-stone-400 px-1.5">
                            +{dayApps.length - 3} ещё
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* Week View */
          <div className="divide-y divide-stone-100">
            {weekDates.map((date) => {
              const dayApps = staffAppointments.filter((a) => a.date === date);
              const isToday = date === todayYmd;

              return (
                <div
                  key={date}
                  className={`p-4 ${isToday ? "bg-orange-50/50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className={`text-sm font-bold ${isToday ? "text-orange-600" : "text-stone-700"}`}
                    >
                      {labelRuFromYMD(date)}
                    </h3>
                    <span className="text-xs text-stone-400">
                      {dayApps.length} записей
                    </span>
                  </div>

                  {dayApps.length === 0 ? (
                    <p className="text-xs text-stone-400 py-1">Нет записей</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {dayApps.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => {
                            setEditingAppointment(app);
                            setIsModalOpen(true);
                          }}
                          className={`p-3 rounded-lg border-l-[3px] cursor-pointer transition-all hover:shadow-sm ${statusColors[app.status]}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold truncate">
                              {app.clientName}
                            </span>
                            <span className="text-[10px] font-semibold opacity-60">
                              {app.startTime}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium opacity-70 truncate">
                            {app.service}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-bold opacity-60">
                              {app.price} ₽
                            </span>
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${statusDot[app.status]}`}
                              />
                              {statusIcon(app.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAppointment ? "Изменить запись" : "Новая запись"}
        maxWidth="max-w-3xl"
      >
        <form
          key={isModalOpen ? "open" : "closed"}
          onSubmit={handleSave}
          onInvalid={(e) => {
            console.log("Form validation failed:", e.target);
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Дата
            </label>
            <input
              name="date"
              type="date"
              defaultValue={editingAppointment?.date || viewDate}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Клиент
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                size={16}
              />
              <select
                name="clientId"
                defaultValue={editingAppointment?.clientId || ""}
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 appearance-none"
              >
                <option value="" disabled>
                  Выберите клиента
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Время
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  size={16}
                />
                <input
                  name="startTime"
                  type="time"
                  defaultValue={editingAppointment?.startTime || "10:00"}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Длительность (мин)
              </label>
              <input
                name="duration"
                type="number"
                min={15}
                step={15}
                defaultValue={editingAppointment?.duration || 60}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Услуга
            </label>
            {services && services.length > 0 ? (
              <div className="space-y-2">
                <select
                  name="serviceId"
                  defaultValue={editingAppointment?.serviceId || ""}
                  onChange={(e) => {
                    const service = services.find((s) => s.id === e.target.value);
                    if (service) {
                      const priceInput = e.target.form.querySelector('input[name="price"]');
                      const durationInput = e.target.form.querySelector('input[name="duration"]');
                      const serviceInput = e.target.form.querySelector('input[name="service"]');
                      if (priceInput) priceInput.value = service.price;
                      if (durationInput) durationInput.value = service.duration;
                      if (serviceInput) serviceInput.value = service.name;
                    }
                  }}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 appearance-none"
                >
                  <option value="">Выберите услугу</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.price} ₽ ({s.duration} мин)
                    </option>
                  ))}
                </select>
                <input
                  name="service"
                  type="text"
                  defaultValue={editingAppointment?.service || ""}
                  placeholder="Или введите название вручную"
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 placeholder:text-stone-400"
                />
              </div>
            ) : (
              <input
                name="service"
                type="text"
                defaultValue={editingAppointment?.service || ""}
                placeholder="Например: Стрижка"
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 placeholder:text-stone-400"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Стоимость (₽)
              </label>
              <input
                name="price"
                type="number"
                min={0}
                defaultValue={editingAppointment?.price || 0}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Статус
              </label>
              <select
                name="status"
                defaultValue={editingAppointment?.status || "pending"}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 appearance-none"
              >
                <option value="pending">Ожидание</option>
                <option value="confirmed">Подтверждено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            {editingAppointment && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setConfirmDeleteId(editingAppointment.id)}
                className="flex-1"
              >
                Удалить
              </Button>
            )}
            <Button type="submit" className="flex-[2]">
              {editingAppointment ? "Сохранить" : "Создать"}
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
