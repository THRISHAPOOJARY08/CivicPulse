import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-margin py-space-xl flex flex-col items-center text-center space-y-space-lg">
        {/* Large 404 display */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant">search_off</span>
          </div>
          <span className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold shadow-sm">
            404
          </span>
        </div>

        <div className="space-y-space-sm">
          <h1 className="font-headline-lg text-headline-lg text-primary">Page Not Found</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-space-sm">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-space-sm px-space-lg py-2.5 rounded-xl border border-outline-variant text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-space-sm px-space-lg py-2.5 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg shadow-sm hover:bg-opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Home
          </Link>
        </div>

        {/* Helpful links */}
        <div className="w-full pt-space-md border-t border-outline-variant">
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">Looking for one of these?</p>
          <div className="flex flex-wrap justify-center gap-space-sm">
            <Link to="/map" className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-[16px] text-secondary">map</span>
              Public Map
            </Link>
            <Link to="/submit" className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-[16px] text-secondary">add_circle</span>
              Report an Issue
            </Link>
            <Link to="/complaints" className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-[16px] text-secondary">inbox</span>
              My Complaints
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
