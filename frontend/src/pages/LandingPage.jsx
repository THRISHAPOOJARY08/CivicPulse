import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { ConfigWarning } from '../components/UI';

export default function LandingPage() {
  const { user, isAdmin, configured } = useAuth();
  const [currentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));

  return (
    <Layout>
      {!configured && <ConfigWarning />}

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-primary overflow-hidden pt-space-xl pb-24 text-on-primary">
        {/* Atmospheric vector accents */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
            <path className="text-secondary" d="M0,100 C300,180 600,40 1200,120 L1200,600 L0,600 Z" fill="currentColor" />
            <path className="text-secondary-fixed" d="M0,250 C400,150 800,320 1200,200" fill="none" stroke="currentColor" strokeDasharray="6,6" strokeWidth="1.5" />
            <circle className="text-secondary-fixed-dim" cx="280" cy="190" fill="currentColor" r="4" />
            <circle className="text-secondary-fixed-dim" cx="820" cy="275" fill="currentColor" r="4" />
          </svg>
        </div>

        <div className="relative max-w-[1440px] mx-auto px-margin">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-space-xs bg-surface-container-highest/10 backdrop-blur-md px-space-md py-1 rounded-full mb-space-lg text-secondary-fixed">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
            <span className="font-label-sm text-label-sm tracking-wide uppercase">Official Municipal Dispatch Portal • CivicPulse AI Platform</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {/* CTA block */}
            <div className="lg:col-span-8 space-y-space-lg">
              <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-surface-bright leading-tight max-w-3xl">
                Your Voice. Your City.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-fixed via-inverse-primary to-surface-bright">Your Impact.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-inverse-primary/90 max-w-2xl leading-relaxed">
                CivicPulse connects citizens directly with municipal departments using AI-assisted triage to resolve potholes, streetlights, water leaks, and public safety issues faster.
              </p>

              <div className="pt-space-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md max-w-2xl">
                {user ? (
                  <Link
                    to="/submit"
                    className="group inline-flex items-center justify-center gap-space-sm bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg px-space-xl py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">add</span>
                    <span>Report an Issue</span>
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center gap-space-sm bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg px-space-xl py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    <span>Get Started Free</span>
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </Link>
                )}

                <Link
                  to="/map"
                  className="inline-flex items-center justify-center gap-space-sm bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-bright font-label-lg text-label-lg px-space-xl py-4 rounded-xl backdrop-blur transition-all text-center"
                >
                  <span className="material-symbols-outlined text-[20px]">map</span>
                  View Public Map
                </Link>
              </div>

              {/* Quick category pills */}
              <div className="pt-space-md space-y-space-xs">
                <div className="flex items-center gap-space-xs text-inverse-primary/70">
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">bolt</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">Report categories:</span>
                </div>
                <div className="flex flex-wrap gap-space-xs">
                  {[
                    { icon: 'construction', label: 'Roads & Potholes' },
                    { icon: 'lightbulb', label: 'Streetlights' },
                    { icon: 'water_drop', label: 'Water Supply' },
                    { icon: 'delete_sweep', label: 'Waste Management' },
                    { icon: 'flood', label: 'Drainage & Sewage' }
                  ].map(({ icon, label }) => (
                    <Link
                      key={label}
                      to={user ? `/submit?category=${encodeURIComponent(label)}` : '/register'}
                      className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-lowest/10 hover:bg-secondary/30 text-surface-bright font-label-sm text-label-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px] text-secondary-fixed">{icon}</span>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* AI status card */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="bg-primary-container/80 backdrop-blur-xl rounded-2xl p-space-lg shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-space-md">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary-container text-[20px]">smart_toy</span>
                    <span className="font-headline-sm text-headline-sm text-surface-bright text-base">Civic AI Engine</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-fixed font-label-sm text-label-sm">Active</span>
                </div>
                <p className="font-body-sm text-body-sm text-inverse-primary/80 mb-space-md">
                  Gemini AI automatically categorises complaints, extracts keywords and recommends the responsible municipal department.
                </p>
                <div className="space-y-space-sm bg-surface-container-lowest/5 p-space-md rounded-xl">
                  {[
                    { label: 'AI Categorisation', value: 'Gemini API', icon: 'psychology' },
                    { label: 'Priority Scoring', value: 'Deterministic', icon: 'speed' },
                    { label: 'Duplicate Detection', value: '300m Haversine', icon: 'join_inner' },
                    { label: 'Hotspot Analysis', value: '0.01° Grid', icon: 'location_on' }
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center justify-between text-surface-bright/80">
                      <span className="flex items-center gap-1 font-label-sm text-label-sm">
                        <span className="material-symbols-outlined text-[14px] text-secondary-fixed">{icon}</span>
                        {label}
                      </span>
                      <span className="font-label-sm text-label-sm font-bold text-secondary-container">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works: 4 lifecycle stages ──────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-margin py-space-xl w-full">
        <div className="text-center mb-space-xl">
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold">How CivicPulse Works</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs max-w-2xl mx-auto">
            Four lifecycle stages transform your report into municipal action.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[
            { step: '1', name: 'CAPTURE', icon: 'edit_note', color: 'bg-primary-container text-on-primary', desc: 'Citizen submits a complaint with description, category, and precise location.' },
            { step: '2', name: 'UNDERSTAND', icon: 'psychology', color: 'bg-secondary-container text-on-secondary-container', desc: 'Gemini AI categorises and summarises the complaint. Deterministic priority scoring assigns urgency.' },
            { step: '3', name: 'REVEAL', icon: 'map', color: 'bg-tertiary-container text-on-tertiary-container', desc: 'Complaints appear on the public map. Geographic hotspots highlight affected areas.' },
            { step: '4', name: 'ACT', icon: 'task_alt', color: 'bg-secondary-container text-on-secondary-container', desc: 'Administrators review, update status and add action notes. Citizens track progress in real time.' }
          ].map(({ step, name, icon, color, desc }) => (
            <div key={step} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-space-md`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
              </div>
              <div className="inline-flex items-center gap-space-xs mb-space-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Stage {step}</span>
                <span className="font-label-lg text-label-lg text-secondary uppercase tracking-wider">{name}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-margin pb-space-xl w-full">
        <div className="relative bg-gradient-to-r from-primary-container via-tertiary-container to-primary text-on-primary rounded-2xl p-space-xl overflow-hidden shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-xl">
            <div className="max-w-2xl space-y-space-sm">
              <h2 className="font-headline-lg text-headline-lg text-surface-bright font-bold">
                Ready to report a civic issue?
              </h2>
              <p className="font-body-md text-body-md text-inverse-primary/90 leading-relaxed">
                Create a free account to submit complaints, track their progress, and receive AI-powered analysis. No paid subscription required.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-space-md w-full lg:w-auto shrink-0">
              {user ? (
                <>
                  <Link to="/submit" className="inline-flex items-center justify-center gap-space-sm bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg px-space-xl py-3.5 rounded-xl shadow-md transition-all text-center">
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Submit a Complaint
                  </Link>
                  <Link to="/complaints" className="inline-flex items-center justify-center gap-space-sm bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-surface-bright font-label-lg text-label-lg px-space-xl py-3.5 rounded-xl backdrop-blur transition-all text-center">
                    <span className="material-symbols-outlined text-[20px]">assignment</span>
                    My Complaints
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="inline-flex items-center justify-center gap-space-sm bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg px-space-xl py-3.5 rounded-xl shadow-md transition-all text-center">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Create Free Account
                  </Link>
                  <Link to="/login" className="inline-flex items-center justify-center gap-space-sm bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-surface-bright font-label-lg text-label-lg px-space-xl py-3.5 rounded-xl backdrop-blur transition-all text-center">
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Citizen Sign-In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
