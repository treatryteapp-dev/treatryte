import React, { useEffect, useState } from 'react';
import { CreditCard, HeartPulse, ClipboardCheck, Activity, AlertCircle, Eye, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, type DashboardStats, type LabProfile, type PlatformTransaction } from '../services/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingLabs, setPendingLabs] = useState<LabProfile[]>([]);
  const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([api.fetchStats(), api.fetchLabs(), api.fetchTransactions()])
      .then(([statsData, labsData, txData]) => {
        setStats(statsData);
        setPendingLabs(labsData.filter(l => l.status === 'pending'));
        setTransactions(txData);
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
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#0b1c30' }}>
              {stats?.totalRevenue !== undefined ? '₦' + stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '₦0.00'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Activity size={14} style={{ color: '#10B981' }} />
              <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>Live Ledger</span>
              <span style={{ color: 'rgba(84, 95, 115, 0.5)', fontSize: '12px' }}>audit sync</span>
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
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#0b1c30' }}>{stats?.totalProviders ?? 0}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <HeartPulse size={14} style={{ color: '#10B981' }} />
              <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>Live clinical</span>
              <span style={{ color: 'rgba(84, 95, 115, 0.5)', fontSize: '12px' }}>storefronts</span>
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
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#0b1c30' }}>{stats?.pendingApprovals ?? 0}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <AlertCircle size={14} style={{ color: '#F59E0B' }} />
              <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '600' }}>
                {stats?.pendingApprovals ?? 0} Active Vetting
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
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#0b1c30' }}>{stats?.systemHealth ? stats.systemHealth.toFixed(2) + '%' : '100%'}</h3>
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
              <BarChart data={stats?.activityData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              {transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontFamily: 'monospace', color: '#004e47' }}>{tx.transactionId}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#0b1c30' }}>{tx.userName}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#545f73' }}>{tx.category}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0b1c30' }}>
                    ₦{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor:
                        tx.status === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                        tx.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' :
                        'rgba(239, 68, 68, 0.1)',
                      color:
                        tx.status === 'success' ? '#10B981' :
                        tx.status === 'pending' ? '#F59E0B' :
                        '#EF4444'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor:
                          tx.status === 'success' ? '#10B981' :
                          tx.status === 'pending' ? '#F59E0B' :
                          '#EF4444'
                      }}></div>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button style={{ background: 'none', border: 'none', color: '#545f73', cursor: 'pointer' }}><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#545f73' }}>
                    No recent platform transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
