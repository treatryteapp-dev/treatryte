export interface LabProfile {
  _id: string;
  name: string;
  licenseNumber: string;
  address: string;
  services: string[];
  bankDetails: {
    bankCode?: string;
    bankName: string;
    accountNumber: string;
    accountName?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  accountNumber?: string;   // TreatRyte partner account number (assigned on approval)
  createdAt: string;
}

export interface LabDocument {
  id: string;
  fileName: string;
  mimeType: string;
  status: 'uploaded' | 'pending_upload';
  uploadedAt: string | null;
  url: string | null;      // Signed CloudFront URL; null if not yet confirmed
}

export interface OutstandingSettlement {
  lab: { _id: string; name: string; bankDetails: LabProfile['bankDetails'] };
  appointmentIds: string[];
  grossAmountKobo: number;
  platformFeeKobo: number;
  netAmountKobo: number;
  payoutReady: boolean;
}

export interface SettlementRecord {
  _id: string;
  labId: string;
  grossAmountKobo: number;
  platformFeeKobo: number;
  netAmountKobo: number;
  bankSnapshot: LabProfile['bankDetails'];
  status: 'processing' | 'pending' | 'completed' | 'failed';
  nombaTransferRef: string | null;
  createdAt: string;
  settledAt: string | null;
}

export interface Bank {
  code: string;
  name: string;
}

export interface PlatformSettings {
  partnerStatusWebhookUrl: string;
  serviceFeeKobo: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalProviders: number;
  approvedPartners: number;
  payingPatients: number;
  payingProviders: number;
  pendingApprovals: number;
  totalAppointments: number;
  totalRevenue: number;
  outstandingSettlementsKobo: number;
  systemHealth: number;
  activityData: Array<{ name: string; newSignups: number; appointments: number }>;
}

export interface Subscription {
  id: string;
  name: string;
  email: string;
  initial: string;
  type: 'Partner' | 'Individual';
  tier: string;
  mrr: number;
  status: 'active' | 'paused' | 'suspended';
}

export interface Plan {
  _id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  type: 'Partner' | 'Individual';
  features: string[];
  excludedFeatures?: string[];
  transactionSplit?: number;
  // Individual (patient) plans only - null/undefined means unlimited.
  maxVaultFolders?: number | null;
  maxVaultFiles?: number | null;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PlatformTransaction {
  id: string;
  transactionId: string;
  userName: string;
  category: string;
  amount: number;
  status: string;
  createdAt: string;
}

let API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('railway')
    ? 'https://treatryte-backend.up.railway.app'
    : 'http://localhost:4000');

if (API_BASE && !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
  API_BASE = `https://${API_BASE}`;
}

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Access tokens expire after 15 minutes server-side (see auth.service.js
// ACCESS_TOKEN_TTL). Without this, every authenticated call just started
// silently 401ing after 15 minutes of a session with no visible error -
// pages would render as empty/zero instead of prompting a re-login.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function clearSessionAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('adminUser');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * fetch() wrapper for authenticated admin endpoints. On a 401 (expired
 * access token) it refreshes once - deduped via `refreshPromise` so a
 * page firing several authenticated calls at once (e.g. Promise.all)
 * only triggers a single refresh - and retries the original request.
 * If the refresh token is also invalid, the session is cleared and the
 * user is sent back to /login instead of the page silently rendering
 * empty/zero data.
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { ...options, headers: { ...getHeaders(), ...(options.headers || {}) } });
  if (res.status !== 401) return res;

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
  }
  const refreshed = await refreshPromise;
  if (!refreshed) {
    clearSessionAndRedirect();
    return res;
  }

  return fetch(url, { ...options, headers: { ...getHeaders(), ...(options.headers || {}) } });
}

export const api = {
  async fetchStats(): Promise<DashboardStats> {
    const res = await authFetch(`${API_BASE}/api/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    const data = await res.json();
    return data.stats;
  },

  async fetchLabs(): Promise<LabProfile[]> {
    const res = await authFetch(`${API_BASE}/api/admin/labs`);
    if (!res.ok) throw new Error('Failed to fetch laboratories');
    const data = await res.json();
    return data.labs;
  },

  async approveLab(id: string): Promise<boolean> {
    const res = await authFetch(`${API_BASE}/api/admin/labs/${id}/approve`, { method: 'POST' });
    return res.ok;
  },

  async rejectLab(id: string, reason?: string): Promise<boolean> {
    const res = await authFetch(`${API_BASE}/api/admin/labs/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  },

  async fetchSubscriptions(): Promise<Subscription[]> {
    const res = await authFetch(`${API_BASE}/api/admin/subscriptions`);
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    const data = await res.json();
    return data.subscriptions;
  },

  async updateSubscriptionStatus(id: string, status: 'active' | 'paused' | 'suspended'): Promise<boolean> {
    const res = await authFetch(`${API_BASE}/api/admin/subscriptions/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    return res.ok;
  },

  async fetchTransactions(): Promise<PlatformTransaction[]> {
    const res = await authFetch(`${API_BASE}/api/admin/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    return data.transactions;
  },

  async fetchPlans(): Promise<Plan[]> {
    const res = await fetch(`${API_BASE}/api/plans`);
    if (!res.ok) throw new Error('Failed to fetch plans');
    const data = await res.json();
    return data.plans;
  },

  async createPlan(plan: Omit<Plan, '_id' | 'status' | 'createdAt'>): Promise<Plan> {
    const res = await authFetch(`${API_BASE}/api/admin/plans`, {
      method: 'POST',
      body: JSON.stringify(plan),
    });
    if (!res.ok) throw new Error('Failed to create plan');
    const data = await res.json();
    return data.plan;
  },

  async deletePlan(id: string): Promise<boolean> {
    const res = await authFetch(`${API_BASE}/api/admin/plans/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async updatePlan(id: string, plan: Partial<Omit<Plan, '_id' | 'createdAt'>>): Promise<Plan> {
    const res = await authFetch(`${API_BASE}/api/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    });
    if (!res.ok) throw new Error('Failed to update plan');
    const data = await res.json();
    return data.plan;
  },

  async fetchLabDocuments(labId: string): Promise<LabDocument[]> {
    const res = await authFetch(`${API_BASE}/api/admin/labs/${labId}/documents`);
    if (!res.ok) throw new Error('Failed to fetch lab documents');
    const data = await res.json();
    return data.documents;
  },

  async fetchSettlements(): Promise<{ outstanding: OutstandingSettlement[]; history: SettlementRecord[] }> {
    const res = await authFetch(`${API_BASE}/api/admin/settlements`);
    if (!res.ok) throw new Error('Failed to fetch settlements');
    return res.json();
  },

  async triggerSettlements(): Promise<{ processed: number; failed: number; skipped: number; totalAmountKobo: number }> {
    const res = await authFetch(`${API_BASE}/api/admin/settlements/trigger`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger settlements');
    const data = await res.json();
    return data.summary;
  },

  async fetchBanks(): Promise<Bank[]> {
    const res = await authFetch(`${API_BASE}/api/admin/banks`);
    if (!res.ok) throw new Error('Failed to fetch banks');
    const data = await res.json();
    return (data.banks || []).map((b: any) => ({ code: b.code ?? b.bankCode, name: b.name ?? b.bankName }));
  },

  async updateLabBankDetails(labId: string, bankCode: string, accountNumber: string): Promise<{ accountName: string }> {
    const res = await authFetch(`${API_BASE}/api/admin/labs/${labId}/bank-details`, {
      method: 'PATCH',
      body: JSON.stringify({ bankCode, accountNumber }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to verify bank details');
    }
    return res.json();
  },

  async updateAdminProfile(fullName: string, email: string, currentPassword: string): Promise<AdminUser> {
    const res = await authFetch(`${API_BASE}/api/admin/profile`, {
      method: 'PATCH',
      body: JSON.stringify({ fullName, email, currentPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update profile');
    }
    const data = await res.json();
    return data.user;
  },

  async fetchPlatformSettings(): Promise<PlatformSettings> {
    const res = await authFetch(`${API_BASE}/api/admin/settings`);
    if (!res.ok) throw new Error('Failed to fetch platform settings');
    const data = await res.json();
    return data.settings;
  },

  async updatePlatformSettings(partnerStatusWebhookUrl: string, serviceFeeKobo: number): Promise<PlatformSettings> {
    const res = await authFetch(`${API_BASE}/api/admin/settings`, {
      method: 'PATCH',
      body: JSON.stringify({ partnerStatusWebhookUrl, serviceFeeKobo }),
    });
    if (!res.ok) throw new Error('Failed to update platform settings');
    const data = await res.json();
    return data.settings;
  },

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getToken() {
    return localStorage.getItem('accessToken');
  },

  logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};
