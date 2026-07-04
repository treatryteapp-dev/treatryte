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
  createdAt: string;
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

export interface DashboardStats {
  totalPatients: number;
  totalProviders: number;
  pendingApprovals: number;
  totalAppointments: number;
  totalRevenue: number;
  systemHealth: number;
  activityData: Array<{ name: string; subscriptions: number; retention: number }>;
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
  nombaPlanId?: string;
  transactionSplit?: number;
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

export const api = {
  async fetchStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    const data = await res.json();
    return data.stats;
  },

  async fetchLabs(): Promise<LabProfile[]> {
    const res = await fetch(`${API_BASE}/api/admin/labs`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch laboratories');
    const data = await res.json();
    return data.labs;
  },

  async approveLab(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/labs/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.ok;
  },

  async rejectLab(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/labs/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.ok;
  },

  async fetchSubscriptions(): Promise<Subscription[]> {
    const res = await fetch(`${API_BASE}/api/admin/subscriptions`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    const data = await res.json();
    return data.subscriptions;
  },

  async updateSubscriptionStatus(id: string, status: 'active' | 'paused' | 'suspended'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/subscriptions/${id}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.ok;
  },

  async fetchTransactions(): Promise<PlatformTransaction[]> {
    const res = await fetch(`${API_BASE}/api/admin/transactions`, { headers: getHeaders() });
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
    const res = await fetch(`${API_BASE}/api/admin/plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(plan),
    });
    if (!res.ok) throw new Error('Failed to create plan');
    const data = await res.json();
    return data.plan;
  },

  async deletePlan(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/plans/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.ok;
  },

  async fetchSettlements(): Promise<{ outstanding: OutstandingSettlement[]; history: SettlementRecord[] }> {
    const res = await fetch(`${API_BASE}/api/admin/settlements`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch settlements');
    return res.json();
  },

  async triggerSettlements(): Promise<{ processed: number; failed: number; skipped: number; totalAmountKobo: number }> {
    const res = await fetch(`${API_BASE}/api/admin/settlements/trigger`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to trigger settlements');
    const data = await res.json();
    return data.summary;
  },

  async fetchBanks(): Promise<Bank[]> {
    const res = await fetch(`${API_BASE}/api/admin/banks`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch banks');
    const data = await res.json();
    return (data.banks || []).map((b: any) => ({ code: b.code ?? b.bankCode, name: b.name ?? b.bankName }));
  },

  async updateLabBankDetails(labId: string, bankCode: string, accountNumber: string): Promise<{ accountName: string }> {
    const res = await fetch(`${API_BASE}/api/admin/labs/${labId}/bank-details`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ bankCode, accountNumber }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to verify bank details');
    }
    return res.json();
  },

  setToken(token: string) {
    localStorage.setItem('accessToken', token);
  },

  getToken() {
    return localStorage.getItem('accessToken');
  },

  logout() {
    localStorage.removeItem('accessToken');
  }
};
