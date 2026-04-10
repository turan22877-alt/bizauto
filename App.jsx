import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppSection, Client, Staff, Appointment, Product, UserProfile, Currency } from './types';
import Sidebar from './components/Sidebar';
import Header, { SearchNavigateDetail } from './components/Header';
import Dashboard from './components/Dashboard';
import BookingJournal from './components/BookingJournal';
import ClientManagement from './components/ClientManagement';
import StaffManagement from './components/StaffManagement';
import InventoryManager from './components/InventoryManager';
import FinancialStats from './components/FinancialStats';
import LoyaltyManager from './components/LoyaltyManager';
import NotificationCenter from './components/NotificationCenter';
import AnalyticsView from './components/AnalyticsView';
import PayrollCalculator from './components/PayrollCalculator';
import AuthScreen from './components/AuthScreen';
import SettingsModal, { BackupPayload } from './components/SettingsModal';
import Toast from './components/ui/Toast';
import { getSession, logoutUser, updateUserProfile } from './utils/auth';
import { migrateLegacyOwner, scopeByOwner } from './utils/migrate';
import { debouncedSave, loadFromStorage, flushAllSaves } from './utils/storage';
import { useToast } from './hooks/useToast';

const App = () => {
  const [user, setUser] = useState(() => getSession());
  const [activeSection, setActiveSection] = useState(AppSection.DASHBOARD);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  const [clientsAll, setClientsAll] = useState(() => loadFromStorage('b_clients', []));
  const [staffAll, setStaffAll] = useState(() => loadFromStorage('b_staff', []));
  const [appointmentsAll, setAppointmentsAll] = useState(() => loadFromStorage('b_appointments', []));
  const [inventoryAll, setInventoryAll] = useState(() => loadFromStorage('b_inventory', []));

  const ownerUid = user?.uid ?? '';

  const clients = useMemo(() => scopeByOwner(clientsAll, ownerUid), [clientsAll, ownerUid]);
  const staff = useMemo(() => scopeByOwner(staffAll, ownerUid), [staffAll, ownerUid]);
  const appointments = useMemo(() => scopeByOwner(appointmentsAll, ownerUid), [appointmentsAll, ownerUid]);
  const inventory = useMemo(() => scopeByOwner(inventoryAll, ownerUid), [inventoryAll, ownerUid]);

  const setClients = useCallback(
    (updater) => {
      setClientsAll((prev) => {
        const rest = prev.filter((c) => c.ownerUid !== ownerUid);
        const next = typeof updater === 'function' ? updater(scopeByOwner(prev, ownerUid)) : updater;
        return [...rest, ...next];
      });
    },
    [ownerUid]
  );

  const setStaff = useCallback(
    (updater) => {
      setStaffAll((prev) => {
        const rest = prev.filter((s) => s.ownerUid !== ownerUid);
        const next = typeof updater === 'function' ? updater(scopeByOwner(prev, ownerUid)) : updater;
        return [...rest, ...next];
      });
    },
    [ownerUid]
  );

  const setAppointments = useCallback(
    (updater) => {
      setAppointmentsAll((prev) => {
        const rest = prev.filter((a) => a.ownerUid !== ownerUid);
        const next =
          typeof updater === 'function'
            ? updater(scopeByOwner(prev, ownerUid))
            : updater;
        return [...rest, ...next];
      });
    },
    [ownerUid]
  );

  const setInventory = useCallback(
    (updater) => {
      setInventoryAll((prev) => {
        const rest = prev.filter((i) => i.ownerUid !== ownerUid);
        const next =
          typeof updater === 'function' ? updater(scopeByOwner(prev, ownerUid)) : updater;
        return [...rest, ...next];
      });
    },
    [ownerUid]
  );

  useEffect(() => debouncedSave('b_clients', clientsAll), [clientsAll]);
  useEffect(() => debouncedSave('b_staff', staffAll), [staffAll]);
  useEffect(() => debouncedSave('b_appointments', appointmentsAll), [appointmentsAll]);
  useEffect(() => debouncedSave('b_inventory', inventoryAll), [inventoryAll]);

  // Flush all pending saves before page unload
  useEffect(() => {
    const handleBeforeUnload = () => flushAllSaves();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleAuthed = (profile, opts) => {
    setUser(profile);
    if (opts?.isNew) {
      setClientsAll((c) => migrateLegacyOwner(c, profile.uid));
      setStaffAll((s) => migrateLegacyOwner(s, profile.uid));
      setAppointmentsAll((a) => migrateLegacyOwner(a, profile.uid));
      setInventoryAll((i) => migrateLegacyOwner(i, profile.uid));
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const pendingAppointmentsCount = useMemo(
    () => appointments.filter((a) => a.status === 'pending').length,
    [appointments]
  );

  const onNavigate = useCallback((section, detail) => {
    setActiveSection(section);
    if (detail?.appointmentId) setFocusRequest({ appointmentId: detail.appointmentId });
  }, []);

  const onFocusConsumed = useCallback(() => setFocusRequest(null), []);

  const buildBackup = useCallback(() => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      ownerUid,
      clients: scopeByOwner(clientsAll, ownerUid),
      staff: scopeByOwner(staffAll, ownerUid),
      appointments: scopeByOwner(appointmentsAll, ownerUid),
      inventory: scopeByOwner(inventoryAll, ownerUid),
    };
  }, [ownerUid, clientsAll, staffAll, appointmentsAll, inventoryAll]);

  const handleImportBackup = useCallback(
    (payload) => {
      if (!user) return;
      try {
        const uid = user.uid;
        setClientsAll((prev) => [...prev.filter((c) => c.ownerUid !== uid), ...payload.clients]);
        setStaffAll((prev) => [...prev.filter((s) => s.ownerUid !== uid), ...payload.staff]);
        setAppointmentsAll((prev) => [...prev.filter((a) => a.ownerUid !== uid), ...payload.appointments]);
        setInventoryAll((prev) => [...prev.filter((i) => i.ownerUid !== uid), ...payload.inventory]);
        success('Резервная копия успешно импортирована');
      } catch (err) {
        error('Ошибка при импорте резервной копии');
        console.error(err);
      }
    },
    [user, success, error]
  );

  const handleSaveProfile = useCallback(
    (patch) => {
      if (!user) return;
      try {
        const next = updateUserProfile(user.uid, {
          displayName: patch.displayName,
          businessName: patch.businessName || null,
          currency: patch.currency,
        });
        if (next) {
          setUser(next);
          success('Профиль успешно обновлен');
        }
      } catch (err) {
        error('Ошибка при обновлении профиля');
        console.error(err);
      }
    },
    [user, success, error]
  );

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.DASHBOARD:
        return <Dashboard clients={clients} appointments={appointments} onNavigate={(s) => setActiveSection(s)} />;
      case AppSection.BOOKING_JOURNAL:
        return (
          <BookingJournal
            appointments={appointments}
            staff={staff}
            clients={clients}
            onUpdateAppointments={setAppointments}
            ownerUid={ownerUid}
            focusRequest={focusRequest}
            onFocusConsumed={onFocusConsumed}
          />
        );
      case AppSection.CLIENTS:
        return <ClientManagement clients={clients} onUpdateClients={setClients} ownerUid={ownerUid} />;
      case AppSection.STAFF:
        return <StaffManagement staff={staff} onUpdateStaff={setStaff} ownerUid={ownerUid} />;
      case AppSection.INVENTORY:
        return <InventoryManager inventory={inventory} onUpdateInventory={setInventory} ownerUid={ownerUid} />;
      case AppSection.FINANCE:
        return <FinancialStats appointments={appointments} />;
      case AppSection.LOYALTY:
        return <LoyaltyManager clients={clients} onUpdateClients={setClients} />;
      case AppSection.NOTIFICATIONS:
        return <NotificationCenter />;
      case AppSection.ANALYTICS:
        return <AnalyticsView appointments={appointments} clients={clients} />;
      case AppSection.PAYROLL:
        return <PayrollCalculator staff={staff} appointments={appointments} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <h2 className="header-font text-2xl font-bold">В разработке</h2>
            <p>Модуль будет доступен позже.</p>
          </div>
        );
    }
  };

  if (!user) {
    return <AuthScreen onAuthed={handleAuthed} />;
  }

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-700 font-sans selection:bg-orange-200">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        businessName={user.businessName}
        pendingAppointmentsCount={pendingAppointmentsCount}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header
          activeSection={activeSection}
          user={user}
          onLogout={handleLogout}
          clients={clients}
          appointments={appointments}
          staff={staff}
          inventory={inventory}
          onNavigate={onNavigate}
          onOpenSettings={() => setSettingsOpen(true)}
          pendingAppointmentsCount={pendingAppointmentsCount}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="animate-fade-in">{renderContent()}</div>
        </main>
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          user={user}
          onSaveProfile={handleSaveProfile}
          onImportBackup={handleImportBackup}
          buildBackup={buildBackup}
        />
      </div>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default App;