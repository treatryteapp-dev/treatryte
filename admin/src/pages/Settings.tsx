import React, { useState } from 'react';
import { Save, KeyRound, Webhook, Brush } from 'lucide-react';

export const Settings: React.FC = () => {
  const [portalName, setPortalName] = useState('TreatRyte Admin Portal');
  const [adminEmail, setAdminEmail] = useState('admin@treatryte.com');
  const [primaryColor, setPrimaryColor] = useState('#004E47');
  const [sessionTimeout, setSessionTimeout] = useState('15');
  const [mfaEnabled, setMfaEnabled] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#0b1c30' }}>Platform Settings</h2>
        <p style={{ fontSize: '14px', color: '#545f73', marginTop: '4px' }}>Configure global security parameters, API keys, webhook triggers, and brand appearance presets.</p>
      </div>

      {/* Settings Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Branding Configurations */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <Brush size={20} style={{ color: '#004e47' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30' }}>Portal Branding</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#545f73', marginBottom: '8px' }}>PORTAL TITLE</label>
              <input
                type="text"
                value={portalName}
                onChange={(e) => setPortalName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#545f73', marginBottom: '8px' }}>ADMIN CORRESPONDENCE EMAIL</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#545f73', marginBottom: '8px' }}>PRIMARY BRAND COLOR</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: '48px', height: '40px', padding: 0, border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'monospace' }}>{primaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Parameters */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <KeyRound size={20} style={{ color: '#004e47' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30' }}>Security Parameters</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#545f73', marginBottom: '8px' }}>INACTIVITY SESSION TIMEOUT (MINUTES)</label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
              >
                <option value="5">5 Minutes</option>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0b1c30' }}>Enforce Multi-Factor Authentication</h4>
                <p style={{ fontSize: '12px', color: '#545f73', marginTop: '2px' }}>Require all administrative logins to provide a temporal 6-digit TOTP code.</p>
              </div>
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={(e) => setMfaEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Webhooks & APIs */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <Webhook size={20} style={{ color: '#004e47' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30' }}>Integration Webhooks</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#545f73', marginBottom: '8px' }}>PARTNER STATUS CHANGE WEBHOOK</label>
              <input
                type="text"
                defaultValue="https://api.treatryte.com/v1/webhooks/partners"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#004e47' }}>
            <Save size={16} />
            Save Changes
          </button>
        </div>

      </div>

    </div>
  );
};
