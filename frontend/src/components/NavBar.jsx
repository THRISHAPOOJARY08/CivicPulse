import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Top navigation bar — matches the CivicPulse Stitch design system.
 * Dark primary (#001428) background with secondary teal accents.
 */
export default function NavBar() {
  const { user, profile, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const navLink = (to, label, icon) => {
    const active = location.pathname === to || location.pathname.startsWith(to + '/');
    return (
      <Link
        to={to}
        onClick={() => setMenuOpen(false)}
        className={`flex items-center gap-1 px-space-sm py-1.5 rounded-lg font-label-md text-label-md transition-all ${
          active
            ? 'bg-secondary/20 text-secondary-fixed'
            : 'text-inverse-primary hover:text-surface-bright hover:bg-surface-container-lowest/10'
        }`}
      >
        {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
        {label}
      </Link>
    );
  };

  return (
    <header className="w-full bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-margin flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-space-sm shrink-0">
          <span className="material-symbols-outlined text-secondary-fixed text-[28px]">account_balance</span>
          <span className="font-headline-sm text-headline-sm text-surface-bright hidden sm:block">CivicPulse</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLink('/', 'Home', 'home')}
          {navLink('/map', 'Public Map', 'map')}
          {user && navLink('/submit', 'Report Issue', 'add_circle')}
          {user && navLink('/complaints', 'My Reports', 'assignment')}
          {isAdmin && navLink('/admin', 'Admin', 'admin_panel_settings')}
        </nav>

        {/* Auth Controls */}
        <div className="hidden md:flex items-center gap-space-sm">
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-secondary-fixed border-t-transparent animate-spin"></div>
          ) : user ? (
            <div className="flex items-center gap-space-sm">
              <div className="flex flex-col text-right">
                <span className="font-label-sm text-label-sm text-surface-bright leading-none">
                  {profile?.name || user.email?.split('@')[0] || 'Citizen'}
                </span>
                {isAdmin && (
                  <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider">Admin</span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-surface-bright font-label-md text-label-md transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-space-sm">
              <Link to="/login" className="px-space-md py-1.5 rounded-lg text-surface-bright hover:bg-surface-container-lowest/15 font-label-md text-label-md transition-all">
                Sign In
              </Link>
              <Link to="/register" className="px-space-md py-1.5 rounded-lg bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-md text-label-md transition-all">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-surface-bright p-1"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-[28px]">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-container border-t border-surface-container-lowest/10 px-margin py-space-md space-y-1">
          {navLink('/', 'Home', 'home')}
          {navLink('/map', 'Public Map', 'map')}
          {user && navLink('/submit', 'Report Issue', 'add_circle')}
          {user && navLink('/complaints', 'My Reports', 'assignment')}
          {isAdmin && navLink('/admin', 'Admin', 'admin_panel_settings')}
          <div className="pt-space-sm border-t border-surface-container-lowest/10">
            {user ? (
              <button onClick={handleSignOut} className="flex items-center gap-2 text-inverse-primary font-label-md text-label-md py-2">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out ({profile?.name || user.email?.split('@')[0]})
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-surface-bright font-label-md text-label-md py-2">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-secondary-fixed font-label-md text-label-md py-2">Create Account</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
