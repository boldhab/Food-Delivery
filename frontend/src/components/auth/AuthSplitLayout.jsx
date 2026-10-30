import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import ThemeSwitcher from '@/components/ThemeSwitcher';

/**
 * Modern Split-Screen Authentication Layout
 * Left Column: Prominent company logo in large format, company name, portal branding, and trust guarantee.
 * Right Column: Clean sign-in / sign-up authentication form without disjointed card borders.
 */
const AuthSplitLayout = ({
  portalType = 'client', // 'client' | 'admin' | 'driver'
  badge = 'AUTHENTICATION',
  title = 'Sign in to your account',
  subtitle = 'Welcome back! Enter your credentials to access your account.',
  backTo = '/',
  backLabel = 'Back to Storefront',
  heroTitle,
  heroSubtitle,
  children,
  footer
}) => {
  // Portal branding definitions
  const portalDefaults = {
    client: {
      brandLogo: '/LOGO.png',
      brandName: 'Food Hub',
      portalLabel: null,
      brandTagline: 'Delicious Food, Delivered Fast'
    },
    admin: {
      brandLogo: '/LOGO.png',
      brandName: 'Food Hub',
      portalLabel: 'Admin Control Center',
      brandTagline: 'Platform Operations & Fleet Telemetry'
    },
    driver: {
      brandLogo: '/LOGO.png',
      brandName: 'Food Hub',
      portalLabel: 'Courier Fleet',
      brandTagline: 'Driver & Delivery Network'
    }
  };

  const currentPortal = portalDefaults[portalType] || portalDefaults.client;
  const displayTagline = heroSubtitle || currentPortal.brandTagline;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--background)] text-[var(--foreground)] relative overflow-x-hidden transition-colors duration-200">
      {/* 1. Soft Ambient Lighting Glows */}
      <div
        className="absolute -top-36 -left-36 w-96 h-96 bg-gradient-to-br from-[var(--primary)]/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-36 -right-36 w-96 h-96 bg-gradient-to-tl from-[var(--secondary)]/15 via-[var(--primary)]/10 to-transparent rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. LEFT COLUMN: Large Company Logo & Brand Identity (Hero Showcase on Desktop) */}
      <aside className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14 relative z-10 bg-gradient-to-br from-[var(--card)]/90 via-[var(--surface)]/70 to-[var(--muted)]/50 border-r border-[var(--border)]/70 backdrop-blur-md overflow-hidden select-none">
        {/* Ambient background glow behind the logo */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[var(--primary)]/20 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top: Portal Badge & Back Navigation */}
        <div className="flex items-center justify-between w-full relative z-10">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors group"
          >
            <span className="w-8 h-8 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--primary)]/60 group-hover:text-[var(--primary)] transition-all shadow-xs">
              <FiArrowLeft className="w-4 h-4" />
            </span>
            <span>{backLabel}</span>
          </Link>

          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-xs">
              <FiShield className="w-3.5 h-3.5" />
              {badge}
            </span>
          )}
        </div>

        {/* Center: Large Brand Logo & Company Name */}
        <div className="my-auto py-12 flex flex-col items-center text-center relative z-10 max-w-md mx-auto">
          {/* Large Borderless Free-Standing Brand Logo */}
          <div className="relative group mb-8 flex items-center justify-center">
            <div
              className="absolute -inset-8 bg-gradient-to-tr from-[var(--primary)]/25 via-orange-500/20 to-transparent rounded-full blur-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              aria-hidden="true"
            />
            <img
              src={currentPortal.brandLogo}
              alt={currentPortal.brandName}
              className="relative w-64 sm:w-72 xl:w-80 max-w-full h-auto object-contain filter drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 select-none"
            />
          </div>

          {/* Company Name in Large Typography */}
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-[var(--foreground)] leading-tight mb-2">
            {currentPortal.brandName}
          </h1>

          {/* Sub-portal badge (e.g. Admin or Courier Fleet) */}
          {currentPortal.portalLabel && (
            <div className="mb-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                {currentPortal.portalLabel}
              </span>
            </div>
          )}

          {/* Tagline / Subtitle */}
          <p className="text-base xl:text-lg text-[var(--muted-foreground)] font-medium max-w-sm mx-auto leading-relaxed">
            {displayTagline}
          </p>
        </div>

        {/* Bottom: Minimalist Trust Indicator */}
        <div className="pt-6 border-t border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--muted-foreground)] relative z-10">
          <span className="flex items-center gap-2 font-medium">
            <FiShield className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>256-bit SSL Encrypted • Fast & Reliable</span>
          </span>
          <span className="font-medium">© {new Date().getFullYear()} Food Hub</span>
        </div>
      </aside>

      {/* 3. RIGHT COLUMN: Sign In / Sign Up Form Area */}
      <main className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10 min-h-screen lg:min-h-0 flex-grow">
        {/* Top Header Bar: Back link & Theme switcher */}
        <header className="w-full flex items-center justify-between mb-8 sm:mb-10">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--card)]/80 hover:bg-[var(--card)] border border-[var(--border)] shadow-xs transition-all duration-200"
            aria-label={backLabel}
          >
            <FiArrowLeft className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{backLabel}</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeSwitcher
              variant="dropdown"
              align="end"
              buttonClassName="bg-[var(--card)]/80 hover:bg-[var(--card)] border border-[var(--border)] shadow-xs"
            />
          </div>
        </header>

        {/* Center: Auth Form Container */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          {/* Mobile Brand Header (< lg only) */}
          <div className="lg:hidden flex flex-col items-center text-center gap-2 pb-4 border-b border-[var(--border)]/60">
            <img
              src={currentPortal.brandLogo}
              alt={currentPortal.brandName}
              className="w-24 sm:w-28 h-auto object-contain filter drop-shadow-md select-none"
            />
            <div>
              <span className="font-black text-2xl tracking-tight text-[var(--foreground)]">
                {currentPortal.brandName}
              </span>
              {currentPortal.portalLabel && (
                <span className="block text-2xs font-semibold uppercase tracking-wider text-[var(--primary)] mt-0.5">
                  {currentPortal.portalLabel}
                </span>
              )}
              <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">
                {currentPortal.brandTagline}
              </p>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content Slot */}
          <div className="pt-1">
            {children}
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="w-full mt-8 pt-4 text-center text-xs text-[var(--muted-foreground)]">
          {footer ? (
            footer
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
              <span>Food Hub Platform</span>
              <span className="hidden sm:inline">•</span>
              <span>Privacy Policy & Terms of Service</span>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
};

AuthSplitLayout.propTypes = {
  portalType: PropTypes.oneOf(['client', 'admin', 'driver']),
  badge: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  backTo: PropTypes.string,
  backLabel: PropTypes.string,
  heroTitle: PropTypes.string,
  heroSubtitle: PropTypes.string,
  heroHighlights: PropTypes.arrayOf(PropTypes.string),
  heroMetrics: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  ),
  children: PropTypes.node.isRequired,
  footer: PropTypes.node
};

export default AuthSplitLayout;
