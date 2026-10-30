import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyComplaints } from '../lib/api';
import Layout from '../components/Layout';
import { StatusChip, PriorityChip, AlertBanner, LoadingSpinner, EmptyState } from '../components/UI';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MyComplaintsPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  const STATUSES = ['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      const { data, error: err } = await getMyComplaints(token);
      setLoading(false);
      if (err) { setError(err); return; }
      setComplaints(Array.isArray(data) ? data : []);
    })();
  }, [token]);

  const visible = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <Layout>
      {/* Page header */}
      <div className="w-full bg-surface-container-low px-margin py-space-lg shadow-sm">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-1">Citizen Portal</p>
            <h1 className="font-headline-lg text-headline-lg text-primary">My Complaints</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Track the status of your submitted civic complaints.
            </p>
          </div>
          <Link
            to="/submit"
            className="inline-flex items-center gap-space-sm px-space-lg py-2.5 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg shadow-sm hover:bg-opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Report New Issue
          </Link>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-margin py-space-lg space-y-space-lg">
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-space-xs overflow-x-auto pb-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                filter === s
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {s}
              {s !== 'All' && (
                <span className={`ml-1 text-[10px] ${filter === s ? 'text-on-primary/70' : 'text-on-surface-variant/60'}`}>
                  {complaints.filter(c => c.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && <AlertBanner type="error" message={error} />}

        {loading ? (
          <LoadingSpinner label="Loading your complaints…" />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={filter === 'All' ? 'inbox' : 'filter_alt'}
            title={filter === 'All' ? 'No complaints yet' : `No ${filter} complaints`}
            description={
              filter === 'All'
                ? 'You haven\'t submitted any civic complaints yet. Use the button above to report an issue in your area.'
                : `You have no complaints with status "${filter}".`
            }
            action={
              filter === 'All' && (
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-space-sm px-space-lg py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md shadow-sm hover:bg-opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Report an Issue
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-space-sm">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Showing {visible.length} of {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-space-sm">
              {visible.map(c => (
                <Link
                  key={c.id}
                  to={`/complaints/${c.id}`}
                  className="block bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md border border-transparent hover:border-secondary/30 transition-all p-space-md group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
                    <div className="flex-1 min-w-0 space-y-space-xs">
                      <div className="flex flex-wrap items-center gap-space-sm">
                        <span className="font-label-sm text-label-sm font-mono text-on-surface-variant">
                          #{c.id?.slice(0, 8).toUpperCase()}
                        </span>
                        <StatusChip status={c.status} />
                        {c.priority && <PriorityChip priority={c.priority} />}
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors truncate">
                        {c.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm">
                        <span className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[14px]">category</span>
                          {c.category}
                        </span>
                        <span className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {formatDate(c.createdAt || c.created_at)}
                        </span>
                        {c.aiStatus === 'completed' && (
                          <span className="flex items-center gap-space-xs text-secondary">
                            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                            AI Analyzed
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors text-[20px]">
                        chevron_right
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
