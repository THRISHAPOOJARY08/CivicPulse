const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;
let supabaseClient = null;

/**
 * Checks if Supabase credentials are configured in the environment.
 */
const isConfigured = () => {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
};

/**
 * Initializes Supabase clients safely.
 * Non-fatal if keys are missing on startup to ensure public health endpoints function.
 */
function initializeSupabase() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!serviceRoleKey && !anonKey)) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '[Supabase] Warning: SUPABASE_URL or API keys are missing. ' +
        'Supabase authentication and database operations will fail securely until configured in .env.'
      );
    }
    return;
  }

  try {
    // Service-role client for privileged backend queries (bypasses RLS server-side)
    if (serviceRoleKey) {
      supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }

    // Anon client for user token verification and client-level queries
    if (anonKey) {
      supabaseClient = createClient(url, anonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }

    console.log(`[Supabase] Initialized successfully for URL: ${url}`);
  } catch (err) {
    console.error('[Supabase] Initialization error:', err.message);
  }
}

// Initial setup attempt
initializeSupabase();

/**
 * Returns the admin client with service_role privileges.
 * IMPORTANT: Service-role operations bypass Row Level Security.
 * Server endpoints MUST perform explicit user authorization (requireAuth, requireAdmin).
 */
const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    initializeSupabase();
    if (!supabaseAdmin) {
      const error = new Error('Supabase Admin client is not configured (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing)');
      error.statusCode = 503;
      error.code = 'SUPABASE_NOT_CONFIGURED';
      throw error;
    }
  }
  return supabaseAdmin;
};

/**
 * Returns the standard client with anon key.
 */
const getSupabaseClient = () => {
  if (!supabaseClient && !supabaseAdmin) {
    initializeSupabase();
    if (!supabaseClient && !supabaseAdmin) {
      const error = new Error('Supabase client is not configured (SUPABASE_URL or SUPABASE_ANON_KEY missing)');
      error.statusCode = 503;
      error.code = 'SUPABASE_NOT_CONFIGURED';
      throw error;
    }
  }
  return supabaseClient || supabaseAdmin;
};

module.exports = {
  isConfigured,
  getSupabaseAdmin,
  getSupabaseClient
};
