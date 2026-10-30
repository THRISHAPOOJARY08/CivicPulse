import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertBanner } from '../components/UI';

export default function RegisterPage() {
  const { signUp, user, configured } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { data, error: err } = await signUp(email, password, fullName.trim());
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    // Supabase may require email confirmation depending on project settings
    const needsConfirmation = !data?.session;
    if (needsConfirmation) {
      navigate('/login', {
        state: { message: 'Account created! Please check your email to confirm your address, then sign in.' }
      });
    } else {
      navigate('/complaints');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
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
          <div className="text-center space-y-space-xs">
            <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-on-secondary-container text-[32px]">person_add</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Create Citizen Account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Free registration. No billing required.</p>
          </div>

          {!configured && (
            <AlertBanner type="warning" message="Supabase is not yet configured. Registration will not work until frontend/.env is set up." />
          )}
          {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl space-y-space-md">
            {/* Full Name */}
            <div className="space-y-space-xs">
              <label htmlFor="fullName" className="font-label-lg text-label-lg text-primary block">
                Full Name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-3 text-[20px]">person</span>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-10 pr-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-space-xs">
              <label htmlFor="email" className="font-label-lg text-label-lg text-primary block">
                Email Address <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-3 text-[20px]">mail</span>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-10 pr-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-space-xs">
              <label htmlFor="password" className="font-label-lg text-label-lg text-primary block">
                Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-3 text-[20px]">lock</span>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-10 pr-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-space-xs">
              <label htmlFor="confirm" className="font-label-lg text-label-lg text-primary block">
                Confirm Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-3 text-[20px]">lock_reset</span>
                <input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-10 pr-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !configured}
              className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-on-secondary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <><span className="w-5 h-5 rounded-full border-2 border-on-secondary border-t-transparent animate-spin"></span> Creating account…</>
              ) : (
                <><span className="material-symbols-outlined text-[20px]">person_add</span> Create Account</>
              )}
            </button>

            <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
              By registering, you agree to use this platform for legitimate civic reporting only.
              No payment required.
            </p>
          </form>

          <p className="text-center font-body-md text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary hover:underline font-label-lg text-label-lg">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
