import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuIcon, XIcon } from 'lucide-react';
import { KubicuLogo } from '../shell/KubicuLogo';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { PlatformLook } from './PlatformLook';
import { cn } from '../../utils/cn';

const nav = [
{ to: '/templates', label: 'Templates' },
{ to: '/pricing', label: 'Pricing' },
{ to: '/about/help', label: 'Help' }];


const footer = [
{ title: 'Product', links: [{ to: '/templates', label: 'Templates' }, { to: '/pricing', label: 'Pricing' }, { to: '/start', label: 'Create a page' }] },
{ title: 'Support', links: [{ to: '/about/help', label: 'Help centre' }, { to: '/about/contact', label: 'Contact' }] },
{
  title: 'Legal',
  links: [
  { to: '/about/terms', label: 'Terms' },
  { to: '/about/privacy', label: 'Privacy' },
  { to: '/about/cookies', label: 'Cookies' },
  { to: '/about/acceptable-use', label: 'Acceptable use' }]

}];


export function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <PlatformLook>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 md:px-8">
          <Link to="/" aria-label="KUBICU home" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            <KubicuLogo />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {nav.map((n) =>
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'
              )
              }>
              
                {n.label}
              </NavLink>
            )}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="tertiary" onClick={() => navigate('/signin')}>
              Sign in
            </Button>
            <Button onClick={() => navigate('/signup')}>Create your page</Button>
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
                <Button size="lg" onClick={() => navigate('/signup')}>
                  Create your page
                </Button>
              </div>
            </motion.nav>
          }
        </AnimatePresence>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-8">
          <div className="max-w-xs">
            <KubicuLogo />
            <p className="mt-4 text-label text-fg-muted">Your corner of the internet. Your whole business.</p>
            <p className="mt-4 text-caption text-fg-subtle">
              This is a design prototype. Example businesses are fictional, and nothing here processes payments or stores accounts.
            </p>
          </div>
          {footer.map((col) =>
          <div key={col.title}>
              <h2 className="text-caption font-semibold text-fg">{col.title}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) =>
              <li key={l.to}>
                    <Link to={l.to} className="text-label text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      {l.label}
                    </Link>
                  </li>
              )}
              </ul>
            </div>
          )}
        </div>
        <div className="mx-auto w-full max-w-6xl border-t border-line px-5 py-5 text-caption text-fg-subtle md:px-8">© 2026 KUBICU · kub.icu</div>
      </footer>
    </PlatformLook>);

}