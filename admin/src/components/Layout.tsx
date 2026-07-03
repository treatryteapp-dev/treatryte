import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, ShieldCheck, Settings, LogOut, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import logo from '../assets/logo.jpeg';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [timeStr, setTimeStr] = useState('');

  const [portalTitle, setPortalTitle] = useState(() => {
    const stored = localStorage.getItem('adminPortalName');
    return stored ? stored.split(' ')[0] : 'TreatRyte';
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('adminUser');
      if (stored) {
        setAdminUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse admin user profile', e);
    }

    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleSettingsUpdate = () => {
      const stored = localStorage.getItem('adminPortalName');
      setPortalTitle(stored ? stored.split(' ')[0] : 'TreatRyte');

      try {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
          setAdminUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to parse admin user profile during settings sync', e);
      }
    };
    window.addEventListener('adminSettingsUpdated', handleSettingsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('adminSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
    { name: 'Partner Onboarding', path: '/vetting', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 50
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '40px',
          paddingLeft: '8px'
        }}>
          <img src={logo} alt="TreatRyte Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#004e47', letterSpacing: '-0.5px' }}>{portalTitle}</h2>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
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
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: active ? '700' : '500',
                  color: active ? '#004e47' : '#545f73',
                  backgroundColor: active ? '#d5e0f8' : 'transparent',
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
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn btn-outline"
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              padding: '12px 16px',
              color: '#545f73',
              borderColor: 'transparent',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <HelpCircle size={18} />
            Help Center
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              padding: '12px 16px',
              color: '#EF4444',
              borderColor: 'transparent',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{ flexGrow: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
              <span style={{ fontWeight: '600', fontSize: '13px', color: '#004e47' }}>{timeStr || '02:45 PM'}</span>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#545f73',
                backgroundColor: '#eceef0',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Live</span>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#E2E8F0' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '700', fontSize: '13px', color: '#0b1c30' }}>
                  {adminUser?.fullName || adminUser?.email || 'TreatRyte Admin'}
                </p>
                <p style={{ fontSize: '10px', color: '#545f73', lineHeight: '1' }}>
                  {adminUser?.role === 'admin' ? 'System Administrator' : (adminUser?.role || 'Administrator')}
                </p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#004e47',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '14px',
                border: '1px solid #E2E8F0'
              }}>
                {(adminUser?.fullName ? adminUser.fullName.substring(0, 2).toUpperCase() : (adminUser?.email ? adminUser.email.substring(0, 2).toUpperCase() : 'TR'))}
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: '32px', flexGrow: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
