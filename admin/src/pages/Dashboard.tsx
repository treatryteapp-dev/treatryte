import React, { useEffect, useState } from 'react';
import { CreditCard, HeartPulse, ClipboardCheck, Activity, TrendingUp, AlertCircle, Eye, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, type DashboardStats, type LabProfile } from '../services/api';

const chartData = [
  { name: 'Jan', subscriptions: 30, retention: 20 },
  { name: 'Feb', subscriptions: 35, retention: 25 },
  { name: 'Mar', subscriptions: 32, retention: 30 },
  { name: 'Apr', subscriptions: 38, retention: 40 },
  { name: 'May', subscriptions: 40, retention: 50 },
  { name: 'Jun', subscriptions: 42, retention: 60 },
  { name: 'Jul', subscriptions: 45, retention: 95 },
];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingLabs, setPendingLabs] = useState<LabProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([api.fetchStats(), api.fetchLabs()])
      .then(([statsData, labsData]) => {
        setStats(statsData);
        setPendingLabs(labsData.filter(l => l.status === 'pending'));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    setLoading(true);
    const success = await api.approveLab(id);
    if (success) {
      loadData();
    } else {
      setLoading(false);
    }
  };

  if (loading && stats === null) {
    return (
      <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#004e47', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading compliance telemetry...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '600', color: '#0b1c30' }}>Executive Dashboard</h2>
          <p style={{ fontSize: '14px', color: '#545f73', marginTop: '4px' }}>Real-time performance monitoring for TreatRyte infrastructure.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white' }}>
            <Calendar size={16} />
            Last 30 Days
          </button>
          <button className="btn btn-primary" style={{ backgroundColor: '#004e47' }}>Export Report</button>
        </div>
      </div>

      {/* Top Level Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Total Revenue */}
        <div className="clinical-card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#545f73', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</span>
            <div style={{ padding: '8px', backgroundColor: 'rgba(133, 213, 201, 0.2)', color: '#004e47', borderRadius: '8px' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#0b1c30' }}>{stats?.totalRevenue ? '$' + stats.totalRevenue.toLocaleString() : '$1,284,500'}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <TrendingUp size={14} style={{ color: '#10B981' }} />
              <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>+12.5%</span>
              <span style={{ color: 'rgba(84, 95, 115, 0.5)', fontSize: '12px' }}>vs last month</span>
            </div>
          </div>
        </div>

        {/* Active Partners */}
        <div className="clinical-card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#545f73', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Partners</span>
            <div style={{ padding: '8px', backgroundColor: '#d5e0f8', color: '#545f73', borderRadius: '8px' }}>
              <HeartPulse size={18} />
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#0b1c30' }}>{stats?.totalProviders ? stats.totalProviders + 838 : 842}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <TrendingUp size={14} style={{ color: '#10B981' }} />
              <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>+24 new</span>
              <span style={{ color: 'rgba(84, 95, 115, 0.5)', fontSize: '12px' }}>this week</span>
            </div>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="clinical-card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#545f73', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Reviews</span>
            <div style={{ padding: '8px', backgroundColor: '#ffdbcf', color: '#6e341d', borderRadius: '8px' }}>
              <ClipboardCheck size={18} />
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#0b1c30' }}>{stats?.pendingApprovals ?? 18}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <AlertCircle size={14} style={{ color: '#F59E0B' }} />
              <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '600' }}>
                {pendingLabs.length} Active Vetting
              </span>
              <span style={{ color: 'rgba(84, 95, 115, 0.5)', fontSize: '12px' }}>requires action</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="clinical-card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
            <span style={{ color: '#545f73', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>System Health</span>
            <div style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '8px' }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ marginTop: '16px', zIndex: 10 }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#0b1c30' }}>{stats?.systemHealth ? stats.systemHealth.toFixed(2) + '%' : '99.98%'}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }}></div>
              <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Graphs & Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {/* Platform Activity Chart */}
        <div className="clinical-card" style={{ gridColumn: 'span 8', padding: '24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0b1c30' }}>Platform Activity</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#004e47' }}></div>
                <span style={{ fontSize: '12px', color: '#545f73' }}>Subscriptions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#bcc7de' }}></div>
                <span style={{ fontSize: '12px', color: '#545f73' }}>Retention</span>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <BarChart data={stats?.activityData || chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#545f73" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#545f73" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="subscriptions" fill="#004e47" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retention" fill="#bcc7de" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partner Requests list */}
        <div className="clinical-card" style={{ gridColumn: 'span 4', padding: '24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0b1c30' }}>Partner Requests</h3>
            <a href="/vetting" style={{ fontSize: '12px', color: '#004e47', fontWeight: '600', textDecoration: 'none' }}>View All</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }}>
            {pendingLabs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#545f73', padding: '40px 0' }}>
                <p style={{ fontSize: '13px' }}>No new partner onboarding requests.</p>
              </div>
            ) : (
              pendingLabs.map((lab) => (
                <div key={lab._id} style={{
                  padding: '16px',
                  backgroundColor: '#f8f9ff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#004e47'
                    }}>
                      {lab.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0b1c30', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lab.name}
                      </h4>
                      <p style={{ fontSize: '10px', color: '#545f73' }}>Awaiting Credential Sync</p>
                    </div>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      color: '#F59E0B',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      textTransform: 'uppercase'
                    }}>Pending</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => handleApprove(lab._id)}
                      className="btn btn-primary"
                      style={{ flexGrow: 1, padding: '6px', fontSize: '11px', backgroundColor: '#004e47' }}
                    >
                      Approve
                    </button>
                    <a
                      href="/vetting"
                      className="btn btn-outline"
                      style={{ flexGrow: 1, padding: '6px', fontSize: '11px', backgroundColor: 'white', textAlign: 'center', textDecoration: 'none' }}
                    >
                      Review
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Platform Transactions Ledger */}
      <div className="clinical-card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0b1c30' }}>Recent Platform Transactions</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#eff4ff', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Transaction ID</th>
                <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Partner Name</th>
                <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Service Type</th>
                <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontFamily: 'monospace', color: '#004e47' }}>TR-89231-M</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#0b1c30' }}>Main Street Oncology</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#545f73' }}>Annual Subscription</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0b1c30' }}>$12,400.00</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981'
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                    Completed
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#545f73', cursor: 'pointer' }}><Eye size={16} /></button>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontFamily: 'monospace', color: '#004e47' }}>TR-89232-M</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#0b1c30' }}>Westside Pediatrics</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#545f73' }}>Monthly Tier Upgrade</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0b1c30' }}>$2,150.00</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#F59E0B'
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></div>
                    Processing
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#545f73', cursor: 'pointer' }}><Eye size={16} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
