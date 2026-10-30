import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllComplaints, updateComplaintStatus, getOverviewAnalytics, analyzeComplaint } from '../lib/api';
import Layout from '../components/Layout';
import { StatusChip, PriorityChip, AlertBanner, LoadingSpinner, EmptyState } from '../components/UI';

const VALID_STATUSES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

const CATEGORY_COLORS = {
  'Roads and Potholes':           'bg-primary',
  'Garbage and Waste Management': 'bg-outline',
  'Water Supply':                 'bg-secondary',
  'Drainage and Sewage':          'bg-secondary',
  'Streetlights and Electricity': 'bg-tertiary-container',
  'Public Sanitation':            'bg-surface-container-high',
  'Public Infrastructure':        'bg-primary-container',
  'Other':                        'bg-outline-variant',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Status Update Modal ───────────────────────────────────────────────────────
function StatusModal({ complaint, token, onClose, onUpdated }) {
  const [status, setStatus] = useState(complaint.status);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const needsNote = status === 'Rejected';

  const handleSave = async () => {
    if (status === complaint.status && !note.trim()) { onClose(); return; }
    if (needsNote && !note.trim()) {
      setError('A rejection reason is required.');
      return;
    }
    setSaving(true);
    setError(null);
    const { data, error: err } = await updateComplaintStatus(complaint.id, { status, note: note.trim() }, token);
    setSaving(false);
    if (err) { setError(err); return; }
    onUpdated(data || { ...complaint, status });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md mx-margin p-space-xl space-y-space-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Update Status</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 font-mono">
              #{complaint.id?.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="space-y-space-xs">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Complaint</p>
          <p className="font-body-md text-body-md text-primary font-semibold">{complaint.title}</p>
          <div className="flex items-center gap-space-sm">
            <StatusChip status={complaint.status} />
            {complaint.priority && <PriorityChip priority={complaint.priority} />}
          </div>
        </div>

        <div className="space-y-space-xs">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">
            New Status
          </label>
          <div className="grid grid-cols-2 gap-space-xs">
            {VALID_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-space-sm py-2 rounded-lg font-label-md text-label-md text-left transition-all border ${
                  status === s
                    ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                    : 'bg-surface-container text-on-surface border-transparent hover:bg-surface-container-high'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Note / rejection reason */}
        <div className="space-y-space-xs">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">
            {needsNote ? (
              <span className="text-error">Rejection Reason <span className="normal-case">(required)</span></span>
            ) : 'Status Note (optional)'}
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={needsNote ? 'State the reason for rejection…' : 'Add a short note visible to the citizen…'}
            className={`w-full px-space-sm py-2 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 transition-all resize-none ${
              needsNote
                ? 'bg-error-container/30 focus:ring-error/40 border border-error/30'
                : 'bg-surface-container-low focus:ring-secondary/40 border border-transparent'
            }`}
          />
          <p className="font-label-sm text-[10px] text-on-surface-variant text-right">{note.length}/500</p>
        </div>

        {error && <AlertBanner type="error" message={error} />}

        <div className="flex gap-space-sm pt-space-xs">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || status === complaint.status}
            className="flex-1 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg shadow-sm hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-space-sm"
          >
            {saving && <span className="w-4 h-4 rounded-full border-2 border-on-secondary/30 border-t-on-secondary animate-spin"></span>}
            {saving ? 'Saving…' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, colorClass = 'text-primary', accent }) {
  return (
    <div className={`flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${accent ? 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:' + accent : ''}`}>
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</span>
        <span className={`material-symbols-outlined text-[20px] ${colorClass}`}>{icon}</span>
      </div>
      <div className="mt-space-sm">
        <span className={`font-display-lg text-display-lg ${colorClass}`}>{value ?? '—'}</span>
      </div>
    </div>
  );
}

// ─── Category Distribution Bar ─────────────────────────────────────────────────
function CategoryBar({ label, count, total, colorClass }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-xs font-label-md mb-1">
        <span className="text-on-surface flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded ${colorClass}`}></span>
          {label}
        </span>
        <span className="font-bold text-primary">
          {pct}% <span className="text-on-surface-variant font-normal">({count})</span>
        </span>
      </div>
      <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
        <div className={`${colorClass} h-full rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { token, profile } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalMsg, setGlobalMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Modal
  const [modalComplaint, setModalComplaint] = useState(null);

  // Analyze
  const [analyzingId, setAnalyzingId] = useState(null);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const [cRes, aRes] = await Promise.all([
      getAllComplaints(token),
      getOverviewAnalytics(token),
    ]);
    setLoading(false);
    if (cRes.error) { setError(cRes.error); return; }
    setComplaints(Array.isArray(cRes.data) ? cRes.data : []);
    if (!aRes.error) setAnalytics(aRes.data);
  };

  // Derived KPIs from complaints (fallback if analytics endpoint not available)
  const kpi = useMemo(() => {
    if (analytics) return analytics;
    const total = complaints.length;
    const submitted = complaints.filter(c => c.status === 'Submitted').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const assigned = complaints.filter(c => c.status === 'Assigned').length;
    return { total, submitted, inProgress, resolved, assigned };
  }, [analytics, complaints]);

  // Category breakdown
  const catBreakdown = useMemo(() => {
    const counts = {};
    complaints.forEach(c => {
      if (c.category) counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  // Filtered list
  const filtered = useMemo(() => {
    return complaints.filter(c => {
      if (filterStatus !== 'All' && c.status !== filterStatus) return false;
      if (filterPriority !== 'All' && c.priority !== filterPriority) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.title?.toLowerCase().includes(q) ||
          c.id?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [complaints, filterStatus, filterPriority, search]);

  const handleStatusUpdated = (updated) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
    setGlobalMsg({ type: 'success', text: `Status updated to "${updated.status}".` });
    setTimeout(() => setGlobalMsg(null), 4000);
  };

  const handleAnalyze = async (id) => {
    setAnalyzingId(id);
    const { error: err } = await analyzeComplaint(id, token);
    setAnalyzingId(null);
    if (err) {
      setGlobalMsg({ type: 'error', text: `AI analysis failed: ${err}` });
    } else {
      setGlobalMsg({ type: 'success', text: 'AI analysis complete.' });
      // Refresh complaint data
      const { data } = await getAllComplaints(token);
      if (Array.isArray(data)) setComplaints(data);
    }
    setTimeout(() => setGlobalMsg(null), 4000);
  };

  return (
    <Layout>
      {/* Page header */}
      <div className="w-full bg-primary px-margin py-space-lg">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wide">
                Admin Operations
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-primary">Operations Dashboard</h1>
            <p className="font-body-md text-body-md text-on-primary/70 mt-0.5">
              {profile?.email || 'Administrator'} · Manage all civic complaints
            </p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-space-sm px-space-lg py-2.5 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg shadow-sm hover:bg-opacity-90 transition-all self-start"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-margin py-space-lg space-y-space-lg">

        {globalMsg && (
          <AlertBanner type={globalMsg.type} message={globalMsg.text} onDismiss={() => setGlobalMsg(null)} />
        )}

        {error && <AlertBanner type="error" message={error} />}

        {/* ── KPI Cards ── */}
        {!loading && (
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-md">
              <KpiCard label="Total" value={kpi.total} icon="layers" colorClass="text-primary" />
              <KpiCard label="Pending Triage" value={kpi.submitted} icon="pending_actions" colorClass="text-error" accent="bg-error" />
              <KpiCard label="Assigned" value={kpi.assigned} icon="assignment_turned_in" colorClass="text-on-surface-variant" />
              <KpiCard label="In Progress" value={kpi.inProgress} icon="engineering" colorClass="text-secondary" />
              <KpiCard label="Resolved" value={kpi.resolved} icon="check_circle" colorClass="text-secondary" />
            </div>
          </section>
        )}

        {/* ── Two-column split: Table + Analytics sidebar ── */}
        <section>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">

            {/* ── LEFT: Complaint management table ── */}
            <div className="xl:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Filter/search bar */}
              <div className="p-space-md bg-surface-container-low flex flex-col lg:flex-row gap-space-sm items-stretch lg:items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by ID, title, category, description…"
                    className="w-full pl-11 pr-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
                  />
                </div>
                {/* Status filter */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="appearance-none bg-surface-container-lowest pl-3 pr-8 py-2.5 rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
                  >
                    <option value="All">Status: All</option>
                    {VALID_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">arrow_drop_down</span>
                </div>
                {/* Priority filter */}
                <div className="relative">
                  <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    className="appearance-none bg-surface-container-lowest pl-3 pr-8 py-2.5 rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
                  >
                    <option value="All">Priority: All</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">arrow_drop_down</span>
                </div>
              </div>

              {/* Table */}
              {loading ? (
                <div className="p-space-xl">
                  <LoadingSpinner label="Loading complaints…" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-space-xl">
                  <EmptyState
                    icon="filter_alt"
                    title="No complaints match"
                    description="Try adjusting your search or filter criteria."
                  />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low/50 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                          <th className="py-3 px-space-sm">ID</th>
                          <th className="py-3 px-space-md min-w-[200px]">Issue & Category</th>
                          <th className="py-3 px-space-sm">Status</th>
                          <th className="py-3 px-space-sm">Priority</th>
                          <th className="py-3 px-space-sm">Submitted</th>
                          <th className="py-3 px-space-sm text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container-low">
                        {filtered.map(c => (
                          <tr key={c.id} className="hover:bg-surface-container-low/60 transition-colors group">
                            <td className="py-3 px-space-sm font-label-sm text-label-sm font-mono text-on-surface-variant">
                              #{c.id?.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="py-3 px-space-md">
                              <div className="flex flex-col">
                                <span className="font-semibold text-primary truncate max-w-[220px]">{c.title}</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">{c.category}</span>
                              </div>
                            </td>
                            <td className="py-3 px-space-sm">
                              <StatusChip status={c.status} />
                            </td>
                            <td className="py-3 px-space-sm">
                              {c.priority ? <PriorityChip priority={c.priority} /> : (
                                <span className="text-on-surface-variant font-label-sm text-label-sm italic">—</span>
                              )}
                            </td>
                            <td className="py-3 px-space-sm text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">
                              {formatDate(c.createdAt || c.created_at)}
                            </td>
                            <td className="py-3 px-space-sm text-right">
                              <div className="flex items-center justify-end gap-space-xs">
                                {/* Analyze button */}
                                {c.aiStatus !== 'completed' && (
                                  <button
                                    onClick={() => handleAnalyze(c.id)}
                                    disabled={analyzingId === c.id}
                                    title="Run AI Analysis"
                                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-secondary-container/30 transition-colors disabled:opacity-50"
                                  >
                                    {analyzingId === c.id
                                      ? <span className="w-4 h-4 block rounded-full border-2 border-secondary/30 border-t-secondary animate-spin"></span>
                                      : <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                                    }
                                  </button>
                                )}
                                {/* Status update button */}
                                <button
                                  onClick={() => setModalComplaint(c)}
                                  title="Update Status"
                                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit_square</span>
                                </button>
                                {/* View detail */}
                                <Link
                                  to={`/complaints/${c.id}`}
                                  title="View Details"
                                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-space-md py-space-sm bg-surface-container-low/50 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                    <span>Showing {filtered.length} of {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}</span>
                    {search || filterStatus !== 'All' || filterPriority !== 'All' ? (
                      <button
                        onClick={() => { setSearch(''); setFilterStatus('All'); setFilterPriority('All'); }}
                        className="text-secondary font-label-sm text-label-sm hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        Clear filters
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            {/* ── RIGHT: Analytics sidebar ── */}
            <div className="xl:col-span-4 space-y-space-md">

              {/* Community stats 3-card */}
              <div className="grid grid-cols-3 gap-space-sm">
                <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total</span>
                  <span className="font-display-lg text-[24px] font-bold text-primary mt-1 leading-tight">{kpi.total ?? '—'}</span>
                </div>
                <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Resolved</span>
                  <span className="font-display-lg text-[24px] font-bold text-secondary mt-1 leading-tight">{kpi.resolved ?? '—'}</span>
                </div>
                <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Pending</span>
                  <span className="font-display-lg text-[24px] font-bold text-error mt-1 leading-tight">{kpi.submitted ?? '—'}</span>
                </div>
              </div>

              {/* Category distribution */}
              {catBreakdown.length > 0 && (
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-space-md">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary">Category Distribution</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Breakdown by type</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">bar_chart</span>
                  </div>
                  <div className="space-y-3">
                    {catBreakdown.slice(0, 6).map(([cat, count]) => (
                      <CategoryBar
                        key={cat}
                        label={cat}
                        count={count}
                        total={complaints.length}
                        colorClass={CATEGORY_COLORS[cat] || 'bg-outline-variant'}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Status distribution */}
              {!loading && complaints.length > 0 && (
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-space-md">Status Breakdown</h3>
                  <div className="space-y-space-xs">
                    {VALID_STATUSES.map(s => {
                      const count = complaints.filter(c => c.status === s).length;
                      if (count === 0) return null;
                      return (
                        <div key={s} className="flex items-center justify-between">
                          <button
                            onClick={() => setFilterStatus(filterStatus === s ? 'All' : s)}
                            className="flex items-center gap-space-sm text-on-surface hover:text-secondary transition-colors font-body-sm text-body-sm"
                          >
                            <StatusChip status={s} />
                          </button>
                          <span className="font-label-md text-label-md font-bold text-primary">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick link to map */}
              <Link
                to="/map"
                className="flex items-center justify-between p-space-md bg-primary text-on-primary rounded-xl shadow-sm hover:bg-primary-container transition-all group"
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[24px] text-secondary">map</span>
                  <div>
                    <p className="font-headline-sm text-headline-sm">Hotspot Map</p>
                    <p className="font-body-sm text-body-sm text-on-primary/70">View spatial clustering</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-on-primary/60 group-hover:text-secondary transition-colors">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Status update modal */}
      {modalComplaint && (
        <StatusModal
          complaint={modalComplaint}
          token={token}
          onClose={() => setModalComplaint(null)}
          onUpdated={handleStatusUpdated}
        />
      )}
    </Layout>
  );
}
