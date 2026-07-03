import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      api.setToken(data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Connection to backend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px 32px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand */}
        <div className="flex-center" style={{ gap: '12px', marginBottom: '32px' }}>
          <div style={{
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-primary)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            display: 'flex'
          }}>
            <Activity size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-primary)', lineHeight: '1' }}>treatRyte</h2>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>ADMIN CONSOLE</span>
          </div>
        </div>

        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Welcome Back</h3>
          <p style={{ fontSize: '13px' }}>Sign in to manage partner clinical review boards.</p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--color-error-container)',
            color: 'var(--color-error)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              ADMIN EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@treatryte.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'transparent'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'transparent'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
