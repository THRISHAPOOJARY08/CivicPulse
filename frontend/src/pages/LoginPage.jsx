import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertBanner } from '../components/UI';

export default function LoginPage() {
  const { signIn, user, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate(location.state?.from || '/complaints');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header strip */}
      <div className="w-full bg-primary py-space-md px-margin flex items-center justify-between">
        <Link to="/" className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-secondary-fixed text-[24px]">account_balance</span>
          <span className="font-headline-sm text-headline-sm text-surface-bright">CivicPulse</span>
        </Link>
        <Link to="/" className="flex items-center gap-1 text-inverse-primary hover:text-surface-bright font-label-md text-label-md transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-margin py-space-xl">
        <div className="w-full max-w-md space-y-space-lg">
          {/* Title */}
          <div className="text-center space-y-space-xs">
            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-on-primary text-[32px]">login</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Citizen Sign-In</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Access your civic dashboard and complaint history.</p>
          </div>

          {!configured && (
            <AlertBanner type="warning" message="Supabase is not yet configured. Sign-in will not work until frontend/.env is set up." />
          )}

          {successMsg && <AlertBanner type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />}
          {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl space-y-space-md" noValidate aria-label="Sign in form">
            <div className="space-y-space-xs">
              <label htmlFor="email" className="font-label-lg text-label-lg text-primary block">
                Email Address <span className="text-error" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-3 text-[20px]" aria-hidden="true">mail</span>
                <input
                  id="email"
                  type="email"
                  required
                  aria-required="true"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-10 pr-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                />
              </div>
            </div>

            <div className="space-y-space-xs">
              <label htmlFor="password" className="font-label-lg text-label-lg text-primary block">
                Password <span className="text-error" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-3 text-[20px]" aria-hidden="true">lock</span>
                <input
                  id="password"
                  type="password"
                  required
                  aria-required="true"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-10 pr-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !configured}
              aria-busy={loading}
              aria-label={loading ? 'Signing in, please wait' : 'Sign in to CivicPulse'}
              className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-on-secondary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <><span className="w-5 h-5 rounded-full border-2 border-on-secondary border-t-transparent animate-spin" aria-hidden="true"></span> Signing in…</>
              ) : (
                <><span className="material-symbols-outlined text-[20px]" aria-hidden="true">login</span> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-secondary hover:underline font-label-lg text-label-lg">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
