import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

/**
 * Standard page layout with NavBar, scrollable content, and Footer.
 */
export default function Layout({ children, noFooter = false, noPad = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <NavBar />
      <main className={`flex-1 ${noPad ? 'flex flex-col' : ''}`}>
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}
