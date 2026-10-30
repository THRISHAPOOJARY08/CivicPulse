/**
 * CivicPulse — Supabase Admin Role Bootstrap Script
 * Assigns the 'admin' role to a designated user in public.users.
 * 
 * Usage:
 *   node scripts/set-admin-supabase.js <USER_EMAIL_OR_UUID>
 */
const path = require('path');
// Require dotenv from backend/node_modules so this script works from any cwd
require(path.resolve(__dirname, '../backend/node_modules/dotenv')).config({
  path: path.resolve(__dirname, '../backend/.env')
});

const { getSupabaseAdmin, isConfigured } = require('../backend/src/config/supabase');

async function setAdmin() {
  const target = process.argv[2] || process.env.ADMIN_EMAIL || process.env.ADMIN_UID;

  if (!isConfigured()) {
    console.error('Error: Supabase is not configured. Please populate SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.');
    process.exit(1);
  }

  if (!target) {
    console.error('Usage: node scripts/set-admin-supabase.js <USER_EMAIL_OR_UUID>');
    console.error('Example: node scripts/set-admin-supabase.js admin@civicpulse.org');
    process.exit(1);
  }

  try {
    const supabase = getSupabaseAdmin();
    console.log(`Setting admin role for user: ${target}...`);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);
    const column = isUuid ? 'id' : 'email';

    const { data, error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq(column, target)
      .select()
      .single();

    if (error) {
      console.error('Failed to update role in public.users:', error.message);
      console.log('Tip: Ensure the user has registered in Supabase Auth first so a public.users row exists.');
      process.exit(1);
    }

    console.log(`Verification successful! User ${data.email} (${data.id}) is now granted role: "${data.role}".`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

setAdmin();
