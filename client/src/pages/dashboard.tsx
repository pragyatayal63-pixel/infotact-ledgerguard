import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

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
import type { TransactionRecord, TransactionType } from '../api/types';

import {
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
  const { user: authUser, company: authCompany, logout } = useAuth();

  // Navigation & Tenant state
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [currentSpend, setCurrentSpend] = useState<number>(0);

  // Active tenant derived strictly from authenticated company session
  const activeTenant: Tenant = useMemo(() => ({
    id: authCompany?.tenantId || 'tenant-default',
    name: authCompany?.name || 'Enterprise Tenant',
    slug: authCompany?.tenantId || 'default',
    tier: 'Enterprise Active',
    databaseCluster: `cluster-${authCompany?.tenantId || 'isolated'}.db.internal`,
    queryLatencyMs: 1.8,
    activeConnections: 14,
    maxConnections: 50,
    monthlyBudget: 15000,
    currentSpend,
    status: 'Healthy',
  }), [authCompany, currentSpend]);

  // Search & Data state
  const [globalSearch, setGlobalSearch] = useState('');
  const [transactionsMap, setTransactionsMap] = useState<Record<string, BillingTransaction[]>>(demoTransactions);
  const [notifications, setNotifications] = useState<NotificationItem[]>(demoNotifications);

  const user = useMemo(() => ({
    name: authUser?.name || 'Administrator',
    email: authUser?.email || '',
    role: authUser?.role || 'Admin',
    company: authCompany?.name || 'Enterprise',
  }), [authUser, authCompany]);

  // Active tenant data
  const tenantTransactions = useMemo(() => {
    return transactionsMap[activeTenant.id] || [];
  }, [transactionsMap, activeTenant.id]);

  const committedCount = tenantTransactions.filter((t) => t.status === 'committed').length;
  const rolledBackCount = tenantTransactions.filter((t) => t.status === 'rolled_back').length;
  const pendingCount = tenantTransactions.filter((t) => t.status === 'pending' || t.status === 'processing').length;
  const failedCount = tenantTransactions.filter((t) => t.status === 'failed').length;

  const currentResources =
    demoResourceMetrics[activeTenant.id] || demoResourceMetrics['tenant-acme'];
  const currentHistorical =
    demoHistoricalUsage[activeTenant.id] || demoHistoricalUsage['tenant-acme'];
  const currentServiceExpenses =
    demoServiceExpenses[activeTenant.id] || demoServiceExpenses['tenant-acme'];


  // Handle live transaction success from API
  const handleTransactionSuccess = (tx: TransactionRecord, newBalance: number, isReplay: boolean) => {
    const mappedTx: BillingTransaction = {
      id: tx._id,
      eventId: tx.eventId,
      tenantId: activeTenant.id,
      serviceName: `${tx.type === 'credit' ? 'Account Credit' : 'Account Debit'} (${tx.currency})`,
      category: 'Other Services',
      amount: tx.amount,
      status: 'committed',
      timestamp: 'Just now',
      reference: `TX-${tx.accountId}-${tx._id.slice(-6).toUpperCase()}`,
      units: `${tx.amount} ${tx.currency}`,
      notes: isReplay ? 'Idempotent replay: original transaction returned' : 'Single-charge ACID transaction verified',
    };

    setTransactionsMap((prev) => ({
      ...prev,
      [activeTenant.id]: [mappedTx, ...(prev[activeTenant.id] || [])],
    }));

    setCurrentSpend(newBalance);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: isReplay ? 'Idempotent Replay Verified' : 'Transaction Committed',
      message: isReplay
        ? `Event ${tx.eventId} was already processed. Single-charge verified; balance unchanged at ${newBalance} ${tx.currency}.`
        : `Event ${tx.eventId} completed successfully for ${activeTenant.name}. New balance: ${newBalance} ${tx.currency}.`,
      time: 'Just now',
      read: false,
      type: isReplay ? 'info' : 'success',
    };

    setNotifications((prev) => [notif, ...prev]);
  };

  // Handle rollback demo from API
  const handleTransactionRollback = (rollbackInfo: {
    eventId: string;
    accountId: string;
    amount: number;
    type: TransactionType;
    currency: string;
    timestamp: string;
    reason: string;
  }) => {
    const rollbackTx: BillingTransaction = {
      id: `rollback-${Date.now()}`,
      eventId: rollbackInfo.eventId,
      tenantId: activeTenant.id,
      serviceName: `Simulated Failure Abort (${rollbackInfo.type.toUpperCase()})`,
      category: 'Other Services',
      amount: rollbackInfo.amount,
      status: 'rolled_back',
      timestamp: 'Just now',
      reference: `ROLLBACK-${rollbackInfo.accountId}`,
      units: `${rollbackInfo.amount} ${rollbackInfo.currency}`,
      notes: 'Simulated failure aborted by backend. Zero balance deduction.',
    };

    setTransactionsMap((prev) => ({
      ...prev,
      [activeTenant.id]: [rollbackTx, ...(prev[activeTenant.id] || [])],
    }));

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'State Safely Rolled Back',
      message: `Event ${rollbackInfo.eventId} triggered simulated failure. Multi-document transaction aborted with zero balance deduction.`,
      time: 'Just now',
      read: false,
      type: 'rollback',
    };

    setNotifications((prev) => [notif, ...prev]);
  };

  const handleErrorNotification = (title: string, message: string) => {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      time: 'Just now',
      read: false,
      type: 'alert',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleMarkNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
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
          company={authCompany}
          activeTenant={activeTenant}
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
                pendingCount={pendingCount}
                failedCount={failedCount}
              />

              {/* Mid-Project Review Focus: Dynamic Tenant DB Isolation & Switching Benchmark */}
              <DatabasePoolStatus
                tenants={demoTenants}
                activeTenant={activeTenant}
                onSelectTenant={() => {}}
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
              onSelectTenant={() => {}}
            />
          )}

          {/* TAB 5: AUDIT & RESILIENCY */}
          {currentTab === 'audit' && (
            <AuditResiliencyView
              logs={demoAuditLogs}
              activeTenant={activeTenant}
              onOpenRecordModal={() => setIsRecordModalOpen(true)}
              transactions={tenantTransactions}
            />
          )}

          {/* TAB 6: ENGINE SETTINGS */}
          {currentTab === 'settings' && (
            <EngineSettingsView activeTenant={activeTenant} />
          )}
        </main>
      </div>

      {/* Record Transaction Modal */}
      <AddTransactionModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        activeTenant={activeTenant}
        onTransactionSuccess={handleTransactionSuccess}
        onTransactionRollback={handleTransactionRollback}
        onErrorNotification={handleErrorNotification}
      />
    </div>
  );
}
