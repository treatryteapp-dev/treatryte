export interface LabProfile {
  _id: string;
  name: string;
  licenseNumber: string;
  address: string;
  services: string[];
  bankDetails: {
    bankName: string;
    accountNumber: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalProviders: number;
  pendingApprovals: number;
  totalAppointments: number;
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
    const res = await fetch('/api/admin/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    const data = await res.json();
    return data.stats;
  },

  async fetchLabs(): Promise<LabProfile[]> {
    const res = await fetch('/api/admin/labs', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch laboratories');
    const data = await res.json();
    return data.labs;
  },

  async approveLab(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/labs/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.ok;
  },

  async rejectLab(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/labs/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.ok;
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
