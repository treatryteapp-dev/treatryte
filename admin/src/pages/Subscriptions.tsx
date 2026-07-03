import React from 'react';
import { CheckCircle, PauseCircle, Ban, PlayCircle, Eye, ArrowRight } from 'lucide-react';

const mockSubscribers = [
  { id: 'VA-98231-P', name: 'Nexus Health Systems', initial: 'NH', type: 'Partner', tier: 'Enterprise Core', mrr: 12450.00, status: 'active' },
  { id: 'VA-11044-U', name: 'Sarah Al-Mansour', initial: 'SA', type: 'Individual', tier: 'Professional', mrr: 299.00, status: 'paused' },
  { id: 'VA-00512-P', name: 'BlueLine Diagnostics', initial: 'BL', type: 'Partner', tier: 'Standard Bundle', mrr: 4800.00, status: 'suspended' },
  { id: 'VA-77291-P', name: 'Oak Medical Group', initial: 'OM', type: 'Partner', tier: 'Enterprise Premium', mrr: 25600.00, status: 'active' },
];

export const Subscriptions: React.FC = () => {
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
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#EF4444', marginTop: '8px' }}>$42,850.00</h2>
            <p style={{ fontSize: '13px', color: '#545f73', marginTop: '4px' }}>
              Impact from <span style={{ fontWeight: '700' }}>124</span> suspended accounts
            </p>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '8px', flexGrow: 1, backgroundColor: '#eceef0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: '#EF4444', width: '18%' }}></div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#EF4444' }}>18.2% Total</span>
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
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0b1c30', marginTop: '4px' }}>2,482</h3>
            <p style={{ fontSize: '11px', color: '#10B981', marginTop: '8px', fontWeight: '600' }}>
              +4.2% MoM
            </p>
          </div>

          {/* Paused Accounts */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eceef0', color: '#545f73', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <PauseCircle size={22} />
            </div>
            <p style={{ fontSize: '12px', color: '#545f73' }}>Paused Accounts</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0b1c30', marginTop: '4px' }}>86</h3>
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
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0b1c30', marginTop: '4px' }}>38</h3>
            <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '8px', fontWeight: '700' }}>
              Policy violations
            </p>
          </div>

        </div>
      </div>

      {/* Controls & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: '#ffffff', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <button className="btn" style={{ padding: '6px 16px', fontSize: '12px', backgroundColor: '#e6f4f2', color: '#004e47', fontWeight: '700' }}>All</button>
            <button className="btn" style={{ padding: '6px 16px', fontSize: '12px', backgroundColor: 'transparent', color: '#545f73' }}>Partners</button>
            <button className="btn" style={{ padding: '6px 16px', fontSize: '12px', backgroundColor: 'transparent', color: '#545f73' }}>Individual Users</button>
          </div>
          <select style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: '#191c1e' }}>
            <option>All Tiers</option>
            <option>Enterprise</option>
            <option>Professional</option>
            <option>Standard</option>
          </select>
          <select style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: '#191c1e' }}>
            <option>Status: All</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Suspended</option>
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
            {mockSubscribers.map((item) => (
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
                    {item.status === 'paused' && (
                      <button className="btn btn-outline" style={{ padding: '6px', backgroundColor: 'white' }}><PlayCircle size={16} /></button>
                    )}
                    <button className="btn btn-outline" style={{ padding: '6px', backgroundColor: 'white' }}><Ban size={16} /></button>
                    <button className="btn btn-outline" style={{ padding: '6px', backgroundColor: 'white' }}><Eye size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
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
              <circle cx="48" cy="48" r="40" fill="transparent" stroke="#004e47" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="45" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#0b1c30' }}>82%</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30' }}>Subscriber Retention</h4>
            <p style={{ fontSize: '13px', color: '#545f73', marginTop: '4px', maxWidth: '300px' }}>
              Your retention rate has improved by 2.4% since the last audit period.
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
                <span style={{ fontWeight: '700' }}>642 (24.6%)</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#eceef0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#004e47', width: '24.6%' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#545f73' }}>Individual Healthcare Users</span>
                <span style={{ fontWeight: '700' }}>1,964 (75.4%)</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#eceef0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#bcc7de', width: '75.4%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
