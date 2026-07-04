import React, { useEffect, useState } from 'react';
import { Save, KeyRound, Webhook, Brush, Check, User, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  // Admin Profile Settings (backend-persisted)
  const [adminFullName, setAdminFullName] = useState(() => {
    try {
      const stored = localStorage.getItem('adminUser');
      if (stored) return JSON.parse(stored).fullName || 'TreatRyte Admin';
    } catch {}
    return 'TreatRyte Admin';
  });
  const [adminEmailAddress, setAdminEmailAddress] = useState(() => {
    try {
      const stored = localStorage.getItem('adminUser');
      if (stored) return JSON.parse(stored).email || '';
    } catch {}
    return '';
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Portal Branding - a per-browser preference only, never synced to a
  // backend or shared with other admins.
  const [portalName, setPortalName] = useState(() => localStorage.getItem('adminPortalName') || 'TreatRyte Admin Portal');
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('adminEmail') || 'admin@treatryte.com');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('adminPrimaryColor') || '#004E47');
  const [sessionTimeout, setSessionTimeout] = useState(() => localStorage.getItem('adminSessionTimeout') || '15');

  // Partner status webhook (backend-persisted)
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookLoading, setWebhookLoading] = useState(true);
  const [globalSaving, setGlobalSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState(false);

  useEffect(() => {
    api.fetchPlatformSettings()
      .then((settings) => setWebhookUrl(settings.partnerStatusWebhookUrl))
      .catch((err) => console.error('Failed to load platform settings', err))
      .finally(() => setWebhookLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    try {
      const updated = await api.updateAdminProfile(adminFullName, adminEmailAddress, currentPassword);
      localStorage.setItem('adminUser', JSON.stringify(updated));
      window.dispatchEvent(new Event('adminSettingsUpdated'));
      setCurrentPassword('');
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveGlobal = async () => {
    setGlobalSaving(true);
    setGlobalError(null);
    try {
      localStorage.setItem('adminPortalName', portalName);
      localStorage.setItem('adminEmail', adminEmail);
      localStorage.setItem('adminPrimaryColor', primaryColor);
      localStorage.setItem('adminSessionTimeout', sessionTimeout);

      await api.updatePlatformSettings(webhookUrl);

      window.dispatchEvent(new Event('adminSettingsUpdated'));
      setGlobalSuccess(true);
      setTimeout(() => setGlobalSuccess(false), 3000);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to save webhook settings');
    } finally {
      setGlobalSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#0b1c30' }}>Platform Settings</h2>
        <p style={{ fontSize: '14px', color: '#545f73', marginTop: '4px' }}>Configure your admin profile, webhook triggers, and browser display preferences.</p>
      </div>

      {/* Settings Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Admin Profile Settings */}
        <form onSubmit={handleSaveProfile} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <User size={20} style={{ color: '#004e47' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30' }}>Admin Profile Settings</h3>
          </div>

          {profileSuccess && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} /> Profile updated successfully.
            </div>
          )}
          {profileError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} /> {profileError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#545f73', marginBottom: '8px' }}>ADMIN FULL NAME</label>
              <input
                type="text"
                required
                value={adminFullName}
                onChange={(e) => setAdminFullName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#545f73', marginBottom: '8px' }}>ADMIN EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={adminEmailAddress}
                onChange={(e) => setAdminEmailAddress(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#545f73', marginBottom: '8px' }}>CURRENT PASSWORD (required to save changes)</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={profileSaving || !currentPassword}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#004e47', opacity: profileSaving || !currentPassword ? 0.6 : 1 }}
              >
                <Save size={14} />
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>

        {/* Branding Configurations */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
            <Brush size={20} style={{ color: '#004e47' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30' }}>Portal Branding</h3>
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>Stored in this browser only - not shared with other admins.</p>

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
            <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
              You'll be automatically logged out after this much time with no mouse, keyboard, or scroll activity.
            </p>
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
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={webhookLoading ? 'Loading...' : 'https://your-endpoint.example.com/webhooks/partners'}
                disabled={webhookLoading}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
                A POST request fires here whenever a partner is approved or rejected in Partner Onboarding.
              </p>
            </div>
          </div>
        </div>

        {globalSuccess && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} />
            <span>Webhook setting saved. Branding preferences saved to this browser.</span>
          </div>
        )}
        {globalError && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{globalError}</span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSaveGlobal}
            disabled={globalSaving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#004e47', opacity: globalSaving ? 0.6 : 1 }}
          >
            <Save size={16} />
            {globalSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>

    </div>
  );
};
