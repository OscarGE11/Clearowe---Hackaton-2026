const BASE_URL = 'http://localhost:3001';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  participants: Participant[];
  createdAt: string;
}

export interface ExpenseSplit {
  participant: Participant;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  rawText?: string;
  paidBy: Participant;
  splits: ExpenseSplit[];
  createdAt: string;
}

export interface BalanceEntry {
  participant: Participant;
  net: number;
}

export interface SettlementTransaction {
  from: Participant;
  to: Participant;
  amount: number;
}

export interface BalanceResponse {
  balances: BalanceEntry[];
  transactions: SettlementTransaction[];
}

export interface CreateExpenseManual {
  description: string;
  amount: number;
  paidById: string;
  participantIds: string[];
}

export interface CreateExpenseText {
  rawText: string;
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('clearowe_token');
}

export function setToken(token: string) {
  localStorage.setItem('clearowe_token', token);
}

export function clearToken() {
  localStorage.removeItem('clearowe_token');
}

// ── Core fetch ────────────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string) =>
      request<{ access_token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
  },

  groups: {
    list: () => request<Group[]>('/groups'),
    get: (id: string) => request<Group>(`/groups/${id}`),
    create: (name: string, participants: string[]) =>
      request<Group>('/groups', {
        method: 'POST',
        body: JSON.stringify({ name, participants }),
      }),
    addParticipant: (groupId: string, name: string) =>
      request<Participant>(`/groups/${groupId}/participants`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
  },

  expenses: {
    list: (groupId: string) => request<Expense[]>(`/groups/${groupId}/expenses`),
    create: (groupId: string, data: CreateExpenseManual | CreateExpenseText) =>
      request<Expense>(`/groups/${groupId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    remove: (id: string) => request<{ ok: boolean }>(`/expenses/${id}`, { method: 'DELETE' }),
  },

  balance: {
    get: (groupId: string) => request<BalanceResponse>(`/groups/${groupId}/balance`),
  },
};
