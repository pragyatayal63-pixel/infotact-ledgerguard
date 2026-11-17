import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { ExecutiveHeader } from '../components/dashboard/ExecutiveHeader';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { UsageChart } from '../components/dashboard/UsageChart';
import { ResourceLimitsGauge } from '../components/dashboard/ResourceLimitsGauge';
import { LedgerTable } from '../components/dashboard/LedgerTable';
import { DatabasePoolStatus } from '../components/dashboard/DatabasePoolStatus';
import { AuditResiliencyView } from '../components/dashboard/AuditResiliencyView';
import { EngineSettingsView } from '../components/dashboard/EngineSettingsView';
import { AddTransactionModal } from '../components/transactions/AddTransactionModal';

import type {
  DashboardTab,
  BillingTransaction,
  Tenant,
  NotificationItem,
} from '../types/dashboard';

import {
  demoUserProfile,
  demoTenants,
  demoTransactions,
  demoResourceMetrics,
  demoHistoricalUsage,
  demoServiceExpenses,
  demoAuditLogs,
  demoNotifications,
} from '../data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();

  // Navigation & Tenant state
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [activeTenant, setActiveTenant] = useState<Tenant>(demoTenants[0]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Search & Data state
  const [globalSearch, setGlobalSearch] = useState('');
  const [transactionsMap, setTransactionsMap] = useState<Record<string, BillingTransaction[]>>(demoTransactions);
  const [notifications, setNotifications] = useState<NotificationItem[]>(demoNotifications);
  const user = demoUserProfile;

  // Active tenant data
  const tenantTransactions = useMemo(() => {
    return transactionsMap[activeTenant.id] || [];
  }, [transactionsMap, activeTenant.id]);

  const committedCount = tenantTransactions.filter((t) => t.status === 'committed').length;
  const rolledBackCount = tenantTransactions.filter((t) => t.status === 'rolled_back').length;

  const currentResources =
    demoResourceMetrics[activeTenant.id] || demoResourceMetrics['tenant-acme'];
  const currentHistorical =
    demoHistoricalUsage[activeTenant.id] || demoHistoricalUsage['tenant-acme'];
  const currentServiceExpenses =
    demoServiceExpenses[activeTenant.id] || demoServiceExpenses['tenant-acme'];

  // Handle new transaction from record modal
  const handleCommitTransaction = (newTx: BillingTransaction) => {
    setTransactionsMap((prev) => ({
      ...prev,
      [activeTenant.id]: [newTx, ...(prev[activeTenant.id] || [])],
    }));

    if (newTx.status === 'committed') {
      setActiveTenant((prev) => ({
        ...prev,
        currentSpend: parseFloat((prev.currentSpend + newTx.amount).toFixed(2)),
      }));
    }

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: newTx.status === 'committed' ? 'Event Recorded' : 'Rollback Event Handled',
      message: `${newTx.serviceName} (${newTx.units}) recorded for ${activeTenant.name}.`,
      time: 'Just now',
      read: false,
      type: newTx.status === 'committed' ? 'success' : 'rollback',
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleExportStatement = () => {
    const csvContent =
      'EventID,Service,Amount,Status,Timestamp,Reference\n' +
      tenantTransactions
        .map(
          (t) =>
            `"${t.eventId}","${t.serviceName}","${t.amount}","${t.status}","${t.timestamp}","${t.reference}"`
        )
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerguard-${activeTenant.slug}-statement.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTenant={activeTenant}
        user={user}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          user={user}
          tenants={demoTenants}
          activeTenant={activeTenant}
          onSelectTenant={setActiveTenant}
          notifications={notifications}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
          onLogout={handleLogout}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* Dashboard Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <>
              {/* Executive Header */}
              <ExecutiveHeader
                activeTenant={activeTenant}
                user={user}
                onOpenRecordModal={() => setIsRecordModalOpen(true)}
                onExportStatement={handleExportStatement}
              />

              {/* 4 Clean Statistic Cards */}
              <SummaryCards
                activeTenant={activeTenant}
                committedCount={committedCount}
                rolledBackCount={rolledBackCount}
              />

              {/* Analytics Charts: Historical Line + Service Doughnut */}
              <UsageChart
                activeTenant={activeTenant}
                historicalData={currentHistorical}
                serviceExpenses={currentServiceExpenses}
              />

              {/* Active Resource Consumption & Quotas */}
              <ResourceLimitsGauge
                activeTenant={activeTenant}
                resources={currentResources}
              />

              {/* Idempotent Billing Ledger Table */}
              <LedgerTable
                transactions={tenantTransactions}
                searchTerm={globalSearch}
                onSearchChange={setGlobalSearch}
                onOpenRecordModal={() => setIsRecordModalOpen(true)}
              />
            </>
          )}

          {/* TAB 2: IDEMPOTENT LEDGER */}
          {currentTab === 'ledger' && (
            <div className="space-y-6">
              <LedgerTable
                transactions={tenantTransactions}
                searchTerm={globalSearch}
                onSearchChange={setGlobalSearch}
                onOpenRecordModal={() => setIsRecordModalOpen(true)}
              />
            </div>
          )}

          {/* TAB 3: USAGE & ANALYTICS */}
          {currentTab === 'analytics' && (
            <div className="space-y-6">
              <UsageChart
                activeTenant={activeTenant}
                historicalData={currentHistorical}
                serviceExpenses={currentServiceExpenses}
              />
              <ResourceLimitsGauge
                activeTenant={activeTenant}
                resources={currentResources}
              />
            </div>
          )}

          {/* TAB 4: DYNAMIC DB POOLS */}
          {currentTab === 'pools' && (
            <DatabasePoolStatus
              tenants={demoTenants}
              activeTenant={activeTenant}
              onSelectTenant={setActiveTenant}
            />
          )}

          {/* TAB 5: AUDIT & RESILIENCY */}
          {currentTab === 'audit' && (
            <AuditResiliencyView
              logs={demoAuditLogs}
              activeTenant={activeTenant}
            />
          )}

          {/* TAB 6: ENGINE SETTINGS */}
          {currentTab === 'settings' && (
            <EngineSettingsView activeTenant={activeTenant} />
          )}
        </main>
      </div>

      {/* Record Demo Event Modal */}
      <AddTransactionModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        activeTenant={activeTenant}
        onCommitTransaction={handleCommitTransaction}
      />
    </div>
  );
}
