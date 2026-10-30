const { isConfigured: isSupabaseConfigured, getSupabaseClient, getSupabaseAdmin } = require('../config/supabase');

/**
 * Middleware: requireAuth
 * Verifies the user's access token from the Authorization header (Bearer <token>).
 * Uses Supabase Auth's server-side getUser(token) verification.
 * Attaches verified user information and server-verified role to `req.user`.
 * 
 * Returns:
 * - 401 if token is missing, expired, revoked, or invalid
 * - 503 if Supabase is not configured on the server
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authorization header with Bearer token is required'
      }
    });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Token not provided in Authorization header'
      }
    });
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'AUTH_SERVICE_UNAVAILABLE',
        message: 'Authentication service is not configured on this server'
      }
    });
  }

  try {
    const client = getSupabaseClient();
    const { data: { user }, error } = await client.auth.getUser(token);

    if (error || !user) {
      const isExpired = error?.message?.toLowerCase().includes('expired') || error?.code === 'token_expired';
      return res.status(401).json({
        success: false,
        error: {
          code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
          message: isExpired ? 'Authentication token has expired' : (error?.message || 'Invalid authentication token')
        }
      });
    }

    // Query trusted server-side user role from public.users table using service_role
    // Never trust client-supplied metadata or request bodies for roles
    let role = 'citizen';
    let fullName = user.user_metadata?.full_name || '';

    try {
      const adminClient = getSupabaseAdmin();
      const { data: userProfile } = await adminClient
        .from('users')
        .select('role, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (userProfile && userProfile.role) {
        role = userProfile.role;
        if (userProfile.full_name) fullName = userProfile.full_name;
      } else if (user.app_metadata && user.app_metadata.role) {
        role = user.app_metadata.role;
      }
    } catch (roleQueryErr) {
      // Fall back to server app_metadata if table query encounters an issue
      role = user.app_metadata?.role || 'citizen';
    }

    req.user = {
      id: user.id,
      uid: user.id, // For backward compatibility with existing callers
      email: user.email || null,
      name: fullName || user.email?.split('@')[0] || 'Citizen',
      role: role,
      isAdmin: role === 'admin',
      supabaseUser: user
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Failed to verify authentication token'
      }
    });
  }
};

/**
 * Middleware: requireAdmin
 * Ensures the authenticated user possesses the 'admin' role.
 * Role is derived exclusively from trusted server-side authorization.
 * Must be preceded by `requireAuth`.
 * 
 * Returns:
 * - 401 if user is not authenticated
 * - 403 if user lacks admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required'
      }
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Administrator privileges required'
      }
    });
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
