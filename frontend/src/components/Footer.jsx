import React from 'react';

/**
 * Site-wide footer — matches Stitch design system.
 */
export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1440px] mx-auto px-margin py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-xl">
          <div className="space-y-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">account_balance</span>
              <span className="font-headline-sm text-headline-sm text-primary">CivicPulse</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Intelligent civic routing, real-time dispatch verification, and transparent municipal management powered by AI-assisted complaint analysis.
            </p>
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">emergency</span>
              Emergency Hotline: Dial 911
            </div>
          </div>

          <div className="space-y-space-sm">
            <h3 className="font-label-lg text-label-lg text-primary">Municipal Departments</h3>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>Public Works &amp; Infrastructure</li>
              <li>Sanitation &amp; Environmental Services</li>
              <li>Water Supply Department</li>
              <li>Electrical Department</li>
            </ul>
          </div>

          <div className="space-y-space-sm">
            <h3 className="font-label-lg text-label-lg text-primary">Civic Platform</h3>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>Submit a Complaint</li>
              <li>Track Complaint Status</li>
              <li>Public Map &amp; Insights</li>
              <li>AI Analysis System</li>
            </ul>
          </div>

          <div className="space-y-space-sm">
            <h3 className="font-label-lg text-label-lg text-primary">Resident Resources</h3>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>Complaint Categories</li>
              <li>Priority Scoring Guide</li>
              <li>Privacy Policy</li>
              <li>Terms of Civic Participation</li>
            </ul>
          </div>
        </div>

        <div className="pt-space-lg border-t border-surface-container-high flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            &copy; {new Date().getFullYear()} CivicPulse. Hackathon demonstration platform. Not a production municipal service.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-secondary">smart_toy</span>
            AI-powered by Gemini · Hosted on Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
