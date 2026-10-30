import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getComplaintById, getComplaintDuplicates, analyzeComplaint } from '../lib/api';
import Layout from '../components/Layout';
import { StatusChip, PriorityChip, AlertBanner, LoadingSpinner } from '../components/UI';

const AI_STATUS_LABELS = {
  completed: { icon: 'check_circle', color: 'text-secondary', label: 'AI Analysis Complete' },
  unavailable: { icon: 'psychology_alt', color: 'text-on-surface-variant', label: 'AI Unavailable' },
  failed: { icon: 'error', color: 'text-error', label: 'AI Analysis Failed' },
  pending: { icon: 'hourglass_empty', color: 'text-amber-600', label: 'AI Analysis Pending' }
};

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [complaint, setComplaint] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState(null);
  const [showDuplicates, setShowDuplicates] = useState(true);

  const fromSubmit = location.state?.fromSubmit;

  useEffect(() => {
    if (!id || !token) return;
    loadComplaint();
  }, [id, token]);

  const loadComplaint = async () => {
    setLoading(true);
    setError(null);
    const [complaintRes, dupRes] = await Promise.all([
      getComplaintById(id, token),
      getComplaintDuplicates(id, token)
    ]);
    setLoading(false);
    if (complaintRes.error) { setError(complaintRes.error); return; }
    setComplaint(complaintRes.data);
    setDuplicates(Array.isArray(dupRes.data) ? dupRes.data : []);
  };

  const handleReanalyze = async () => {
    if (!token) return;
    setAnalyzing(true);
    setAnalyzeMsg(null);
    const { data, error: err } = await analyzeComplaint(id, token);
    setAnalyzing(false);
    if (err) {
      setAnalyzeMsg({ type: 'error', text: err });
    } else {
      setComplaint(data);
      setAnalyzeMsg({ type: 'success', text: 'AI analysis refreshed successfully.' });
    }
  };

  if (loading) return <Layout><div className="max-w-4xl mx-auto px-margin"><LoadingSpinner label="Loading complaint details…" /></div></Layout>;
  if (error) return <Layout><div className="max-w-4xl mx-auto px-margin mt-space-xl"><AlertBanner type="error" message={error} /></div></Layout>;
  if (!complaint) return null;

  const aiMeta = AI_STATUS_LABELS[complaint.aiStatus] || AI_STATUS_LABELS['pending'];
  const hasAiData = complaint.aiStatus === 'completed' && complaint.summary;

  return (
    <Layout>
      {/* Top meta bar */}
      <div className="w-full bg-surface-container-low px-margin py-space-md shadow-sm">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant flex-wrap">
            <Link to="/complaints" className="hover:text-primary transition-colors">My Complaints</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-mono text-on-surface font-semibold">{complaint.id?.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <StatusChip status={complaint.status} />
            <PriorityChip priority={complaint.priority} />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="w-full bg-primary text-on-primary px-margin py-space-lg shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-1">
            {fromSubmit && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm mb-2">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Complaint Submitted Successfully
              </div>
            )}
            <h2 className="font-headline-md text-headline-md text-on-primary tracking-tight line-clamp-2">{complaint.title}</h2>
            <p className="font-body-md text-body-md text-surface-container-high flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-fixed text-[18px]">location_on</span>
              {complaint.locationLabel || `${Number(complaint.latitude).toFixed(4)}°, ${Number(complaint.longitude).toFixed(4)}°`}
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="bg-primary-container px-space-md py-space-sm rounded-lg text-right">
              <span className="block font-label-sm text-label-sm text-on-primary-container uppercase">Submitted</span>
              <span className="font-mono font-bold text-white text-sm">
                {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-margin py-space-xl space-y-space-xl">
        {analyzeMsg && (
          <AlertBanner type={analyzeMsg.type} message={analyzeMsg.text} onDismiss={() => setAnalyzeMsg(null)} />
        )}

        {/* Duplicate candidates banner */}
        {duplicates.length > 0 && (
          <div className="w-full rounded-xl bg-surface-container-low shadow-sm overflow-hidden">
            <div className="p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="flex items-start gap-space-md">
                <div className="w-12 h-12 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">join_inner</span>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm">Possible Duplicate</span>
                    <h3 className="font-headline-sm text-headline-sm text-primary">{duplicates.length} Similar Complaint{duplicates.length > 1 ? 's' : ''} Detected</h3>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Nearby complaints with similar descriptions were found. Review below to avoid duplicates.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDuplicates(o => !o)}
                className="px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-bright font-label-lg text-label-lg shadow-sm transition-all flex items-center gap-1"
              >
                {showDuplicates ? 'Hide' : `Review ${duplicates.length} Matches`}
                <span className="material-symbols-outlined text-[20px]">{showDuplicates ? 'expand_less' : 'expand_more'}</span>
              </button>
            </div>
            {showDuplicates && (
              <div className="p-space-lg bg-surface-container-lowest grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {duplicates.map(dup => (
                  <div key={dup.id} className="p-space-md rounded-lg bg-surface-container-low shadow-sm space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-primary text-[12px]">{dup.candidateComplaintId?.slice(0, 8).toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                        {dup.similarityScore}% Match
                      </span>
                    </div>
                    <div className="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">near_me</span>
                        {Math.round(dup.distanceMeters)}m away
                      </span>
                    </div>
                    {Array.isArray(dup.reasons) && dup.reasons.slice(0, 2).map((r, i) => (
                      <p key={i} className="font-body-sm text-body-sm text-on-surface-variant">{r}</p>
                    ))}
                    <Link
                      to={`/complaints/${dup.candidateComplaintId}`}
                      className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm hover:underline"
                    >
                      View complaint <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left: AI analysis + original text */}
          <div className="lg:col-span-7 space-y-space-lg">

            {/* AI Classification */}
            <div className="rounded-xl bg-surface-container-lowest p-space-xl shadow-md space-y-space-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">cognition</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">AI Analysis</span>
                    <h3 className="font-headline-md text-headline-md text-primary">Classification &amp; Routing</h3>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md ${aiMeta.color}`}>
                  <span className="material-symbols-outlined text-[18px]">{aiMeta.icon}</span>
                  <span>{aiMeta.label}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md p-space-md rounded-lg bg-surface-container-low">
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Category</span>
                  <p className="font-headline-sm text-headline-sm text-primary font-bold">{complaint.category || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Assigned Department</span>
                  <p className="font-body-lg text-body-lg text-on-surface font-semibold">{complaint.department || complaint.suggestedDepartment || '—'}</p>
                </div>
              </div>

              {hasAiData && (
                <div className="space-y-space-md">
                  <div className="p-space-md rounded-lg bg-surface-container-low">
                    <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider block mb-2">AI Summary</span>
                    <p className="font-body-lg text-body-lg text-primary leading-relaxed">{complaint.summary}</p>
                  </div>

                  {Array.isArray(complaint.keywords) && complaint.keywords.length > 0 && (
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-2">Keywords</span>
                      <div className="flex flex-wrap gap-space-xs">
                        {complaint.keywords.map((kw, i) => (
                          <span key={i} className="px-space-sm py-0.5 bg-surface-container rounded-full font-label-sm text-label-sm text-on-surface">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {complaint.aiStatus !== 'completed' && (
                <div className="bg-surface-container p-space-md rounded-lg space-y-space-sm">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {complaint.aiStatus === 'unavailable'
                      ? 'AI analysis was not available when this complaint was submitted. You can request analysis now.'
                      : 'AI analysis is pending or failed. Request a new analysis below.'
                    }
                  </p>
                  <button
                    onClick={handleReanalyze}
                    disabled={analyzing}
                    className="flex items-center gap-1 px-space-md py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-on-secondary-container transition-all disabled:opacity-50"
                  >
                    {analyzing
                      ? <><span className="w-4 h-4 rounded-full border-2 border-on-secondary border-t-transparent animate-spin"></span> Analysing…</>
                      : <><span className="material-symbols-outlined text-[18px]">psychology</span> Request AI Analysis</>
                    }
                  </button>
                </div>
              )}
            </div>

            {/* Original description */}
            <div className="rounded-xl bg-surface-container-lowest p-space-xl shadow-md space-y-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container text-on-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">description</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Original Report</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Citizen Submission</h3>
                </div>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container-low">
                <p className="font-body-lg text-body-lg text-primary leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
              </div>
            </div>
          </div>

          {/* Right: Priority + Location + Status history */}
          <div className="lg:col-span-5 space-y-space-lg">

            {/* Priority */}
            <div className="rounded-xl bg-surface-container-lowest p-space-xl shadow-md space-y-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-primary">Priority</h3>
                <PriorityChip priority={complaint.priority} />
              </div>
              <div className="p-space-md rounded-lg bg-surface-container flex items-center justify-between gap-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Civic Threat Index</span>
                  <div className="font-display-lg text-display-lg text-primary font-bold leading-none">
                    {complaint.priorityScore}<span className="text-headline-sm text-on-surface-variant">/100</span>
                  </div>
                </div>
                <div className="w-20 h-20 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                    <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${complaint.priorityScore}, 100`} strokeLinecap="round" strokeWidth="3.8" />
                  </svg>
                </div>
              </div>
              {Array.isArray(complaint.priorityReasons) && complaint.priorityReasons.length > 0 && (
                <div className="space-y-space-sm">
                  <span className="font-label-md text-label-md text-primary font-bold block">Why this priority:</span>
                  {complaint.priorityReasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
                      <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0">info</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status History */}
            {Array.isArray(complaint.statusHistory) && complaint.statusHistory.length > 0 && (
              <div className="rounded-xl bg-surface-container-lowest p-space-xl shadow-md space-y-space-lg">
                <div className="flex items-center gap-space-sm border-b pb-space-sm">
                  <span className="material-symbols-outlined text-primary text-[24px]">history_edu</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Status History</h3>
                </div>
                <div className="grid grid-cols-1 gap-space-md">
                  {complaint.statusHistory.map((entry, i) => (
                    <div key={i} className="flex items-start gap-space-sm">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        i === complaint.statusHistory.length - 1 ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-container-high text-on-surface'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">history</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        <h5 className="font-label-lg text-label-lg text-primary">{entry.status}</h5>
                        {entry.note && <p className="font-body-sm text-body-sm text-on-surface-variant">{entry.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="rounded-xl bg-surface-container-high p-space-lg shadow-sm space-y-space-md">
              <Link
                to="/complaints"
                className="w-full py-space-sm px-space-md rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-bright transition-colors font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to My Complaints
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Manage in Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
