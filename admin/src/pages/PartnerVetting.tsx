import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Check, X, FileText, Landmark } from 'lucide-react';
import { api, type LabProfile } from '../services/api';

export const PartnerVetting: React.FC = () => {
  const [labs, setLabs] = useState<LabProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadLabs = () => {
    setLoading(true);
    api.fetchLabs()
      .then((data) => {
        setLabs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLabs();
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    const success = await api.approveLab(id);
    setActionId(null);
    if (success) {
      loadLabs();
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    const success = await api.rejectLab(id);
    setActionId(null);
    if (success) {
      loadLabs();
    }
  };

  if (loading && labs.length === 0) {
    return (
      <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading vetting queues...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>Partner Credential Vetting</h1>
        <p>Review submitted MDCN licenses, healthcare credentials, and bank settlement configurations.</p>
      </div>

      {labs.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px',
          textAlign: 'center',
          border: '1px solid var(--color-border)'
        }}>
          <ShieldCheck size={48} style={{ color: 'var(--color-secondary)', marginBottom: '16px' }} />
          <h3>Vetting Queue is Empty</h3>
          <p>All registered partner credentials have been audited and cleared.</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Facility Details</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Credentials</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Services</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Settlement Account</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Audit Status</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labs.map((lab) => (
                <tr key={lab._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {/* Name & Address */}
                  <td style={{ padding: '20px 24px' }}>
                    <h4 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{lab.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{lab.address}</p>
                  </td>
                  {/* Credentials */}
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{lab.licenseNumber || 'N/A'}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>MDCN Medical License</span>
                  </td>
                  {/* Services */}
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                      {lab.services.map((srv, idx) => (
                        <span key={idx} style={{
                          backgroundColor: 'var(--color-background)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {srv}
                        </span>
                      ))}
                    </div>
                  </td>
                  {/* Settlement */}
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Landmark size={16} style={{ color: 'var(--color-secondary)' }} />
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '13px' }}>{lab.bankDetails?.accountNumber || 'N/A'}</p>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{lab.bankDetails?.bankName}</span>
                      </div>
                    </div>
                  </td>
                  {/* Status Badge */}
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor:
                        lab.status === 'approved' ? 'var(--color-secondary-container)' :
                        lab.status === 'rejected' ? 'var(--color-error-container)' :
                        'rgba(245, 158, 11, 0.1)',
                      color:
                        lab.status === 'approved' ? 'var(--color-secondary)' :
                        lab.status === 'rejected' ? 'var(--color-error)' :
                        '#d97706'
                    }}>
                      {lab.status === 'approved' && <ShieldCheck size={14} />}
                      {lab.status === 'rejected' && <ShieldAlert size={14} />}
                      {lab.status === 'pending' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }}></div>}
                      {lab.status.toUpperCase()}
                    </span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '20px 24px' }}>
                    {lab.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          disabled={actionId !== null}
                          onClick={() => handleApprove(lab._id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Check size={14} />
                          Approve
                        </button>
                        <button
                          disabled={actionId !== null}
                          onClick={() => handleReject(lab._id)}
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '500' }}>Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
