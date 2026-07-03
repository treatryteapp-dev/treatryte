import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, ShieldCheck, Settings, LogOut, HelpCircle, Activity } from 'lucide-react';
import { api } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
    { name: 'Partner Onboarding', path: '/vetting', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    api.logout();
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
          <div style={{
            backgroundColor: '#e6f4f2',
            color: '#004e47',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#004e47', letterSpacing: '-0.5px' }}>TreatRyte</h2>
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
              <span style={{ fontWeight: '600', fontSize: '13px', color: '#004e47' }}>02:45 PM</span>
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
                <p style={{ fontWeight: '700', fontSize: '13px', color: '#0b1c30' }}>Alex Rivera</p>
                <p style={{ fontSize: '10px', color: '#545f73', lineHeight: '1' }}>System Administrator</p>
              </div>
              <img
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                alt="Admin avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg9jt9xWU3PlMtBCVnV3mUpuY9-5NUFmDhx8y6d_27LKpkLBO4uL-8OTnvhelhfdx_azXfhwnya3BFt26OcveyW0FoMxAqGBHDGDP1VTxolsfAbFOi1x8MlpRIqHYKiViWXK1uRkJ5633f-L9iac8hAPU4rWnTkAUnWB5aCzOH5cm4K-48r8BSJUsNy2wVKnPWDakt4o3-Xu1NGLLF9FDM7iiecmZ5SE8bq6qjpOCcCjXUwJwA7tJjyHJAQTYXAUh-d3u21VkMGkA"
              />
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
