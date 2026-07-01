
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { nav, announcement } from '../data/landing';

function NavLogo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:rounded"
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="10" cy="14" r="8" fill="#4f46e5" />
        <circle cx="18" cy="14" r="8" fill="#1a2b6e" />
        <circle cx="14" cy="14" r="5" fill="#818cf8" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-navy-800">{nav.brand}</span>
    </Link>
  );
}

export function Navigation() {
  const [barVisible, setBarVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Single fixed header — announcement bar + nav stacked together */}
      <header className="fixed top-0 z-40 w-full" role="banner">

        {/* Announcement bar */}
        <AnimatePresence>
          {barVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="bg-[#F7C948]">
                <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-2.5">
                  <p className="text-center text-xs font-medium text-white sm:text-sm">
                    {announcement.text}{' '}
                    <span className="font-bold text-white">{announcement.highlight}</span>.{' '}
                    <a
                      href="#how-it-works"
                      onClick={(e) => { e.preventDefault(); handleNavClick('#how-it-works'); }}
                      className="ml-1 font-semibold text-white underline underline-offset-2 hover:no-underline"
                    >
                      {announcement.cta}
                    </a>
                  </p>
                  <button
                    onClick={() => setBarVisible(false)}
                    aria-label="Dismiss announcement"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-white hover:bg-red-700"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav bar */}
        <div
          className={`w-full transition-all duration-300 ${
            scrolled
              ? 'border-b border-gray-100 bg-white shadow-sm'
              : 'bg-white border-b border-gray-100'
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
            <NavLogo />

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
              {nav.links.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(href); }}
                  className="text-sm font-medium text-gray-500 transition-colors hover:text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:rounded"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-500 transition-colors hover:text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                {nav.ctaSecondary}
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {nav.ctaPrimary}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <NavLogo />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
                {nav.links.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(href); }}
                    className="rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy-800"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto space-y-3 border-t border-gray-100 p-4">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {nav.ctaSecondary}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  {nav.ctaPrimary}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
