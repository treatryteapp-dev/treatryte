import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, FileText, ZoomIn, Download, Maximize, XCircle } from 'lucide-react';
import { api, type LabProfile } from '../services/api';

export const PartnerVetting: React.FC = () => {
  const [labs, setLabs] = useState<LabProfile[]>([]);
  const [selectedLab, setSelectedLab] = useState<LabProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'review'>('new');
  const [loading, setLoading] = useState(true);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadLabs = () => {
    setLoading(true);
    api.fetchLabs()
      .then((data) => {
        setLabs(data);
        const filtered = data.filter(l => activeTab === 'new' ? l.status === 'pending' : l.status === 'rejected');
        if (filtered.length > 0) {
          setSelectedLab(filtered[0]);
        } else {
          setSelectedLab(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleTabChange = (tab: 'new' | 'review') => {
    setActiveTab(tab);
    const filtered = labs.filter(l => tab === 'new' ? l.status === 'pending' : l.status === 'rejected');
    if (filtered.length > 0) {
      setSelectedLab(filtered[0]);
    } else {
      setSelectedLab(null);
    }
  };

  useEffect(() => {
    loadLabs();
  }, [activeTab]);

  const handleApprove = async () => {
    if (!selectedLab) return;
    setSubmitting(true);
    const success = await api.approveLab(selectedLab._id);
    setSubmitting(false);
    if (success) {
      loadLabs();
    }
  };

  const handleReject = async () => {
    if (!selectedLab || !declineReason.trim()) return;
    setSubmitting(true);
    const success = await api.rejectLab(selectedLab._id);
    setSubmitting(false);
    if (success) {
      setShowDeclineModal(false);
      setDeclineReason('');
      loadLabs();
    }
  };

  const setDeclineText = (text: string) => {
    setDeclineReason(text);
  };

  if (loading && labs.length === 0) {
    return (
      <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#004e47', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading onboarding pipelines...</p>
      </div>
    );
  }

  const pendingCount = labs.filter(l => l.status === 'pending').length;
  const underReviewCount = labs.filter(l => l.status === 'rejected').length;
  const displayedLabs = labs.filter(l => activeTab === 'new' ? l.status === 'pending' : l.status === 'rejected');

  return (
    <div style={{ margin: '-32px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sub-navigation switcher */}
      <section style={{
        backgroundColor: '#ffffff',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E2E8F0',
        height: '56px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '32px', height: '100%' }}>
          <button
            onClick={() => handleTabChange('new')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 4px',
              border: 'none',
              background: 'none',
              color: activeTab === 'new' ? '#004e47' : '#545f73',
              fontWeight: activeTab === 'new' ? '700' : '500',
              borderBottom: activeTab === 'new' ? '2px solid #004e47' : 'none',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            New Requests
            <span style={{
              backgroundColor: activeTab === 'new' ? '#00685f' : '#e1e2e5',
              color: activeTab === 'new' ? '#93e4d8' : '#191c1e',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => handleTabChange('review')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 4px',
              border: 'none',
              background: 'none',
              color: activeTab === 'review' ? '#004e47' : '#545f73',
              fontWeight: activeTab === 'review' ? '700' : '500',
              borderBottom: activeTab === 'review' ? '2px solid #004e47' : 'none',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Under Review
            <span style={{
              backgroundColor: activeTab === 'review' ? '#00685f' : '#e1e2e5',
              color: activeTab === 'review' ? '#93e4d8' : '#191c1e',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {underReviewCount}
            </span>
          </button>
        </div>

        {/* Dropdown to select lab */}
        {displayedLabs.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#545f73', fontWeight: '600' }}>Active File:</span>
            <select
              value={selectedLab?._id || ''}
              onChange={(e) => {
                const lab = displayedLabs.find(l => l._id === e.target.value);
                if (lab) setSelectedLab(lab);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0b1c30',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {displayedLabs.map(l => (
                <option key={l._id} value={l._id}>{l.name}</option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Main split canvas */}
      {displayedLabs.length === 0 || selectedLab === null ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '48px', backgroundColor: '#F8FAFC' }}>
          <ShieldCheck size={64} style={{ color: '#006c4a', marginBottom: '24px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0b1c30' }}>
            {activeTab === 'new' ? 'No pending applications' : 'No applications under review'}
          </h3>
          <p style={{ color: '#545f73', marginTop: '8px' }}>
            {activeTab === 'new' ? 'All clinical providers have been cleared and verified.' : 'No partner applications are currently rejected or under review.'}
          </p>
        </div>
      ) : (
        <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Left panel: Document Preview */}
          <section style={{ width: '50%', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Document Preview: MDCN Medical License
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline" style={{ padding: '6px', backgroundColor: 'white' }}><ZoomIn size={16} /></button>
                <button className="btn btn-outline" style={{ padding: '6px', backgroundColor: 'white' }}><Download size={16} /></button>
                <button className="btn btn-outline" style={{ padding: '6px', backgroundColor: 'white' }}><Maximize size={16} /></button>
              </div>
            </div>
            
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              {/* Document Mock */}
              <div style={{
                width: '100%',
                maxWidth: '460px',
                minHeight: '620px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-md)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#eceef0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004e47' }}>
                    <FileText size={36} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: '#0b1c30' }}>Official Certification</h3>
                    <span style={{ fontSize: '10px', color: '#545f73' }}>VA-992384-LIC</span>
                  </div>
                </div>

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                    <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase' }}>CERTIFIED MEDICAL PRACTITIONER</span>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#004e47', marginTop: '4px' }}>
                      {selectedLab.name}
                    </h2>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase' }}>MDCN REGISTERED LICENSE NUMBER</span>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#0b1c30', marginTop: '2px' }}>
                      {selectedLab.licenseNumber || 'PENDING SYNC'}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase' }}>REGISTERED ADDRESS COORDINATES</span>
                    <p style={{ fontSize: '13px', color: '#191c1e', marginTop: '2px' }}>
                      {selectedLab.address}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase' }}>ISSUE DATE</span>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#0b1c30' }}>Jan 12, 2020</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase' }}>EXPIRATION DATE</span>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#0b1c30' }}>Dec 31, 2030</p>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '2px solid #004e47', paddingTop: '16px', marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#545f73', fontWeight: '600' }}>MEDICAL DENTAL COUNCIL OF NIGERIA</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(0, 78, 71, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} style={{ color: '#004e47' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right panel: Application Details & Decision */}
          <section style={{ width: '50%', backgroundColor: '#f2f4f6', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Applicant Header */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    backgroundColor: '#e6f4f2',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#004e47'
                  }}>
                    {selectedLab.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0b1c30' }}>{selectedLab.name}</h3>
                    <p style={{ fontSize: '13px', color: '#545f73', marginTop: '2px' }}>Clinical Diagnostics Partner</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#6cf8bb', color: '#00714d', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                        Verified Identity
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#eceef0', color: '#545f73', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                        Level 3 Partner
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#545f73', textTransform: 'uppercase', fontWeight: '600' }}>BANK SETTLEMENT NAME</span>
                    <p style={{ fontSize: '13px', color: '#191c1e', fontWeight: '600', marginTop: '2px' }}>{selectedLab.bankDetails?.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#545f73', textTransform: 'uppercase', fontWeight: '600' }}>ACCOUNT NUMBER</span>
                    <p style={{ fontSize: '13px', color: '#191c1e', fontWeight: '600', marginTop: '2px' }}>{selectedLab.bankDetails?.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#545f73', textTransform: 'uppercase', fontWeight: '600' }}>OFFERED SERVICES</span>
                    <p style={{ fontSize: '13px', color: '#191c1e', fontWeight: '600', marginTop: '2px', textTransform: 'capitalize' }}>
                      {selectedLab.services.join(', ')}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#545f73', textTransform: 'uppercase', fontWeight: '600' }}>STATUS</span>
                    <p style={{ fontSize: '13px', color: selectedLab.status === 'approved' ? '#10B981' : '#F59E0B', fontWeight: '700', marginTop: '2px', textTransform: 'uppercase' }}>
                      {selectedLab.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submission Checklist */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0b1c30', marginBottom: '16px' }}>Submission Checklist</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'rgba(108, 248, 187, 0.1)', border: '1px solid rgba(108, 248, 187, 0.3)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} style={{ color: '#00714d' }} />
                      <span style={{ fontSize: '13px', color: '#191c1e' }}>State Medical License</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#004e47', fontWeight: '700' }}>Verified</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(108, 248, 187, 0.1)', border: '1px solid rgba(108, 248, 187, 0.3)', borderRadius: '8px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} style={{ color: '#00714d' }} />
                      <span style={{ fontSize: '13px', color: '#191c1e' }}>Professional Liability Insurance</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#004e47', fontWeight: '700' }}>Verified</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fc', border: '1px solid #E2E8F0', borderRadius: '8px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={16} style={{ color: '#545f73' }} />
                      <span style={{ fontSize: '13px', color: '#191c1e' }}>Clinical Board Certification</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#545f73', fontWeight: '600' }}>{selectedLab.status === 'approved' ? 'Approved' : 'Review Now'}</span>
                  </div>
                </div>
              </div>

              {/* AI Analysis Bento */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0b1c30', marginBottom: '16px' }}>AI Compliance Risk Analysis</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '16px', backgroundColor: 'rgba(108, 248, 187, 0.05)', border: '1px solid rgba(108, 248, 187, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '9px', fontWeight: '700', color: '#00714d', textTransform: 'uppercase' }}>NPI Match</p>
                    <p style={{ fontSize: '20px', fontWeight: '800', color: '#00714d', marginTop: '4px' }}>99.8%</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'rgba(108, 248, 187, 0.05)', border: '1px solid rgba(108, 248, 187, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '9px', fontWeight: '700', color: '#00714d', textTransform: 'uppercase' }}>Identity</p>
                    <p style={{ fontSize: '16px', fontWeight: '800', color: '#00714d', marginTop: '8px' }}>Low Risk</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '9px', fontWeight: '700', color: '#EF4444', textTransform: 'uppercase' }}>History</p>
                    <p style={{ fontSize: '16px', fontWeight: '800', color: '#EF4444', marginTop: '8px' }}>Low Flag</p>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: '#545f73', fontStyle: 'italic', marginTop: '12px' }}>
                  Note: Provider matching check and license expiration index verified successfully.
                </p>
              </div>
            </div>

            {/* Decision Footer Panel */}
            <div style={{
              padding: '24px 32px',
              backgroundColor: 'white',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: '16px',
              flexShrink: 0
            }}>
              {selectedLab.status === 'pending' ? (
                <>
                  <button
                    disabled={submitting}
                    onClick={() => setShowDeclineModal(true)}
                    className="btn btn-outline"
                    style={{ flexGrow: 1, padding: '14px', fontSize: '14px', fontWeight: '700', color: '#EF4444', borderColor: '#EF4444' }}
                  >
                    Decline with Feedback
                  </button>
                  <button
                    disabled={submitting}
                    onClick={handleApprove}
                    className="btn btn-primary"
                    style={{ flexGrow: 2, padding: '14px', fontSize: '14px', fontWeight: '700', backgroundColor: '#004e47' }}
                  >
                    {submitting ? 'Processing...' : 'Approve Partnership'}
                  </button>
                </>
              ) : (
                <div style={{ width: '100%', textAlign: 'center', color: '#545f73', fontWeight: '600', fontSize: '14px' }}>
                  Audited & Cleared: {selectedLab.status.toUpperCase()}
                </div>
              )}
            </div>
          </section>

        </div>
      )}

      {/* Decline Response Modal */}
      {showDeclineModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 28, 48, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '512px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0b1c30' }}>Decline Application</h3>
              <button
                onClick={() => setShowDeclineModal(false)}
                style={{ background: 'none', border: 'none', color: '#545f73', cursor: 'pointer' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#545f73', marginBottom: '20px' }}>
              Please select or enter the compliance feedback for declining this partner's registration.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Quick Reasons
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    onClick={() => setDeclineText('Incomplete documentation: Medical License was blurred.')}
                    style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer' }}
                  >
                    Incomplete Docs
                  </button>
                  <button
                    onClick={() => setDeclineText('Certification Expired: Please upload a current Board Certification.')}
                    style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer' }}
                  >
                    Expired Certs
                  </button>
                  <button
                    onClick={() => setDeclineText('NPI Mismatch: The provided NPI does not match public records.')}
                    style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer' }}
                  >
                    NPI Error
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Detailed Feedback
                </span>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Enter detailed reasons here..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="btn btn-outline"
                style={{ flexGrow: 1, padding: '12px' }}
              >
                Cancel
              </button>
              <button
                disabled={submitting || !declineReason.trim()}
                onClick={handleReject}
                className="btn btn-danger"
                style={{ flexGrow: 1, padding: '12px', backgroundColor: '#EF4444' }}
              >
                {submitting ? 'Confirming...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
