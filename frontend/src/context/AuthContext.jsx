import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getMe } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Supabase auth user
  const [profile, setProfile] = useState(null); // Backend profile with authoritative role
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const configured = isSupabaseConfigured();

  /**
   * Fetches the server-side user profile which contains the authoritative role.
   * Never trust a role from the frontend token payload directly for permission checks.
   */
  const loadProfile = useCallback(async (accessToken) => {
    if (!accessToken) {
      setProfile(null);
      return;
    }
    const { data, error } = await getMe(accessToken);
    if (!error && data) {
      setProfile(data);
    } else {
      // If backend is down, create a minimal profile from the auth token
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
        await loadProfile(session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
        await loadProfile(session.access_token);
      } else {
        setUser(null);
        setToken(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [configured, loadProfile]);

  const signIn = async (email, password) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return { error: error.message };
    }
    return { data };
  };

  const signUp = async (email, password, fullName) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) {
      setAuthError(error.message);
      return { error: error.message };
    }
    return { data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    setProfile(null);
  };

  const isAdmin = profile?.isAdmin === true || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      token,
      loading,
      authError,
      isAdmin,
      configured,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
