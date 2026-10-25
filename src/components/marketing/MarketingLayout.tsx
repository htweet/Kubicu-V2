import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, FlagIcon, MenuIcon, XIcon } from 'lucide-react';
import { KubicuLogo } from '../shell/KubicuLogo';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { PlatformLook } from './PlatformLook';
import { cn } from '../../utils/cn';

const nav = [
{ to: '/', label: 'Product', end: true },
{ to: '/templates', label: 'Templates' },
{ to: '/pricing', label: 'Pricing' },
{ to: '/about/help', label: 'Resources' }];


const footer = [
{
  title: 'Product',
  links: [
  { to: '/templates', label: 'Templates' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/ai', label: 'KUBICU AI' },
  { to: '/about/roadmap', label: 'Roadmap' },
  { to: '/signup', label: 'Create a page' }]

},
{
  title: 'Use cases',
  links: [
  { to: '/templates?goal=sell', label: 'Sell products' },
  { to: '/templates?goal=book', label: 'Take bookings' },
  { to: '/templates?goal=events', label: 'Sell event tickets' },
  { to: '/templates?goal=showcase', label: 'Show your work' }]

},
{
  title: 'Company',
  links: [
  { to: '/about/about', label: 'About' },
  { to: '/about/help', label: 'Help centre' },
  { to: '/about/contact', label: 'Contact' },
  { to: '/about/trust', label: 'Trust centre' },
  { to: '/developers', label: 'Developers' }]

},
{
  title: 'Legal',
  links: [
  { to: '/about/terms', label: 'Terms' },
  { to: '/about/privacy', label: 'Privacy' },
  { to: '/about/cookies', label: 'Cookies' },
  { to: '/about/acceptable-use', label: 'Acceptable use' },
  { to: '/about/refunds', label: 'Refunds' },
  { to: '/about/seller-terms', label: 'Seller terms' }]

}];


export function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <PlatformLook night>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className={cn('sticky top-0 z-30 border-b print:hidden backdrop-blur-md transition-colors duration-200', scrolled ? 'border-line bg-canvas/80' : 'border-transparent bg-canvas/40')}>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 md:px-8">
          <Link to="/" aria-label="KUBICU home" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            <KubicuLogo />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {nav.map((n) =>
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
              cn(
                'relative rounded-md px-3 py-2 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'
              )
              }>
              
                {({ isActive }) =>
              <>
                    {n.label}
                    {isActive && <span aria-hidden className="nm-fill absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full" />}
                  </>
              }
              </NavLink>
            )}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="tertiary" onClick={() => navigate('/signin')}>
              Sign in
            </Button>
            <Button variant="brand" onClick={() => navigate('/signup')}>
              Start free
            </Button>
          </div>
          <IconButton label={menuOpen ? 'Close menu' : 'Open menu'} icon={menuOpen ? XIcon : MenuIcon} className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} />
        </div>
        <AnimatePresence>
          {menuOpen &&
          <motion.nav
            aria-label="Main"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="border-t border-line bg-canvas px-5 pb-6 pt-2 md:hidden">
            
              <ul className="flex flex-col">
                {nav.map((n) =>
              <li key={n.to}>
                    <Link to={n.to} className="flex h-12 items-center border-b border-line text-body font-medium text-fg">
                      {n.label}
                    </Link>
                  </li>
              )}
              </ul>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="lg" onClick={() => navigate('/signin')}>
                  Sign in
                </Button>
                <Button variant="brand" size="lg" onClick={() => navigate('/signup')}>
                  Start free
                </Button>
              </div>
            </motion.nav>
          }
        </AnimatePresence>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="relative mt-8 print:hidden">
        <div aria-hidden className="nm-rule" />
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <KubicuLogo />
            <p className="mt-4 text-label text-fg-muted">Your corner of the internet. Your whole business.</p>
            <Link to="/signup" className="mt-5 inline-flex items-center gap-1.5 text-label font-semibold text-fg hover:underline">
              <span className="nm-text">Create your page — free</span>
              <ArrowRightIcon size={15} aria-hidden className="text-[rgb(var(--nm-3))]" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            {footer.map((col) =>
            <div key={col.title}>
                <h2 className="text-caption font-semibold text-fg">{col.title}</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((l) =>
                <li key={l.to}>
                      <Link to={l.to} className="text-label text-fg-muted transition-colors duration-150 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        {l.label}
                      </Link>
                    </li>
                )}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-5 text-caption text-fg-subtle md:flex-row md:items-center md:justify-between md:px-8">
            <p>© 2026 KUBICU · kub.icu · Made in Lagos · English (Nigeria)</p>
            <p className="max-w-xl md:text-right">
              Design prototype: example businesses are fictional, payments run in test mode and no accounts are stored.{' '}
              <Link to="/about/report" className="inline-flex items-center gap-1 font-medium text-fg-muted hover:text-fg">
                <FlagIcon size={12} aria-hidden /> Report a page
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </PlatformLook>);

}