import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Check, FileText, XCircle, RefreshCw, BadgeCheck } from 'lucide-react';
import { api, type LabDocument, type LabProfile } from '../services/api';

type Tab = 'new' | 'review' | 'accepted';

/* ─────────────────────────────────────────────── helpers ── */

const statusColor = (status: string) => {
  if (status === 'approved') return { bg: '#d1fae5', text: '#065f46' };
  if (status === 'rejected') return { bg: '#fee2e2', text: '#991b1b' };
  return { bg: '#fef3c7', text: '#92400e' };
};

/* ─────────────────────────────────────────────── component ── */

export const PartnerVetting: React.FC = () => {
  const [labs, setLabs] = useState<LabProfile[]>([]);
  const [selectedLab, setSelectedLab] = useState<LabProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('new');
  const [loading, setLoading] = useState(true);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Documents loaded per selected lab
  const [documents, setDocuments] = useState<LabDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);

  /* ── data loading ── */

  const loadLabs = useCallback(() => {
    setLoading(true);
    api.fetchLabs()
      .then((data) => {
        setLabs(data);
        const filtered = filterByTab(data, activeTab);
        setSelectedLab(filtered.length > 0 ? filtered[0] : null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => { loadLabs(); }, [loadLabs]);

  // Load real signed documents when a lab is selected
  useEffect(() => {
    if (!selectedLab) {
      setDocuments([]);
      return;
    }
    setDocsLoading(true);
    setDocsError(null);
    api.fetchLabDocuments(selectedLab._id)
      .then(setDocuments)
      .catch((err) => setDocsError(err.message ?? 'Failed to load documents'))
      .finally(() => setDocsLoading(false));
  }, [selectedLab?._id]);

  /* ── tab helpers ── */

  function filterByTab(data: LabProfile[], tab: Tab) {
    if (tab === 'new') return data.filter(l => l.status === 'pending');
    if (tab === 'review') return data.filter(l => l.status === 'rejected');
    return data.filter(l => l.status === 'approved');
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const filtered = filterByTab(labs, tab);
    setSelectedLab(filtered.length > 0 ? filtered[0] : null);
  };

  /* ── actions ── */

  const handleApprove = async () => {
    if (!selectedLab) return;
    setSubmitting(true);
    const success = await api.approveLab(selectedLab._id);
    setSubmitting(false);
    if (success) loadLabs();
  };

  const handleReject = async () => {
    if (!selectedLab || !declineReason.trim()) return;
    setSubmitting(true);
    const success = await api.rejectLab(selectedLab._id, declineReason.trim());
    setSubmitting(false);
    if (success) {
      setShowDeclineModal(false);
      setDeclineReason('');
      loadLabs();
    }
  };

  /* ── derived counts ── */

  const pendingCount = labs.filter(l => l.status === 'pending').length;
  const declinedCount = labs.filter(l => l.status === 'rejected').length;
  const acceptedCount = labs.filter(l => l.status === 'approved').length;
  const displayedLabs = filterByTab(labs, activeTab);

  /* ── loading state ── */

  if (loading && labs.length === 0) {
    return (
      <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#004e47', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p>Loading onboarding pipelines...</p>
      </div>
    );
  }

  /* ── tab button ── */

  const TabButton = ({ tab, label, count }: { tab: Tab; label: string; count: number }) => (
    <button
      onClick={() => handleTabChange(tab)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 4px',
        height: '100%',
        border: 'none',
        background: 'none',
        color: activeTab === tab ? '#004e47' : '#545f73',
        fontWeight: activeTab === tab ? '700' : '500',
        borderBottom: activeTab === tab ? '2px solid #004e47' : '2px solid transparent',
        fontSize: '14px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      <span style={{
        backgroundColor: activeTab === tab ? '#00685f' : '#e1e2e5',
        color: activeTab === tab ? '#93e4d8' : '#191c1e',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '11px',
      }}>
        {count}
      </span>
    </button>
  );

  return (
    <div style={{ margin: '-32px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ── Sub-navigation ── */}
      <section style={{
        backgroundColor: '#ffffff',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E2E8F0',
        height: '56px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '32px', height: '100%' }}>
          <TabButton tab="new" label="New Requests" count={pendingCount} />
          <TabButton tab="accepted" label="Accepted" count={acceptedCount} />
          <TabButton tab="review" label="Declined" count={declinedCount} />
        </div>
        <button
          onClick={loadLabs}
          title="Refresh"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#545f73', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </section>

      {/* ── Main split canvas ── */}
      {displayedLabs.length === 0 || selectedLab === null ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '48px', backgroundColor: '#F8FAFC' }}>
          <ShieldCheck size={64} style={{ color: '#006c4a', marginBottom: '24px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0b1c30' }}>
            {activeTab === 'new' ? 'No pending applications' : activeTab === 'accepted' ? 'No accepted partners yet' : 'No declined applications'}
          </h3>
          <p style={{ color: '#545f73', marginTop: '8px' }}>
            {activeTab === 'new'
              ? 'All clinical providers have been cleared and verified.'
              : activeTab === 'accepted'
              ? 'Approved partners will appear here.'
              : 'No partner applications have been declined.'}
          </p>
        </div>
      ) : (
        <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ─── Left panel: scrollable partner list ─── */}
          <aside style={{
            width: '260px',
            flexShrink: 0,
            borderRight: '1px solid #E2E8F0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#fff' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {displayedLabs.length} {activeTab === 'new' ? 'Pending' : activeTab === 'accepted' ? 'Approved' : 'Declined'}
              </span>
            </div>
            {displayedLabs.map((lab) => {
              const isActive = lab._id === selectedLab._id;
              const sc = statusColor(lab.status);
              return (
                <button
                  key={lab._id}
                  onClick={() => setSelectedLab(lab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    border: 'none',
                    borderBottom: '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#e6f4f2' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderLeft: isActive ? '3px solid #004e47' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#004e47' : '#e6f4f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: isActive ? '#ffffff' : '#004e47',
                    flexShrink: 0,
                  }}>
                    {lab.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#0b1c30', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                      {lab.name}
                    </p>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      backgroundColor: sc.bg,
                      color: sc.text,
                      padding: '1px 6px',
                      borderRadius: '8px',
                      textTransform: 'uppercase',
                    }}>
                      {lab.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* ─── Centre panel: Document viewer ─── */}
          <section style={{ flex: 1, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', minWidth: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#545f73', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                Uploaded Documents — {selectedLab.name}
              </h4>
              {docsLoading && (
                <div style={{ width: '16px', height: '16px', border: '2px solid #E2E8F0', borderTopColor: '#004e47', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              )}
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {docsError ? (
                <div style={{ padding: '16px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#991b1b', fontSize: '13px' }}>
                  ⚠ {docsError}
                </div>
              ) : documents.length === 0 && !docsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', color: '#545f73', gap: '12px' }}>
                  <FileText size={40} style={{ color: '#CBD5E1' }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>No documents uploaded yet for this partner.</p>
                </div>
              ) : (
                documents.map((doc) => {
                  const isPdf = doc.mimeType === 'application/pdf';
                  const isImage = doc.mimeType.startsWith('image/');
                  const isPending = doc.status === 'pending_upload' || !doc.url;
                  const isOctetStream = doc.mimeType === 'application/octet-stream';
                  const ext = doc.fileName.split('.').pop()?.toLowerCase() ?? '';
                  // Office files can't render natively — use Google Docs Viewer
                  const looksLikeOffice = [
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  ].includes(doc.mimeType) || (isOctetStream && ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext));
                  const googleViewerUrl = doc.url
                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(doc.url)}&embedded=true`
                    : null;

                  return (
                    <div key={doc.id} style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={16} style={{ color: '#004e47' }} />
                          <div>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#0b1c30' }}>{doc.fileName}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#545f73' }}>
                              {doc.mimeType}
                              {doc.uploadedAt ? ` · ${new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                              {isPending && (
                                <span style={{ marginLeft: '8px', padding: '1px 6px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>
                                  PENDING UPLOAD
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {/* No external download link — all review is inline for data protection */}
                        {isPending && (
                          <span style={{ fontSize: '12px', color: '#94a3b8', padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                            Not available
                          </span>
                        )}
                      </div>

                      {/* Preview */}
                      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', backgroundColor: '#fafafa' }}>
                        {isPending ? (
                          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                            <FileText size={32} style={{ marginBottom: '8px', color: '#CBD5E1' }} />
                            <p style={{ margin: 0 }}>Upload not confirmed — partner may need to retry</p>
                          </div>
                        ) : isPdf ? (
                          <iframe src={doc.url!} title={doc.fileName} style={{ width: '100%', height: '520px', border: 'none', borderRadius: '4px' }} />
                        ) : isImage ? (
                          <img src={doc.url!} alt={doc.fileName} style={{ maxWidth: '100%', maxHeight: '520px', borderRadius: '6px', objectFit: 'contain' }} />
                        ) : looksLikeOffice && googleViewerUrl ? (
                          <iframe src={googleViewerUrl} title={doc.fileName} style={{ width: '100%', height: '520px', border: 'none', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ textAlign: 'center', color: '#545f73', fontSize: '13px' }}>
                            <FileText size={32} style={{ marginBottom: '8px', color: '#CBD5E1' }} />
                            <p style={{ margin: 0 }}>Preview not available for this file type</p>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>{doc.fileName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* ─── Right panel: Application Details & Decision ─── */}
          <section style={{ width: '340px', flexShrink: 0, backgroundColor: '#f2f4f6', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Applicant header */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#e6f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#004e47', flexShrink: 0 }}>
                    {selectedLab.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0b1c30', margin: 0 }}>{selectedLab.name}</h3>
                    <p style={{ fontSize: '12px', color: '#545f73', marginTop: '2px', marginBottom: '6px' }}>Clinical Diagnostics Partner</p>
                    <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: statusColor(selectedLab.status).bg, color: statusColor(selectedLab.status).text, padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                      {selectedLab.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase', fontWeight: '600' }}>Bank Name</span>
                    <p style={{ fontSize: '12px', color: '#191c1e', fontWeight: '600', marginTop: '2px', marginBottom: 0 }}>{selectedLab.bankDetails?.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase', fontWeight: '600' }}>Bank Acct No.</span>
                    <p style={{ fontSize: '12px', color: '#191c1e', fontWeight: '600', marginTop: '2px', marginBottom: 0 }}>{selectedLab.bankDetails?.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase', fontWeight: '600' }}>License No.</span>
                    <p style={{ fontSize: '12px', color: '#191c1e', fontWeight: '600', marginTop: '2px', marginBottom: 0 }}>{selectedLab.licenseNumber || 'PENDING'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase', fontWeight: '600' }}>Status</span>
                    <p style={{ fontSize: '12px', color: statusColor(selectedLab.status).text, fontWeight: '700', marginTop: '2px', marginBottom: 0, textTransform: 'uppercase' }}>{selectedLab.status}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '10px', color: '#545f73', textTransform: 'uppercase', fontWeight: '600' }}>Services</span>
                    <p style={{ fontSize: '12px', color: '#191c1e', fontWeight: '600', marginTop: '2px', marginBottom: 0, textTransform: 'capitalize' }}>{selectedLab.services.join(', ') || 'N/A'}</p>
                  </div>
                </div>

                {/* TreatRyte Account Number (shows after approval) */}
                {selectedLab.accountNumber && (
                  <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#e6f4f2', borderRadius: '8px', border: '1px solid #99d6cf', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BadgeCheck size={18} style={{ color: '#004e47', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#004e47', textTransform: 'uppercase' }}>TreatRyte Account No.</span>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#003b35', letterSpacing: '0.5px' }}>{selectedLab.accountNumber}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0b1c30', marginBottom: '14px', marginTop: 0 }}>Submission Checklist</h4>
                {[
                  { label: 'State Medical License', verified: true },
                  { label: 'Professional Liability Insurance', verified: true },
                  { label: 'Clinical Board Certification', verified: selectedLab.status === 'approved' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', marginBottom: '8px', backgroundColor: item.verified ? 'rgba(108,248,187,0.1)' : '#f8f9fc', border: `1px solid ${item.verified ? 'rgba(108,248,187,0.3)' : '#E2E8F0'}`, borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.verified ? <Check size={14} style={{ color: '#00714d' }} /> : <FileText size={14} style={{ color: '#545f73' }} />}
                      <span style={{ fontSize: '12px', color: '#191c1e' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: item.verified ? '#004e47' : '#545f73', fontWeight: '600' }}>
                      {item.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision footer */}
            <div style={{ padding: '20px 24px', backgroundColor: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '12px', flexShrink: 0 }}>
              {selectedLab.status === 'pending' ? (
                <>
                  <button
                    disabled={submitting}
                    onClick={() => setShowDeclineModal(true)}
                    className="btn btn-outline"
                    style={{ flexGrow: 1, padding: '12px', fontSize: '13px', fontWeight: '700', color: '#EF4444', borderColor: '#EF4444' }}
                  >
                    Decline
                  </button>
                  <button
                    disabled={submitting}
                    onClick={handleApprove}
                    className="btn btn-primary"
                    style={{ flexGrow: 2, padding: '12px', fontSize: '13px', fontWeight: '700', backgroundColor: '#004e47' }}
                  >
                    {submitting ? 'Processing...' : 'Approve Partnership'}
                  </button>
                </>
              ) : (
                <div style={{ width: '100%', textAlign: 'center', color: '#545f73', fontWeight: '600', fontSize: '13px' }}>
                  Audited &amp; Cleared: {selectedLab.status.toUpperCase()}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── Decline modal ── */}
      {showDeclineModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(11,28,48,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '512px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0b1c30', margin: 0 }}>Decline Application</h3>
              <button onClick={() => setShowDeclineModal(false)} style={{ background: 'none', border: 'none', color: '#545f73', cursor: 'pointer' }}>
                <XCircle size={20} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#545f73', marginBottom: '16px', marginTop: 0 }}>
              Select or enter compliance feedback to send to the partner.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {[
                'Incomplete documentation: Medical License was blurred.',
                'Certification Expired: Please upload a current Board Certification.',
                'NPI Mismatch: The provided NPI does not match public records.',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setDeclineReason(reason)}
                  style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: declineReason === reason ? '#e6f4f2' : 'white', cursor: 'pointer', color: declineReason === reason ? '#004e47' : '#191c1e', fontWeight: declineReason === reason ? '700' : '400' }}
                >
                  {reason.split(':')[0]}
                </button>
              ))}
            </div>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter detailed reasons here..."
              rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => setShowDeclineModal(false)} className="btn btn-outline" style={{ flexGrow: 1, padding: '12px' }}>
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
