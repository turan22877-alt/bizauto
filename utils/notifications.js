// Утилита для работы с уведомлениями о записях
export const checkUpcomingAppointments = (appointments) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return appointments.filter((app) => {
    if (app.status !== 'confirmed') return false;
    if (app.date !== today) return false;

    // Проверяем, что запись в ближайшие 30 минут
    const [appHour, appMin] = app.startTime.split(':').map(Number);
    const [nowHour, nowMin] = currentTime.split(':').map(Number);

    const appMinutes = appHour * 60 + appMin;
    const nowMinutes = nowHour * 60 + nowMin;
    const diff = appMinutes - nowMinutes;

    // Уведомление за 30 минут до записи
    return diff > 0 && diff <= 30;
  });
};

export const formatAppointmentNotification = (app) => {
  return {
    id: `appointment-${app.id}`,
    title: 'Скоро запись',
    message: `${app.clientName} - ${app.service} в ${app.startTime}`,
    time: new Date().toISOString(),
    type: 'appointment',
    appointmentId: app.id,
  };
};
