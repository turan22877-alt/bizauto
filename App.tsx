
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppSection, Client, Staff, Appointment, Product, UserProfile } from './types';
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
import { getSession, logoutUser, updateUserProfile } from './utils/auth';
import { migrateLegacyOwner, scopeByOwner } from './utils/migrate';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => getSession());
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ appointmentId: string } | null>(null);

  const [clientsAll, setClientsAll] = useState<Client[]>(() => JSON.parse(localStorage.getItem('b_clients') || '[]'));
  const [staffAll, setStaffAll] = useState<Staff[]>(() => JSON.parse(localStorage.getItem('b_staff') || '[]'));
  const [appointmentsAll, setAppointmentsAll] = useState<Appointment[]>(() =>
    JSON.parse(localStorage.getItem('b_appointments') || '[]')
  );
  const [inventoryAll, setInventoryAll] = useState<Product[]>(() => JSON.parse(localStorage.getItem('b_inventory') || '[]'));

  const ownerUid = user?.uid ?? '';

  const clients = useMemo(() => scopeByOwner(clientsAll, ownerUid), [clientsAll, ownerUid]);
  const staff = useMemo(() => scopeByOwner(staffAll, ownerUid), [staffAll, ownerUid]);
  const appointments = useMemo(() => scopeByOwner(appointmentsAll, ownerUid), [appointmentsAll, ownerUid]);
  const inventory = useMemo(() => scopeByOwner(inventoryAll, ownerUid), [inventoryAll, ownerUid]);

  const setClients = useCallback(
    (updater: React.SetStateAction<Client[]>) => {
      setClientsAll((prev) => {
        const rest = prev.filter((c) => c.ownerUid !== ownerUid);
        const next = typeof updater === 'function' ? (updater as (p: Client[]) => Client[])(scopeByOwner(prev, ownerUid)) : updater;
        return [...rest, ...next];
      });
    },
    [ownerUid]
  );

  const setStaff = useCallback(
    (updater: React.SetStateAction<Staff[]>) => {
      setStaffAll((prev) => {
        const rest = prev.filter((s) => s.ownerUid !== ownerUid);
        const next = typeof updater === 'function' ? (updater as (p: Staff[]) => Staff[])(scopeByOwner(prev, ownerUid)) : updater;
        return [...rest, ...next];
      });
    },
    [ownerUid]
  );

  const setAppointments = useCallback(
    (updater: React.SetStateAction<Appointment[]>) => {
      setAppointmentsAll((prev) => {
        const rest = prev.filter((a) => a.ownerUid !== ownerUid);
        const next =
          typeof updater === 'function'
            ? (updater as (p: Appointment[]) => Appointment[])(scopeByOwner(prev, ownerUid))
            : updater;
        return [...rest, ...next];
      });
    },
    [ownerUid]
  );

  const setInventory = useCallback(
    (updater: React.SetStateAction<Product[]>) => {
      setInventoryAll((prev) => {
        const rest = prev.filter((i) => i.ownerUid !== ownerUid);
        const next =
          typeof updater === 'function' ? (updater as (p: Product[]) => Product[])(scopeByOwner(prev, ownerUid)) : updater;
        return [...rest, ...next];
      });
    },
    [ownerUid]
  );

  useEffect(() => localStorage.setItem('b_clients', JSON.stringify(clientsAll)), [clientsAll]);
  useEffect(() => localStorage.setItem('b_staff', JSON.stringify(staffAll)), [staffAll]);
  useEffect(() => localStorage.setItem('b_appointments', JSON.stringify(appointmentsAll)), [appointmentsAll]);
  useEffect(() => localStorage.setItem('b_inventory', JSON.stringify(inventoryAll)), [inventoryAll]);

  const handleAuthed = (profile: UserProfile, opts?: { isNew?: boolean }) => {
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

  const onNavigate = useCallback((section: AppSection, detail?: SearchNavigateDetail) => {
    setActiveSection(section);
    if (detail?.appointmentId) setFocusRequest({ appointmentId: detail.appointmentId });
  }, []);

  const onFocusConsumed = useCallback(() => setFocusRequest(null), []);

  const buildBackup = useCallback((): BackupPayload => {
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
    (payload: BackupPayload) => {
      if (!user) return;
      const uid = user.uid;
      setClientsAll((prev) => [...prev.filter((c) => c.ownerUid !== uid), ...(payload.clients as Client[])]);
      setStaffAll((prev) => [...prev.filter((s) => s.ownerUid !== uid), ...(payload.staff as Staff[])]);
      setAppointmentsAll((prev) => [...prev.filter((a) => a.ownerUid !== uid), ...(payload.appointments as Appointment[])]);
      setInventoryAll((prev) => [...prev.filter((i) => i.ownerUid !== uid), ...(payload.inventory as Product[])]);
    },
    [user]
  );

  const handleSaveProfile = useCallback(
    (patch: { displayName: string; businessName: string }) => {
      if (!user) return;
      const next = updateUserProfile(user.uid, {
        displayName: patch.displayName,
        businessName: patch.businessName || null,
      });
      if (next) setUser(next);
    },
    [user]
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
    <div className="flex min-h-screen bg-[#06060a] text-slate-300 font-sans selection:bg-blue-600/30">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} businessName={user.businessName} />
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
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">{renderContent()}</div>
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
    </div>
  );
};

export default App;
