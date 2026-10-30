/**
 * Deprecated: Firebase Admin SDK has been decommissioned.
 * All authentication, database, and admin operations are now powered by Supabase (Milestone 8).
 */
module.exports = {
  isConfigured: () => false,
  getAuth: () => { throw new Error('Firebase Auth has been deprecated in favor of Supabase'); },
  getFirestore: () => { throw new Error('Firestore has been deprecated in favor of Supabase PostgreSQL'); }
};
