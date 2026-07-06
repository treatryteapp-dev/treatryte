import React, { useEffect, useState } from 'react';
import { CheckCircle, PauseCircle, Ban, PlayCircle, ArrowRight, Plus, Tag, XCircle, Check } from 'lucide-react';
import { api, type Subscription, type Plan } from '../services/api';

export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'plans'>('subscribers');

  // Filters for Subscribers Ledger
  const [ledgerView, setLedgerView] = useState<'paying' | 'all'>('paying');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Partners' | 'Individuals'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');

  // Create / Edit Plan Form States
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planType, setPlanType] = useState<'Partner' | 'Individual'>('Partner');
  const [planInterval, setPlanInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [planFeatures, setPlanFeatures] = useState('');
  const [planExcludedFeatures, setPlanExcludedFeatures] = useState('');
  const [transactionSplit, setTransactionSplit] = useState('');
  const [submittingPlan, setSubmittingPlan] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.fetchSubscriptions(), api.fetchPlans()])
      .then(([subData, planData]) => {
        setSubscriptions(subData);
        setPlans(planData);
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

  const handleStatusChange = async (id: string, newStatus: 'active' | 'paused' | 'suspended') => {
    setLoading(true);
    const success = await api.updateSubscriptionStatus(id, newStatus);
    if (success) {
      loadData();
    } else {
      setLoading(false);
    }
  };

  // Open modal in "Create" mode (no pre-population)
  const openCreateModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanPrice('');
    setPlanType('Partner');
    setPlanInterval('monthly');
    setPlanFeatures('');
    setPlanExcludedFeatures('');
    setTransactionSplit('');
    setShowCreatePlanModal(true);
  };

  // Open modal in "Edit" mode pre-populated with existing plan data
  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanPrice(String(plan.price));
    setPlanType(plan.type);
    setPlanInterval(plan.interval);
    setPlanFeatures((plan.features || []).join(', '));
    setPlanExcludedFeatures((plan.excludedFeatures || []).join(', '));
    setTransactionSplit(plan.transactionSplit !== undefined ? String(plan.transactionSplit) : '');
    setShowCreatePlanModal(true);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim() || !planPrice.trim()) return;
    setSubmittingPlan(true);
    try {
      const payload = {
        name: planName,
        price: Number(planPrice),
        type: planType,
        interval: planInterval,
        features: planFeatures.split(',').map(f => f.trim()).filter(Boolean),
        excludedFeatures: planExcludedFeatures.split(',').map(f => f.trim()).filter(Boolean),
        transactionSplit: transactionSplit ? Number(transactionSplit) : undefined,
      };

      if (editingPlan) {
        await api.updatePlan(editingPlan._id, payload);
      } else {
        await api.createPlan(payload);
      }

      setShowCreatePlanModal(false);
      setEditingPlan(null);
      loadData();
    } catch (err) {
      console.error('Failed to save subscription plan', err);
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel and delete this subscription plan?')) return;
    setLoading(true);
    try {
      const success = await api.deletePlan(id);
      if (success) {
        loadData();
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to delete subscription plan', err);
      setLoading(false);
    }
  };

  // Calculations for KPI Cards
  const activeCount = subscriptions.filter(s => s.status === 'active' && s.mrr > 0).length;
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
    // Ledger view: paying subscribers only, or every registered account
    if (ledgerView === 'paying' && item.mrr <= 0) return false;

    // Type Filter
    if (typeFilter === 'Partners' && item.type !== 'Partner') return false;
    if (typeFilter === 'Individuals' && item.type !== 'Individual') return false;

    // Status Filter
    if (statusFilter !== 'All' && item.status !== statusFilter.toLowerCase()) return false;

    // Tier Filter
    if (tierFilter !== 'All' && item.tier !== tierFilter) return false;

    return true;
  });

  // Extract unique plan tiers from subscriptions for filter options
  const uniqueTiers = Array.from(new Set(subscriptions.map(s => s.tier)));
  const payingCount = subscriptions.filter(s => s.mrr > 0).length;

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
              ₦{revenueAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <PauseCircle size={22} />
            </div>
            <p style={{ fontSize: '12px', color: '#545f73' }}>Paused Billing</p>
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

      {/* Tab Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginTop: '8px' }}>
        <button
          onClick={() => { setActiveTab('subscribers'); loadData(); }}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: activeTab === 'subscribers' ? '700' : '500',
            color: activeTab === 'subscribers' ? '#004e47' : '#545f73',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'subscribers' ? '2px solid #004e47' : 'none',
            cursor: 'pointer'
          }}
        >
          Subscribers Ledger
        </button>
        <button
          onClick={() => { setActiveTab('plans'); loadData(); }}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: activeTab === 'plans' ? '700' : '500',
            color: activeTab === 'plans' ? '#004e47' : '#545f73',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'plans' ? '2px solid #004e47' : 'none',
            cursor: 'pointer'
          }}
        >
          Billing Tiers & Plans
        </button>
      </div>

      {activeTab === 'subscribers' ? (
        <>
          {/* Ledger view: paying subscribers vs every registered account */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
            <button
              onClick={() => setLedgerView('paying')}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: ledgerView === 'paying' ? '700' : '500',
                color: ledgerView === 'paying' ? '#004e47' : '#545f73',
                border: 'none',
                background: 'none',
                borderBottom: ledgerView === 'paying' ? '2px solid #004e47' : 'none',
                cursor: 'pointer'
              }}
            >
              Paying Subscribers ({payingCount})
            </button>
            <button
              onClick={() => setLedgerView('all')}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: ledgerView === 'all' ? '700' : '500',
                color: ledgerView === 'all' ? '#004e47' : '#545f73',
                border: 'none',
                background: 'none',
                borderBottom: ledgerView === 'all' ? '2px solid #004e47' : 'none',
                cursor: 'pointer'
              }}
            >
              All Users ({totalCount})
            </button>
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
                    fontWeight: typeFilter === 'All' ? '700' : '500',
                    backgroundColor: typeFilter === 'All' ? '#004e47' : 'transparent',
                    color: typeFilter === 'All' ? 'white' : '#545f73',
                    border: 'none',
                    borderRadius: '6px'
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
                    fontWeight: typeFilter === 'Partners' ? '700' : '500',
                    backgroundColor: typeFilter === 'Partners' ? '#004e47' : 'transparent',
                    color: typeFilter === 'Partners' ? 'white' : '#545f73',
                    border: 'none',
                    borderRadius: '6px'
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
                    fontWeight: typeFilter === 'Individuals' ? '700' : '500',
                    backgroundColor: typeFilter === 'Individuals' ? '#004e47' : 'transparent',
                    color: typeFilter === 'Individuals' ? 'white' : '#545f73',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                >
                  Individual Users
                </button>
              </div>

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', backgroundColor: 'white', color: '#0b1c30', fontWeight: '600' }}
              >
                <option value="All">All Tiers</option>
                {uniqueTiers.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', backgroundColor: 'white', color: '#0b1c30', fontWeight: '600' }}
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Subscribers Ledger Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>{ledgerView === 'paying' ? 'Subscriber' : 'User'}</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Account Type</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Plan Tier</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Monthly MRR</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#545f73', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: item.type === 'Partner' ? 'rgba(0,78,71,0.08)' : 'rgba(99,102,241,0.08)',
                            color: item.type === 'Partner' ? '#004e47' : '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '700'
                          }}>
                            {item.initial}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0b1c30' }}>{item.name || 'Anonymous User'}</h4>
                            <p style={{ fontSize: '11px', color: '#545f73' }}>{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#0b1c30', fontWeight: '600' }}>
                        <span style={{
                          backgroundColor: item.type === 'Partner' ? 'rgba(0,78,71,0.05)' : 'rgba(99,102,241,0.05)',
                          color: item.type === 'Partner' ? '#004e47' : '#4f46e5',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {item.type}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#545f73', fontWeight: '500' }}>{item.tier}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0b1c30', fontWeight: '700' }}>
                        ₦{item.mrr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor:
                            item.status === 'active' ? 'rgba(16, 185, 129, 0.1)' :
                            item.status === 'paused' ? 'rgba(245, 158, 11, 0.1)' :
                            'rgba(239, 68, 68, 0.1)',
                          color:
                            item.status === 'active' ? '#10B981' :
                            item.status === 'paused' ? '#F59E0B' :
                            '#EF4444'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor:
                              item.status === 'active' ? '#10B981' :
                              item.status === 'paused' ? '#F59E0B' :
                              '#EF4444'
                          }}></div>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {item.status !== 'active' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'active')}
                              title="Activate Contract"
                              style={{ border: 'none', background: 'none', color: '#10B981', cursor: 'pointer', padding: '4px' }}
                            >
                              <PlayCircle size={18} />
                            </button>
                          )}
                          {item.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'paused')}
                              title="Pause Subscription"
                              style={{ border: 'none', background: 'none', color: '#F59E0B', cursor: 'pointer', padding: '4px' }}
                            >
                              <PauseCircle size={18} />
                            </button>
                          )}
                          {item.status !== 'suspended' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'suspended')}
                              title="Suspend Account"
                              style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                            >
                              <Ban size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubscribers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#545f73' }}>
                        {ledgerView === 'paying' ? 'No paying subscribers match the current filter criteria.' : 'No users match the current filter criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#545f73', marginBottom: '4px' }}>
                    <span>Partner Institutions</span>
                    <span style={{ fontWeight: '700', color: '#0b1c30' }}>
                      {subscriptions.filter(s => s.type === 'Partner').length} accounts
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#eceef0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: '#004e47',
                      width: `${(subscriptions.filter(s => s.type === 'Partner').length / (totalCount || 1)) * 100}%`
                    }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#545f73', marginBottom: '4px' }}>
                    <span>Individual Patients</span>
                    <span style={{ fontWeight: '700', color: '#0b1c30' }}>
                      {subscriptions.filter(s => s.type === 'Individual').length} accounts
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#eceef0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: '#4f46e5',
                      width: `${(subscriptions.filter(s => s.type === 'Individual').length / (totalCount || 1)) * 100}%`
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Subscription Plans Layout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0b1c30' }}>Active Pricing Templates</h3>
              <p style={{ fontSize: '13px', color: '#545f73', marginTop: '2px' }}>Configure subscription tiers and features available for providers and patients.</p>
            </div>
            <button
              onClick={openCreateModal}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#004e47', padding: '10px 18px' }}
            >
              <Plus size={16} />
              Create Subscription Plan
            </button>
          </div>

          {/* Grid of Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px', marginTop: '8px' }}>
            {plans.map((plan) => (
              <div
                key={plan._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.01)',
                  position: 'relative'
                }}
              >
                {/* Badge for Type */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    backgroundColor: plan.type === 'Partner' ? 'rgba(0,78,71,0.08)' : 'rgba(99,102,241,0.08)',
                    color: plan.type === 'Partner' ? '#004e47' : '#4f46e5'
                  }}>
                    {plan.type === 'Partner' ? 'Partner / Provider' : 'Individual / Patient'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                    ACTIVE
                  </span>
                </div>

                {/* Plan Info */}
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#0b1c30' }}>{plan.name}</h4>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#004e47', marginTop: '12px' }}>
                    ₦{plan.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    <span style={{ fontSize: '13px', color: '#545f73', fontWeight: '500' }}> / {plan.interval}</span>
                  </h2>
                  {plan.transactionSplit !== undefined && plan.transactionSplit > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: '600', color: '#D97706' }}>
                      Nomba Split Fee: <span style={{ fontWeight: '700' }}>{plan.transactionSplit}%</span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', flexGrow: 1 }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                    Included Features
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {plan.features.map((feat, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '13px', color: '#0b1c30' }}>
                        <Check size={14} style={{ color: '#10B981', marginTop: '2px', flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                    {plan.features.length === 0 && (
                      <li style={{ fontSize: '12px', color: '#545f73', fontStyle: 'italic' }}>
                        No special features specified.
                      </li>
                    )}
                  </ul>
                </div>

                {plan.excludedFeatures && plan.excludedFeatures.length > 0 && (
                  <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '12px', marginTop: '12px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      Not Included
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {plan.excludedFeatures.map((feat, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '12.5px', color: '#94A3B8', textDecoration: 'line-through' }}>
                          <XCircle size={13} style={{ color: '#FDA4AF', marginTop: '2px', flexShrink: 0 }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons: Edit + Delete */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button
                    onClick={() => openEditModal(plan)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #004e47',
                      borderRadius: '8px',
                      color: '#004e47',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Edit Plan
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderColor: '#EF4444',
                      border: '1px solid #EF4444',
                      borderRadius: '8px',
                      color: '#EF4444',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel Plan
                  </button>
                </div>
              </div>
            ))}

            {plans.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <Tag size={40} style={{ color: '#bcc7de', marginBottom: '16px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30' }}>No plans configured yet</h4>
                <p style={{ fontSize: '13px', color: '#545f73', marginTop: '4px', maxWidth: '360px', marginInline: 'auto' }}>
                  Create subscription tiers to enable automated billing rules for provider signups and patient portals.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Plan Modal */}
      {showCreatePlanModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 28, 48, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <form
            onSubmit={handleCreatePlan}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '512px',
              maxHeight: '90vh',
              border: '1px solid #E2E8F0',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Fixed modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0b1c30', margin: 0 }}>
                {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create Subscription Plan'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowCreatePlanModal(false); setEditingPlan(null); }}
                style={{ background: 'none', border: 'none', color: '#545f73', cursor: 'pointer' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Scrollable fields area */}
            <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#545f73', marginBottom: '8px', textTransform: 'uppercase' }}>Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Enterprise Bundle"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#545f73', marginBottom: '8px', textTransform: 'uppercase' }}>Price (NGN)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#545f73', marginBottom: '8px', textTransform: 'uppercase' }}>Billing Interval</label>
                  <select
                    value={planInterval}
                    onChange={(e) => setPlanInterval(e.target.value as any)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#545f73', marginBottom: '8px', textTransform: 'uppercase' }}>Target Audience</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}
                >
                  <option value="Partner">Partner (Clinical/Provider)</option>
                  <option value="Individual">Individual (Patient)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#545f73', marginBottom: '8px', textTransform: 'uppercase' }}>Nomba Split Platform Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 1.5"
                    value={transactionSplit}
                    onChange={(e) => setTransactionSplit(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#545f73', marginBottom: '8px', textTransform: 'uppercase' }}>Plan Features</label>
                <textarea
                  placeholder="Feature 1, Feature 2, Feature 3..."
                  rows={3}
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
                <span style={{ fontSize: '10px', color: '#545f73', display: 'block', marginTop: '4px' }}>Provide a comma-separated list of items included in this plan.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#545f73', marginBottom: '8px', textTransform: 'uppercase' }}>Plan Excluded Features (Optional)</label>
                <textarea
                  placeholder="Excluded Feature 1, Excluded Feature 2..."
                  rows={3}
                  value={planExcludedFeatures}
                  onChange={(e) => setPlanExcludedFeatures(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
                <span style={{ fontSize: '10px', color: '#545f73', display: 'block', marginTop: '4px' }}>Provide a comma-separated list of items NOT included in this plan (crossed out on cards).</span>
              </div>
            </div>

            {/* Fixed modal footer */}
            <div style={{ display: 'flex', gap: '16px', padding: '16px 24px', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => { setShowCreatePlanModal(false); setEditingPlan(null); }}
                className="btn btn-outline"
                style={{ flexGrow: 1, padding: '12px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPlan || !planName.trim() || !planPrice.trim()}
                className="btn btn-primary"
                style={{ flexGrow: 1, padding: '12px', backgroundColor: '#004e47' }}
              >
                {submittingPlan ? 'Saving...' : editingPlan ? 'Update Plan' : 'Save Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
