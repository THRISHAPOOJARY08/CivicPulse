/**
 * Centralized API client for CivicPulse backend.
 * All requests go through /api (proxied via Vite to http://localhost:5000/api in dev).
 * In production, set VITE_API_BASE_URL to the deployed backend URL.
 */

// Ensure API_BASE always ends without a trailing slash and includes /api path.
// If VITE_API_BASE_URL is set (e.g. http://localhost:5000/api), use it as-is.
// If VITE_API_BASE_URL is set WITHOUT /api (e.g. http://localhost:5000), append /api.
// If not set at all, fall back to '/api' (uses Vite proxy — recommended for local dev).
let API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
if (API_BASE !== '/api' && !API_BASE.endsWith('/api')) {
  API_BASE = API_BASE.replace(/\/$/, '') + '/api';
}

/**
 * Core fetch wrapper. Attaches Bearer token if available.
 * Returns { data, error, status } — never throws.
 */
async function apiFetch(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    let body;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      return {
        data: null,
        error: body?.error?.message || `Request failed with status ${response.status}`,
        errorCode: body?.error?.code || 'API_ERROR',
        status: response.status
      };
    }

    return { data: body?.data ?? body, error: null, status: response.status, message: body?.message };
  } catch (networkError) {
    return {
      data: null,
      error: 'Network error — is the backend running on port 5000?',
      errorCode: 'NETWORK_ERROR',
      status: 0
    };
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const getMe = (token) => apiFetch('/me', { method: 'GET' }, token);

export const verifyAdmin = (token) => apiFetch('/admin/verify', { method: 'GET' }, token);

// ─── Health ─────────────────────────────────────────────────────────────────

export const getHealth = () => apiFetch('/health', { method: 'GET' });

// ─── Complaints ─────────────────────────────────────────────────────────────

export const submitComplaint = (payload, token) =>
  apiFetch('/complaints', { method: 'POST', body: JSON.stringify(payload) }, token);

export const getMyComplaints = (token) =>
  apiFetch('/complaints/mine', { method: 'GET' }, token);

export const getAllComplaints = (token) =>
  apiFetch('/complaints', { method: 'GET' }, token);

export const getComplaintById = (id, token) =>
  apiFetch(`/complaints/${id}`, { method: 'GET' }, token);

export const updateComplaintStatus = (id, payload, token) =>
  apiFetch(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }, token);

export const analyzeComplaint = (id, token) =>
  apiFetch(`/complaints/${id}/analyze`, { method: 'POST' }, token);

export const getComplaintDuplicates = (id, token) =>
  apiFetch(`/complaints/${id}/duplicates`, { method: 'GET' }, token);

// ─── Analytics ──────────────────────────────────────────────────────────────

export const getOverviewAnalytics = (token) =>
  apiFetch('/analytics/overview', { method: 'GET' }, token);

export const getHotspots = (token) =>
  apiFetch('/analytics/hotspots', { method: 'GET' }, token);

// ─── Public map (no auth required — uses /complaints/mine fallback for public) ──
// The map uses public complaint data. We fetch from /complaints (admin) or
// /complaints/mine (citizen). For a fully public map, the backend would need
// a public endpoint; we use the authenticated endpoints with the current user's token.

export default apiFetch;
