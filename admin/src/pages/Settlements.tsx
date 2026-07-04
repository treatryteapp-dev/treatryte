import React, { useEffect, useState } from 'react';
import { Landmark, ArrowUpRight, ArrowDownLeft, ReceiptText, AlertTriangle } from 'lucide-react';
import { api, type OutstandingSettlement, type SettlementRecord, type Bank } from '../services/api';

const formatNaira = (kobo: number) => `₦${(kobo / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const Settlements: React.FC = () => {
  const [outstanding, setOutstanding] = useState<OutstandingSettlement[]>([]);
  const [history, setHistory] = useState<SettlementRecord[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);
  const [editingLabId, setEditingLabId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState({ bankCode: '', accountNumber: '' });
  const [savingBank, setSavingBank] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.fetchSettlements()
      .then(({ outstanding, history }) => {
        setOutstanding(outstanding);
        setHistory(history);
      })
      .catch((err) => console.error('Failed to load settlements', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.fetchBanks().then(setBanks).catch((err) => console.error('Failed to load banks', err));
  }, []);

  const totalOutstandingKobo = outstanding.reduce((sum, o) => sum + o.netAmountKobo, 0);
  const readyCount = outstanding.filter(o => o.payoutReady).length;

  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerResult(null);
    try {
      const summary = await api.triggerSettlements();
      setTriggerResult(`Processed ${summary.processed}, failed ${summary.failed}, skipped ${summary.skipped} (missing bank details) — ${formatNaira(summary.totalAmountKobo)} sent.`);
      load();
    } catch (err) {
      setTriggerResult('Batch settlement failed to run. Check backend logs.');
    } finally {
      setTriggering(false);
    }
  };

  const startEditingBank = (labId: string) => {
    setEditingLabId(labId);
    setBankForm({ bankCode: '', accountNumber: '' });
    setBankError(null);
  };

  const handleSaveBank = async (labId: string) => {
    if (!bankForm.bankCode || !bankForm.accountNumber) return;
    setSavingBank(true);
    setBankError(null);
    try {
      await api.updateLabBankDetails(labId, bankForm.bankCode, bankForm.accountNumber);
      setEditingLabId(null);
      load();
    } catch (err) {
      setBankError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setSavingBank(false);
    }
  };

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
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>TOTAL OUTSTANDING SETTLEMENTS</span>
          <h2 style={{ fontSize: '36px', color: 'white', fontWeight: '700', marginTop: '4px' }}>{formatNaira(totalOutstandingKobo)}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px' }}>
            {readyCount} of {outstanding.length} partners ready for payout.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            className="btn"
            disabled={triggering || readyCount === 0}
            onClick={handleTrigger}
            style={{ backgroundColor: 'white', color: 'var(--color-primary)', fontWeight: '700', opacity: triggering || readyCount === 0 ? 0.6 : 1 }}
          >
            {triggering ? 'Processing...' : 'Trigger Batch Settlement'}
          </button>
          {triggerResult && (
            <p style={{ color: 'white', fontSize: '12px', marginTop: '8px', maxWidth: '280px' }}>{triggerResult}</p>
          )}
        </div>
      </div>

      {/* Outstanding balances */}
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Outstanding Balances</h3>
        </div>
        {loading ? (
          <div style={{ padding: '24px' }}>Loading...</div>
        ) : outstanding.length === 0 ? (
          <div style={{ padding: '24px', color: 'var(--color-text-secondary)' }}>No outstanding balances — every completed appointment has been settled.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Recipient Facility</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Bank Account Details</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Net Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {outstanding.map((o) => (
                <tr key={o.lab._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <h4 style={{ fontWeight: '600', fontSize: '14px' }}>{o.lab.name}</h4>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    {editingLabId === o.lab._id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '260px' }}>
                        <select
                          value={bankForm.bankCode}
                          onChange={(e) => setBankForm({ ...bankForm, bankCode: e.target.value })}
                          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '12px' }}
                        >
                          <option value="">Select bank</option>
                          {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                        </select>
                        <input
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                          placeholder="Account number"
                          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '12px' }}
                        />
                        {bankError && <span style={{ fontSize: '11px', color: '#EF4444' }}>{bankError}</span>}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-primary" disabled={savingBank} onClick={() => handleSaveBank(o.lab._id)} style={{ fontSize: '12px', padding: '4px 10px' }}>
                            {savingBank ? 'Verifying...' : 'Verify & Save'}
                          </button>
                          <button className="btn btn-outline" onClick={() => setEditingLabId(null)} style={{ fontSize: '12px', padding: '4px 10px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : o.payoutReady ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Landmark size={16} style={{ color: 'var(--color-text-muted)' }} />
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '13px' }}>{o.lab.bankDetails.accountNumber}</p>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{o.lab.bankDetails.bankName}</span>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-outline" onClick={() => startEditingBank(o.lab._id)} style={{ fontSize: '12px', padding: '4px 10px' }}>
                        Add bank details
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-primary)' }}>{formatNaira(o.netAmountKobo)}</span>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Gross {formatNaira(o.grossAmountKobo)} − fee {formatNaira(o.platformFeeKobo)}</p>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    {o.payoutReady ? (
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb' }}>Ready for payout</span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#d97706' }}>
                        <AlertTriangle size={12} /> Missing bank details
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Settlement history */}
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
        {history.length === 0 ? (
          <div style={{ padding: '24px', color: 'var(--color-text-secondary)' }}>No settlements have been processed yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Bank Account Details</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Settlement Date</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((tx) => (
                <tr key={tx._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Landmark size={16} style={{ color: 'var(--color-text-muted)' }} />
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '13px' }}>{tx.bankSnapshot.accountNumber}</p>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{tx.bankSnapshot.bankName}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-primary)' }}>{formatNaira(tx.netAmountKobo)}</span>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {new Date(tx.settledAt || tx.createdAt).toLocaleDateString()}
                  </td>
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
                        tx.status === 'pending' ? 'rgba(59, 130, 246, 0.1)' :
                        'rgba(239, 68, 68, 0.1)',
                      color:
                        tx.status === 'completed' ? 'var(--color-secondary)' :
                        tx.status === 'pending' ? '#2563eb' :
                        '#EF4444'
                    }}>
                      {tx.status === 'completed' && <ArrowDownLeft size={12} />}
                      {tx.status === 'pending' && <ArrowUpRight size={12} />}
                      {tx.status === 'failed' && <ReceiptText size={12} />}
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
