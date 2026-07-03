import React from 'react';
import { Landmark, ArrowUpRight, ArrowDownLeft, ReceiptText } from 'lucide-react';

const mockSettlements = [
  { id: '1', facility: 'Care Diagnostics', bank: 'Access Bank', account: '0098765432', amount: 1200000.00, status: 'completed', date: 'Oct 21, 2026' },
  { id: '2', facility: 'Medilab Nigeria', bank: 'Zenith Bank', account: '1012345678', amount: 850200.00, status: 'scheduled', date: 'Oct 24, 2026' },
  { id: '3', facility: 'Stitch Diagnostics Facility', bank: 'GTBank', account: '0123456789', amount: 150000.00, status: 'pending', date: 'Oct 24, 2026' },
];

export const Settlements: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>Nomba Settlement & Payouts</h1>
        <p>Manage partner bank settlements, wallet payouts, and transaction audits.</p>
      </div>

      {/* Financial Overview banner */}
      <div style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>TOTAL OUTSTANDING SETTLEMENTS</span>
          <h2 style={{ fontSize: '36px', color: 'white', fontWeight: '700', marginTop: '4px' }}>₦2,200,200.00</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px' }}>Scheduled for automatic processing on Oct 24, 2026.</p>
        </div>
        <button className="btn" style={{ backgroundColor: 'white', color: 'var(--color-primary)', fontWeight: '700' }}>
          Trigger Batch Settlement
        </button>
      </div>

      {/* Settlements Table */}
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Settlement Ledger</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Recipient Facility</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Bank Account Details</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Amount</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Settlement Date</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockSettlements.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <h4 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{tx.facility}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ID: #{tx.id}TXN</span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Landmark size={16} style={{ color: 'var(--color-text-muted)' }} />
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '13px' }}>{tx.account}</p>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{tx.bank}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-primary)' }}>₦{tx.amount.toLocaleString()}</span>
                </td>
                <td style={{ padding: '20px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{tx.date}</td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    backgroundColor:
                      tx.status === 'completed' ? 'var(--color-secondary-container)' :
                      tx.status === 'scheduled' ? 'rgba(59, 130, 246, 0.1)' :
                      'rgba(245, 158, 11, 0.1)',
                    color:
                      tx.status === 'completed' ? 'var(--color-secondary)' :
                      tx.status === 'scheduled' ? '#2563eb' :
                      '#d97706'
                  }}>
                    {tx.status === 'completed' && <ArrowDownLeft size={12} />}
                    {tx.status === 'scheduled' && <ArrowUpRight size={12} />}
                    {tx.status === 'pending' && <ReceiptText size={12} />}
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
