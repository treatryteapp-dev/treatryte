import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import logo from '../assets/logo.jpeg';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let API_BASE = import.meta.env.VITE_API_URL || 
      (typeof window !== 'undefined' && window.location.hostname.includes('railway')
        ? 'https://treatryte-backend.up.railway.app'
        : 'http://localhost:4000');

    if (API_BASE && !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
      API_BASE = `https://${API_BASE}`;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      api.setToken(data.accessToken);
      if (data.user) {
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Connection to backend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f7f9fb' }}>
      
      {/* Top Header */}
      <header style={{
        width: '100%',
        position: 'sticky',
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="TreatRyte Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#00685f' }}>TreatRyte</span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '48px',
          maxWidth: '1280px',
          width: '100%'
        }}>
          {/* Left Side: Visual / Context (Desktop Only) */}
          <div style={{
            gridColumn: 'span 6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '32px'
          }} className="hidden-mobile">
            <div style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
              height: '500px'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAwer47wHAEjAdZnadu4rwfC1hQ1Y2VirC_UGLYA1CgsFSPhR0uf1T1QYCHXH9YQW6eQtlcOtLMewzsUWTR-sgP3zOKQuHoZUYt-xAqM4z2liOqFELT-1YsjW3LL_kkIT4Fs2tkSf2Ar4Gtc_KUlGzqxsI6kgxdsJRLUKwF2NHNf8Nya-WrPqvEme5l3DknLvm26fDj7CZ-yQ3CTC2pBoB1MXdd3LIg8_Shf-qmR0pJ1xFNtzUKnFSLevv4189kGw1x1dDe8llF-Q4')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
              }}></div>
              <div style={{ position: 'absolute', bottom: 0, padding: '32px', color: '#ffffff' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>Secure Your Health and Wealth.</h1>
                <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '448px', color: '#ffffff', lineHeight: '1.5' }}>
                  Access your integrated medical wallet and healthcare records with clinical precision and bank-grade security.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div style={{
            gridColumn: 'span 6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }} className="span-12-mobile">
            <div style={{
              width: '100%',
              maxWidth: '448px',
              backgroundColor: '#ffffff',
              padding: '40px',
              borderRadius: '12px',
              border: '1px solid rgba(224, 227, 229, 0.5)',
              boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)'
            }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#191c1e', marginBottom: '8px' }}>Welcome Back</h2>
                <p style={{ fontSize: '16px', color: '#3d4947' }}>Please enter your details to access your account.</p>
              </div>

              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'var(--color-error-container)',
                  color: 'var(--color-error)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Email Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="identity" style={{ fontSize: '12px', fontWeight: '500', color: '#6d7a77' }}>Email or Phone Number</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '16px', color: '#6d7a77', display: 'flex' }}><User size={20} /></span>
                    <input
                      id="identity"
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@email.com or +234..."
                      style={{
                        width: '100%',
                        height: '56px',
                        paddingLeft: '48px',
                        paddingRight: '16px',
                        backgroundColor: '#f2f4f6',
                        border: '1px solid #bcc9c6',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        color: '#191c1e'
                      }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="password" style={{ fontSize: '12px', fontWeight: '500', color: '#6d7a77' }}>Password</label>
                    <a href="#" style={{ fontSize: '12px', fontWeight: '600', color: '#00685f', textDecoration: 'none' }}>Forgot password?</a>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '16px', color: '#6d7a77', display: 'flex' }}><Lock size={20} /></span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      style={{
                        width: '100%',
                        height: '56px',
                        paddingLeft: '48px',
                        paddingRight: '48px',
                        backgroundColor: '#f2f4f6',
                        border: '1px solid #bcc9c6',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        color: '#191c1e'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        border: 'none',
                        background: 'none',
                        color: '#6d7a77',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Keep me logged in */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input id="remember" type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#00685f' }} />
                  <label htmlFor="remember" style={{ fontSize: '14px', color: '#3d4947', cursor: 'pointer' }}>Keep me logged in for 30 days</label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    height: '56px',
                    backgroundColor: '#00685f',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0px 4px 12px rgba(0, 104, 95, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Logging In...' : 'Log In'}
                  <ArrowRight size={20} />
                </button>

              </form>

            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer style={{ width: '100%', textAlign: 'center', padding: '16px 0', borderTop: '1px solid rgba(61, 73, 71, 0.05)' }}>
        <p style={{ fontSize: '12px', color: '#bcc9c6' }}>
          © 2024 TreatRyte. Clinical Precision. Financial Security.
        </p>
      </footer>

      {/* Mobile styling overrides */}
      <style>{`
        @media (max-width: 1024px) {
          .hidden-mobile {
            display: none !important;
          }
          .span-12-mobile {
            grid-column: span 12 !important;
          }
        }
      `}</style>

    </div>
  );
};
