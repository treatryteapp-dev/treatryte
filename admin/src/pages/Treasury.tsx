import React, { useEffect, useState } from 'react';
import { Wallet, Landmark, ShieldCheck, Check, AlertTriangle, Send } from 'lucide-react';
import { api, type Bank, type PayoutAccount } from '../services/api';

const formatNaira = (kobo: number) =>
  `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '1px solid #E2E8F0',
  padding: '24px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#545f73',
  marginBottom: '8px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  fontSize: '14px',
};

export const Treasury: React.FC = () => {
  const [balanceKobo, setBalanceKobo] = useState<number | null>(null);
  const [payoutAccount, setPayoutAccountState] = useState<PayoutAccount | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  // Payout account form
  const [editingAccount, setEditingAccount] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedName, setResolvedName] = useState<{ accountName: string; bankName: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [locking, setLocking] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState(false);

  // Withdraw form
  const [withdrawNaira, setWithdrawNaira] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([api.fetchTreasuryWallet(), api.fetchPayoutAccount(), api.fetchBanks()])
      .then(([wallet, account, bankList]) => {
        setBalanceKobo(wallet.balanceKobo);
        setPayoutAccountState(account);
        setBanks(bankList);
      })
      .catch((err) => console.error('Failed to load treasury data', err))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const resetAccountForm = () => {
    setEditingAccount(false);
    setBankCode('');
    setAccountNumber('');
    setResolvedName(null);
    setOtpRequested(false);
    setOtpCode('');
    setAccountError(null);
  };

  const handleVerify = async () => {
    if (!bankCode || !accountNumber) return;
    setVerifying(true);
    setAccountError(null);
    try {
      const result = await api.lookupPayoutAccount(bankCode, accountNumber);
      setResolvedName(result);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Could not verify this account');
    } finally {
      setVerifying(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setAccountError(null);
    try {
      await api.requestPayoutAccountOtp();
      setOtpRequested(true);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Failed to send confirmation code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleLockIn = async () => {
    if (!otpCode) return;
    setLocking(true);
    setAccountError(null);
    try {
      const account = await api.setPayoutAccount(bankCode, accountNumber, otpCode);
      setPayoutAccountState(account);
      resetAccountForm();
      setAccountSuccess(true);
      setTimeout(() => setAccountSuccess(false), 3000);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Failed to lock in payout account');
    } finally {
      setLocking(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountKobo = Math.round(Number(withdrawNaira) * 100);
    if (!amountKobo || amountKobo <= 0) return;
    if (!payoutAccount) return;
    if (
      !window.confirm(
        `Withdraw ${formatNaira(amountKobo)} to ${payoutAccount.bankName} •••• ${payoutAccount.accountNumber.slice(-4)}?`,
      )
    ) {
      return;
    }
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      await api.withdrawPlatformRevenue(amountKobo);
      setWithdrawNaira('');
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 3000);
      loadAll();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const showForm = editingAccount || !payoutAccount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#0b1c30' }}>Treasury</h2>
        <p style={{ fontSize: '14px', color: '#545f73', marginTop: '4px' }}>
          Withdraw platform revenue to a single locked bank account, confirmed by email code on every change.
        </p>
      </div>

      {/* Balance */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
          <Wallet size={20} style={{ color: '#004e47' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0b1c30' }}>Platform Wallet Balance</h3>
        </div>
        <p style={{ fontSize: '36px', fontWeight: 700, color: '#0b1c30', marginTop: '12px' }}>
          {loading || balanceKobo === null ? '—' : formatNaira(balanceKobo)}
        </p>
      </div>

      {/* Payout account */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
          <Landmark size={20} style={{ color: '#004e47' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0b1c30' }}>Payout Account</h3>
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>
          The only account platform revenue can withdraw to. Setting or changing it always requires a code sent to
          your admin email - a compromised session alone can't redirect a payout.
        </p>

        {accountSuccess && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={14} /> Payout account locked in.
          </div>
        )}
        {accountError && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={14} /> {accountError}
          </div>
        )}

        {!showForm && payoutAccount && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#0b1c30' }}>
                  {payoutAccount.bankName} •••• {payoutAccount.accountNumber.slice(-4)}
                </p>
                <p style={{ fontSize: '13px', color: '#545f73', marginTop: '2px' }}>{payoutAccount.accountName}</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  Locked {new Date(payoutAccount.lockedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(true)}
                className="btn"
                style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Change Account
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>BANK</label>
                <select
                  value={bankCode}
                  onChange={(e) => {
                    setBankCode(e.target.value);
                    setResolvedName(null);
                    setOtpRequested(false);
                  }}
                  disabled={verifying || otpRequested}
                  style={{ ...inputStyle, backgroundColor: 'white' }}
                >
                  <option value="">Select a bank</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>ACCOUNT NUMBER</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setResolvedName(null);
                    setOtpRequested(false);
                  }}
                  disabled={verifying || otpRequested}
                  placeholder="10-digit account number"
                  style={inputStyle}
                />
              </div>
            </div>

            {!resolvedName && (
              <div>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!bankCode || !accountNumber || verifying}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', backgroundColor: '#004e47', opacity: !bankCode || !accountNumber || verifying ? 0.6 : 1 }}
                >
                  {verifying ? 'Verifying...' : 'Verify Account'}
                </button>
              </div>
            )}

            {resolvedName && (
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={16} style={{ color: '#10B981' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0b1c30' }}>{resolvedName.accountName}</span>
                <span style={{ fontSize: '13px', color: '#545f73' }}>at {resolvedName.bankName}</span>
              </div>
            )}

            {resolvedName && !otpRequested && (
              <div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#004e47', opacity: sendingOtp ? 0.6 : 1 }}
                >
                  <Send size={14} />
                  {sendingOtp ? 'Sending...' : 'Send Confirmation Code to My Email'}
                </button>
              </div>
            )}

            {resolvedName && otpRequested && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>CONFIRMATION CODE (sent to your admin email)</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                    style={{ ...inputStyle, maxWidth: '200px', letterSpacing: '4px', fontWeight: 700 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleLockIn}
                    disabled={!otpCode || locking}
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', backgroundColor: '#004e47', opacity: !otpCode || locking ? 0.6 : 1 }}
                  >
                    {locking ? 'Locking in...' : 'Lock In Account'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    style={{ padding: '10px 20px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: 'none' }}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {payoutAccount && (
              <div>
                <button
                  type="button"
                  onClick={resetAccountForm}
                  style={{ fontSize: '13px', color: '#545f73', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Withdraw */}
      <form onSubmit={handleWithdraw} style={cardStyle}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
          <Send size={20} style={{ color: '#004e47' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0b1c30' }}>Withdraw</h3>
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>
          {payoutAccount
            ? `Sends to the locked account above (${payoutAccount.bankName} •••• ${payoutAccount.accountNumber.slice(-4)}).`
            : 'Set a payout account above before withdrawing.'}
        </p>

        {withdrawSuccess && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={14} /> Withdrawal submitted.
          </div>
        )}
        {withdrawError && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={14} /> {withdrawError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>AMOUNT (₦)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={withdrawNaira}
              onChange={(e) => setWithdrawNaira(e.target.value)}
              disabled={!payoutAccount}
              placeholder="0.00"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={!payoutAccount || withdrawing || !withdrawNaira}
            className="btn btn-primary"
            style={{ padding: '10px 24px', backgroundColor: '#004e47', opacity: !payoutAccount || withdrawing || !withdrawNaira ? 0.6 : 1 }}
          >
            {withdrawing ? 'Withdrawing...' : 'Withdraw'}
          </button>
        </div>
      </form>
    </div>
  );
};
