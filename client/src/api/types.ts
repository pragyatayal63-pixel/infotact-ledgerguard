// API Types for LedgerGuard Backend Integration

export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
  idempotentReplay?: boolean;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Auth Models
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface CompanyProfile {
  name: string;
  tenantId: string;
}

export interface AuthData {
  token: string;
  user: UserProfile;
  company: CompanyProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  companyName: string;
  tenantId: string;
  name: string;
  email: string;
  password: string;
}

// Transaction Models
export type TransactionType = 'credit' | 'debit';
export type BackendTransactionStatus = 'completed' | 'pending' | 'failed';

export interface TransactionRecord {
  _id: string;
  eventId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: BackendTransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  eventId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  simulateFailure?: boolean;
}

export interface CreateTransactionResponseData {
  transaction: TransactionRecord;
  balance: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListTransactionsQuery {
  accountId?: string;
  type?: TransactionType;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListTransactionsResponseData {
  transactions: TransactionRecord[];
  pagination: PaginationInfo;
}

export interface BalanceResponseData {
  accountId: string;
  balance: number;
  currency: string;
  updatedAt: string;
}
