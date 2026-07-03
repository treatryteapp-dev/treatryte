import React, { useEffect, useState } from 'react';
import { CheckCircle, PauseCircle, Ban, PlayCircle, ArrowRight } from 'lucide-react';
import { api, type Subscription } from '../services/api';

export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<'All' | 'Partners' | 'Individuals'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');

  const loadSubscriptions = () => {
    setLoading(true);
    api.fetchSubscriptions()
      .then((data) => {
        setSubscriptions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'active' | 'paused' | 'suspended') => {
    setLoading(true);
    const success = await api.updateSubscriptionStatus(id, newStatus);
    if (success) {
      loadSubscriptions();
    } else {
      setLoading(false);
    }
  };

  // Calculations for KPI Cards
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const pausedCount = subscriptions.filter(s => s.status === 'paused').length;
  const suspendedCount = subscriptions.filter(s => s.status === 'suspended').length;
  const totalCount = subscriptions.length;

  const retentionRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 100;
  const retentionOffset = 251.2 - (251.2 * retentionRate) / 100;

  // Calculate MRR at Risk (MRR of suspended & paused accounts)
  const revenueAtRisk = subscriptions
    .filter(s => s.status === 'suspended' || s.status === 'paused')
    .reduce((sum, s) => sum + s.mrr, 0);

  // Calculate total MRR percentage at risk
  const totalMRR = subscriptions.reduce((sum, s) => sum + s.mrr, 0) || 1;
  const atRiskPercentage = ((revenueAtRisk / totalMRR) * 100).toFixed(1);

  // Filtered subscribers
  const filteredSubscribers = subscriptions.filter(item => {
    // Type Filter
    if (typeFilter === 'Partners' && item.type !== 'Partner') return false;
    if (typeFilter === 'Individuals' && item.type !== 'Individual') return false;

    // Status Filter
    if (statusFilter !== 'All' && item.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

    // Tier Filter
    if (tierFilter !== 'All') {
      if (tierFilter === 'Enterprise' && !item.tier.includes('Enterprise')) return false;
      if (tierFilter === 'Standard' && !item.tier.includes('Standard')) return false;
    }

    return true;
  });

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#004e47', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading subscription contracts...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#0b1c30' }}>Subscription Management Hub</h2>
        <p style={{ fontSize: '14px', color: '#545f73', marginTop: '4px' }}>Manage billing states, suspended profiles, and subscription tier upgrades.</p>
      </div>

      {/* Top Bento Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        {/* Revenue at Risk Card */}
        <div style={{
          gridColumn: 'span 4',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Revenue At Risk
            </p>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: revenueAtRisk > 0 ? '#EF4444' : '#10B981', marginTop: '8px' }}>
              ${revenueAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p style={{ fontSize: '13px', color: '#545f73', marginTop: '4px' }}>
              Impact from <span style={{ fontWeight: '700' }}>{pausedCount + suspendedCount}</span> inactive accounts
            </p>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '8px', flexGrow: 1, backgroundColor: '#eceef0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: revenueAtRisk > 0 ? '#EF4444' : '#10B981', width: `${Math.min(parseFloat(atRiskPercentage) || 0, 100)}%` }}></div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: revenueAtRisk > 0 ? '#EF4444' : '#10B981' }}>{atRiskPercentage}% Total</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          
          {/* Active Subscriptions */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle size={22} />
            </div>
            <p style={{ fontSize: '12px', color: '#545f73' }}>Active Subscriptions</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0b1c30', marginTop: '4px' }}>{activeCount}</h3>
            <p style={{ fontSize: '11px', color: '#10B981', marginTop: '8px', fontWeight: '600' }}>
              {((activeCount / (totalCount || 1)) * 100).toFixed(1)}% of total
            </p>
          </div>

          {/* Paused Accounts */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eceef0', color: '#545f73', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <PauseCircle size={22} />
            </div>
            <p style={{ fontSize: '12px', color: '#545f73' }}>Paused Accounts</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0b1c30', marginTop: '4px' }}>{pausedCount}</h3>
            <p style={{ fontSize: '11px', color: '#545f73', marginTop: '8px' }}>
              Awaiting billing resolution
            </p>
          </div>

          {/* Suspended Accounts */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Ban size={22} />
            </div>
            <p style={{ fontSize: '12px', color: '#545f73' }}>Suspended</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0b1c30', marginTop: '4px' }}>{suspendedCount}</h3>
            <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '8px', fontWeight: '700' }}>
              Policy/Audit violations
            </p>
          </div>

        </div>
      </div>

      {/* Controls & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: '#ffffff', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <button
              className="btn"
              onClick={() => setTypeFilter('All')}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                backgroundColor: typeFilter === 'All' ? '#e6f4f2' : 'transparent',
                color: typeFilter === 'All' ? '#004e47' : '#545f73',
                fontWeight: typeFilter === 'All' ? '700' : '400'
              }}
            >
              All
            </button>
            <button
              className="btn"
              onClick={() => setTypeFilter('Partners')}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                backgroundColor: typeFilter === 'Partners' ? '#e6f4f2' : 'transparent',
                color: typeFilter === 'Partners' ? '#004e47' : '#545f73',
                fontWeight: typeFilter === 'Partners' ? '700' : '400'
              }}
            >
              Partners
            </button>
            <button
              className="btn"
              onClick={() => setTypeFilter('Individuals')}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                backgroundColor: typeFilter === 'Individuals' ? '#e6f4f2' : 'transparent',
                color: typeFilter === 'Individuals' ? '#004e47' : '#545f73',
                fontWeight: typeFilter === 'Individuals' ? '700' : '400'
              }}
            >
              Individual Users
            </button>
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: '#191c1e' }}
          >
            <option value="All">All Tiers</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Standard">Standard</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: '#191c1e' }}
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#eff4ff', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase' }}>Subscriber</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase' }}>Account Type</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase' }}>Plan Tier</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase' }}>Monthly MRR</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#a1f1e5',
                      color: '#004e47',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {item.initial}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0b1c30' }}>{item.name}</h4>
                      <span style={{ fontSize: '11px', color: '#545f73' }}>ID: {item.id}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#eceef0', color: '#545f73', padding: '4px 10px', borderRadius: '12px' }}>
                    {item.type}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '500', color: '#191c1e' }}>{item.tier}</td>
                <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '700', color: '#004e47' }}>${item.mrr.toLocaleString()}</td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor:
                      item.status === 'active' ? '#6cf8bb' :
                      item.status === 'paused' ? '#e1e2e5' :
                      'rgba(239, 68, 68, 0.1)',
                    color:
                      item.status === 'active' ? '#00714d' :
                      item.status === 'paused' ? '#191c1e' :
                      '#EF4444'
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {item.status !== 'active' && (
                      <button
                        className="btn btn-outline"
                        title="Activate"
                        onClick={() => handleStatusChange(item.id, 'active')}
                        style={{ padding: '6px', backgroundColor: 'white', color: '#10B981', border: '1px solid #10B981' }}
                      >
                        <PlayCircle size={16} />
                      </button>
                    )}
                    {item.status === 'active' && (
                      <button
                        className="btn btn-outline"
                        title="Pause Billing"
                        onClick={() => handleStatusChange(item.id, 'paused')}
                        style={{ padding: '6px', backgroundColor: 'white', color: '#F59E0B', border: '1px solid #F59E0B' }}
                      >
                        <PauseCircle size={16} />
                      </button>
                    )}
                    {item.status !== 'suspended' && (
                      <button
                        className="btn btn-outline"
                        title="Suspend Profile"
                        onClick={() => handleStatusChange(item.id, 'suspended')}
                        style={{ padding: '6px', backgroundColor: 'white', color: '#EF4444', border: '1px solid #EF4444' }}
                      >
                        <Ban size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredSubscribers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#545f73' }}>
                  No subscribers match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Retention Rate & Account Type Distribution charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Retention radial gauge */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative', width: '96px', height: '96px' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="48" cy="48" r="40" fill="transparent" stroke="#eceef0" strokeWidth="8" />
              <circle cx="48" cy="48" r="40" fill="transparent" stroke="#004e47" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={retentionOffset} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#0b1c30' }}>{retentionRate}%</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30' }}>Subscriber Retention</h4>
            <p style={{ fontSize: '13px', color: '#545f73', marginTop: '4px', maxWidth: '300px' }}>
              Your retention rate is currently {retentionRate}% based on {activeCount} active out of {totalCount} total subscriber accounts.
            </p>
            <button style={{ border: 'none', background: 'none', color: '#004e47', fontSize: '12px', fontWeight: '700', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              View detailed report
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Account distribution */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30', marginBottom: '16px' }}>Account Type Distribution</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#545f73' }}>Partner Institutions</span>
                <span style={{ fontWeight: '700' }}>
                  {subscriptions.filter(s => s.type === 'Partner').length} (
                  {((subscriptions.filter(s => s.type === 'Partner').length / (totalCount || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#eceef0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#004e47', width: `${(subscriptions.filter(s => s.type === 'Partner').length / (totalCount || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#545f73' }}>Individual Healthcare Users</span>
                <span style={{ fontWeight: '700' }}>
                  {subscriptions.filter(s => s.type === 'Individual').length} (
                  {((subscriptions.filter(s => s.type === 'Individual').length / (totalCount || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#eceef0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#bcc7de', width: `${(subscriptions.filter(s => s.type === 'Individual').length / (totalCount || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
