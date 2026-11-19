export type TransactionStatus = 'committed' | 'rolled_back' | 'processing';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: string;
  databaseCluster: string;
  queryLatencyMs: number;
  activeConnections: number;
  maxConnections: number;
  monthlyBudget: number;
  currentSpend: number;
  status: 'Healthy' | 'Degraded';
}

export interface BillingTransaction {
  id: string;
  eventId: string;
  tenantId: string;
  serviceName: string;
  category: 'API Gateway' | 'Database' | 'Storage' | 'Compute' | 'Other Services';
  amount: number;
  status: TransactionStatus;
  timestamp: string;
  reference: string;
  units: string;
  notes?: string;
}

export interface ResourceMetric {
  id: string;
  name: string;
  category: string;
  used: number;
  limit: number;
  unit: string;
  cost: number;
  percentage: number;
}

export interface HistoricalUsagePoint {
  timeLabel: string;
  cost: number;
  requests: number;
  computeHours: number;
}

export interface ServiceExpense {
  id: string;
  service: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  service: string;
  status: 'SUCCESS' | 'ROLLBACK' | 'BLOCKED_DUPLICATE' | 'POOL_SWITCH';
  latencyMs: number;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert' | 'rollback';
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
}

export type DashboardTab =
  | 'overview'
  | 'ledger'
  | 'analytics'
  | 'pools'
  | 'audit'
  | 'settings';
