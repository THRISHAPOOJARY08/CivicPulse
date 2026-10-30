import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

/**
 * Standard page layout with NavBar, scrollable content, and Footer.
 */
export default function Layout({ children, noFooter = false, noPad = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-secondary focus:text-on-secondary focus:rounded-lg focus:font-label-lg focus:text-label-lg"
      >
        Skip to main content
      </a>
      <NavBar />
      <main id="main-content" className={`flex-1 ${noPad ? 'flex flex-col' : ''}`} role="main">
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}
