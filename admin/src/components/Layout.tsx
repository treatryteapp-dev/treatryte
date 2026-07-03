import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, CreditCard, LogOut, Activity } from 'lucide-react';
import { api } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Partner Vetting', path: '/vetting', icon: ShieldCheck },
    { name: 'Settlements', path: '/settlements', icon: CreditCard },
  ];

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px'
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
          paddingLeft: '8px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-primary)',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)' }}>treatRyte</h2>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>ADMIN WEB PORTAL</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: active ? 'var(--color-primary-container)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer/Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            padding: '12px 16px',
            color: 'var(--color-error)',
            borderColor: 'transparent'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Main Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{
          height: '70px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '600', fontSize: '13px' }}>System Administrator</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>admin@treatryte.com</p>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-container)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px'
            }}>
              SA
            </div>
          </div>
        </header>

        <div style={{ padding: '32px', flexGrow: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
};
