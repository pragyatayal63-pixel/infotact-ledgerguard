import type {
  ApiErrorPayload,
  ApiSuccessResponse,
  AuthData,
  LoginRequest,
  RegisterRequest,
  CreateTransactionRequest,
  CreateTransactionResponseData,
  ListTransactionsQuery,
  ListTransactionsResponseData,
  BalanceResponseData,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Token storage key in sessionStorage
const TOKEN_STORAGE_KEY = 'ledgerguard_auth_token';
const AUTH_REDIRECT_EVENT = 'ledgerguard_auth_required';

export const getStoredToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string): void => {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // SessionStorage unavailable
  }
};

export const clearStoredToken = (): void => {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // SessionStorage unavailable
  }
};

// Custom event dispatcher for 401 handling across UI
export const dispatchAuthRequired = (reason: string): void => {
  clearStoredToken();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_REDIRECT_EVENT, { detail: { reason } }));
  }
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiSuccessResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Security check: ensure x-tenant-id is NEVER sent
  delete headers['x-tenant-id'];

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiError(0, 'NETWORK_ERROR', err instanceof Error ? err.message : 'Network connection failure');
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorPayload = (body as { error?: ApiErrorPayload })?.error;
    const errorCode = errorPayload?.code || (response.status === 401 ? 'AUTH_REQUIRED' : 'UNKNOWN_ERROR');
    const errorMessage = errorPayload?.message || `Request failed with status ${response.status}`;

    // Handle token expiration or invalid token
    if (
      response.status === 401 &&
      (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID' || errorCode === 'AUTH_REQUIRED')
    ) {
      dispatchAuthRequired(errorMessage);
    }

    throw new ApiError(response.status, errorCode, errorMessage);
  }

  return body as ApiSuccessResponse<T>;
}

// Typed API Functions
export const api = {
  login: async (credentials: LoginRequest): Promise<ApiSuccessResponse<AuthData>> => {
    return request<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (payload: RegisterRequest): Promise<ApiSuccessResponse<AuthData>> => {
    return request<AuthData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createTransaction: async (
    payload: CreateTransactionRequest
  ): Promise<ApiSuccessResponse<CreateTransactionResponseData>> => {
    return request<CreateTransactionResponseData>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listTransactions: async (
    query: ListTransactionsQuery = {}
  ): Promise<ApiSuccessResponse<ListTransactionsResponseData>> => {
    const params = new URLSearchParams();
    if (query.accountId) params.set('accountId', query.accountId);
    if (query.type) params.set('type', query.type);
    if (query.status) params.set('status', query.status);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const qs = params.toString();
    const endpoint = `/transactions${qs ? `?${qs}` : ''}`;
    return request<ListTransactionsResponseData>(endpoint, { method: 'GET' });
  },

  getBalance: async (accountId: string): Promise<ApiSuccessResponse<BalanceResponseData>> => {
    return request<BalanceResponseData>(`/transactions/balance/${encodeURIComponent(accountId)}`, {
      method: 'GET',
    });
  },
};
