import { useState } from 'react';
/* eslint-disable */
import { Link, useLocation } from 'react-router-dom';

/**
 * Header Component — Newspaper-style masthead
 * Logo: newspaper icon + "The Fair Digest" (serif italic "The")
 * Subtitle: "AN ETHICAL NEWS SUMMARIZER · VOL. I"
 * Nav links: BIAS-AWARE | MULTI-PERSPECTIVE | SOURCE-CREDIBLE
 */
export default function Header({ user, onLogout }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-cream border-b-2 border-ink">
      {/* Top thin rule */}
      <div className="w-full h-[2px] bg-ink"></div>
      
      {/* Upper navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-ink-muted font-sans font-medium">
          <span>EST. 2026</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">ETHICAL JOURNALISM</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-muted font-mono">
                ● {user.username}
              </span>
              <button 
                onClick={onLogout}
                className="text-[10px] sm:text-xs tracking-wider uppercase text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="text-[10px] sm:text-xs tracking-wider uppercase text-ink-muted hover:text-ink transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Thick rule */}
      <div className="newspaper-rule-double mx-4 sm:mx-6"></div>

      {/* Main masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center">
        {/* Logo */}
        <Link to="/" className="inline-block group">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {/* Newspaper icon */}
            <svg className="w-7 h-7 sm:w-9 sm:h-9 text-ink group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-ink">
              <span className="italic font-bold">The</span>{' '}
              <span className="font-black">Fair Digest</span>
            </h1>
          </div>
        </Link>

        {/* Subtitle */}
        <p className="mt-2 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-ink-muted font-sans font-medium">
          An Ethical News Summarizer · Vol. I
        </p>
      </div>

      {/* Navigation rule */}
      <div className="newspaper-rule mx-4 sm:mx-6"></div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        {/* Desktop nav */}
        <div className="hidden sm:flex items-center justify-center gap-1">
          <NavPill icon="◎" label="BIAS-AWARE" />
          <span className="text-border mx-2">|</span>
          <NavPill icon="◈" label="MULTI-PERSPECTIVE" />
          <span className="text-border mx-2">|</span>
          <NavPill icon="◉" label="SOURCE-CREDIBLE" />
        </div>

        {/* Mobile nav toggle */}
        <div className="sm:hidden flex items-center justify-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-xs tracking-[0.15em] uppercase text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 flex flex-col items-center gap-2 animate-fade-in">
            <NavPill icon="◎" label="BIAS-AWARE" />
            <NavPill icon="◈" label="MULTI-PERSPECTIVE" />
            <NavPill icon="◉" label="SOURCE-CREDIBLE" />
          </div>
        )}
      </nav>

      {/* Bottom rule */}
      <div className="w-full h-[1px] bg-border"></div>
    </header>
  );
}

function NavPill({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] sm:text-xs tracking-[0.15em] uppercase text-ink-muted font-sans font-medium hover:text-ink hover:bg-cream-dark rounded-full transition-all cursor-default">
      <span className="text-gold">{icon}</span>
      {label}
    </span>
  );
}
