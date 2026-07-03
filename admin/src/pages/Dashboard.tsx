import React, { useEffect, useState } from 'react';
import { Users, ShieldAlert, CalendarRange, HeartPulse, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, type DashboardStats } from '../services/api';

const chartData = [
  { name: 'Mon', transactions: 12, volume: 154000 },
  { name: 'Tue', transactions: 19, volume: 220000 },
  { name: 'Wed', transactions: 15, volume: 180000 },
  { name: 'Thu', transactions: 22, volume: 310000 },
  { name: 'Fri', transactions: 30, volume: 450000 },
  { name: 'Sat', transactions: 18, volume: 210000 },
  { name: 'Sun', transactions: 25, volume: 380000 },
];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading telemetry statistics...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Patients', value: stats?.totalPatients ?? 0, icon: Users, color: 'var(--color-primary)' },
    { title: 'Registered Partners', value: stats?.totalProviders ?? 0, icon: HeartPulse, color: 'var(--color-secondary)' },
    { title: 'Pending Vetting', value: stats?.pendingApprovals ?? 0, icon: ShieldAlert, color: (stats?.pendingApprovals ?? 0) > 0 ? 'var(--color-error)' : 'var(--color-text-secondary)' },
    { title: 'Total Appointments', value: stats?.totalAppointments ?? 0, icon: CalendarRange, color: 'var(--color-primary)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>Administrative Dashboard</h1>
        <p>System metrics, registered providers registry, and digital health vault analytics.</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{kpi.title}</p>
                <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{kpi.value}</span>
              </div>
              <div style={{
                backgroundColor: 'var(--color-background)',
                color: kpi.color,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex'
              }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Platform Activity Feed</h3>
            <p style={{ fontSize: '12px' }}>Total transaction volumes and patient bookings this week.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)', fontWeight: '600', fontSize: '14px' }}>
            <TrendingUp size={16} />
            +18.4% volume increase
          </div>
        </div>

        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v / 1000}k`} />
              <Tooltip formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Settlement Volume']} />
              <Area type="monotone" dataKey="volume" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
