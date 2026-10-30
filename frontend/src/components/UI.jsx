import React from 'react';

/**
 * Reusable status chip — matches Stitch pill design.
 */
const STATUS_STYLES = {
  'Submitted':    { bg: 'bg-surface-container-high',    text: 'text-on-surface',          dot: 'bg-on-surface-variant' },
  'Under Review': { bg: 'bg-surface-container-highest', text: 'text-primary',              dot: 'bg-primary' },
  'Assigned':     { bg: 'bg-secondary-container/30',    text: 'text-on-secondary-container', dot: 'bg-secondary' },
  'In Progress':  { bg: 'bg-amber-100',                 text: 'text-amber-800',            dot: 'bg-amber-500' },
  'Resolved':     { bg: 'bg-secondary-container',       text: 'text-on-secondary-container', dot: 'bg-secondary' },
  'Rejected':     { bg: 'bg-error-container',           text: 'text-on-error-container',   dot: 'bg-error' }
};

const PRIORITY_STYLES = {
  'Low':      { bg: 'bg-surface-container-high',  text: 'text-on-surface-variant', dot: 'bg-on-surface-variant' },
  'Medium':   { bg: 'bg-secondary-container/30',  text: 'text-on-secondary-container', dot: 'bg-secondary' },
  'High':     { bg: 'bg-amber-100',               text: 'text-amber-800',          dot: 'bg-amber-500' },
  'Critical': { bg: 'bg-error-container',         text: 'text-on-error-container', dot: 'bg-error animate-ping' }
};

export function StatusChip({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['Submitted'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full font-label-sm text-label-sm ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {status}
    </span>
  );
}

export function PriorityChip({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES['Medium'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full font-label-sm text-label-sm ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {priority}
    </span>
  );
}

/**
 * Reusable alert/error banner.
 */
export function AlertBanner({ type = 'error', message, onDismiss }) {
  if (!message) return null;
  const styles = {
    error:   'bg-error-container text-on-error-container',
    success: 'bg-secondary-container text-on-secondary-container',
    warning: 'bg-amber-50 text-amber-800',
    info:    'bg-surface-container text-on-surface'
  };
  const icons = { error: 'error', success: 'check_circle', warning: 'warning', info: 'info' };
  const roleMap = { error: 'alert', success: 'status', warning: 'alert', info: 'status' };
  return (
    <div
      className={`flex items-start gap-space-sm p-space-md rounded-xl ${styles[type]}`}
      role={roleMap[type]}
      aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
    >
      <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden="true">{icons[type]}</span>
      <p className="flex-1 font-body-md text-body-md">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Dismiss alert">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
        </button>
      )}
    </div>
  );
}

/**
 * Loading spinner with optional label.
 */
export function LoadingSpinner({ label = 'Loading…', size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center gap-space-sm py-space-xl" role="status" aria-live="polite">
      <div className={`${sizes[size]} rounded-full border-4 border-surface-container-high border-t-secondary animate-spin`} aria-hidden="true"></div>
      {label && <p className="font-body-sm text-body-sm text-on-surface-variant">{label}</p>}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Empty state block with icon and message.
 */
export function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-space-xl text-center space-y-space-md">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
        <span className="material-symbols-outlined text-[36px] text-on-surface-variant">{icon}</span>
      </div>
      <div className="space-y-space-xs max-w-sm">
        {title && <h3 className="font-headline-sm text-headline-sm text-primary">{title}</h3>}
        {description && <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * Config warning — shown when Supabase is not configured.
 */
export function ConfigWarning() {
  return (
    <div className="max-w-2xl mx-auto mt-space-xl px-margin">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-space-xl space-y-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-amber-600 text-[28px]">settings</span>
          <h2 className="font-headline-sm text-headline-sm text-amber-900">Frontend Configuration Required</h2>
        </div>
        <p className="font-body-md text-body-md text-amber-800">
          The Supabase environment variables are not yet configured. Authentication and data features will not work until you set up <code className="bg-amber-100 px-1 rounded">frontend/.env</code>.
        </p>
        <div className="bg-amber-100 rounded-lg p-space-md font-mono text-[12px] text-amber-900 space-y-1">
          <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
          <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
          <p>VITE_API_BASE_URL=http://localhost:5000/api</p>
        </div>
        <p className="font-body-sm text-body-sm text-amber-700">
          See <strong>LOCAL_SETUP.md</strong> in the project root for setup instructions.
        </p>
      </div>
    </div>
  );
}
