import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, FlagIcon, MenuIcon, XIcon } from 'lucide-react';
import { KubicuLogo } from '../shell/KubicuLogo';
import { PlatformLook } from './PlatformLook';
import { AnnouncementBar } from './AnnouncementBar';
import { MegaMenu } from './MegaMenu';
import { MobileSiteMenu } from './MobileSiteMenu';
import { LanguagePicker } from '../ui/LanguagePicker';
import { useDocumentLang, useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';
import { setDisplayConversion } from '../../utils/currency';
import { currencyForLang } from '../../utils/previewMoney';

const footer = [
{
  title: 'Product',
  links: [
  { to: '/features', label: 'All features' },
  { to: '/templates', label: 'Templates' },
  { to: '/themes', label: 'Themes' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/ai', label: 'KUBICU AI' },
  { to: '/copilot', label: 'Copilot' }]

},
{
  title: 'Tools',
  links: [
  { to: '/tools/short-links', label: 'Short links & QR' },
  { to: '/features/audience-manager', label: 'Audience Manager' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/about/roadmap', label: 'Roadmap' }]

},
{
  title: 'Solutions',
  links: [
  { to: '/for/creators', label: 'Creators' },
  { to: '/for/shops', label: 'Shops & sellers' },
  { to: '/for/services', label: 'Service businesses' },
  { to: '/for/events', label: 'Events & communities' }]

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


const pill = 'inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full px-5 text-[15px] font-bold transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2';

/** Website frame (D260): floating pill nav over colour bands, plum footer with a white link card. Translated in D318. */
export function MarketingLayout() {
  const { t: tr, lang } = useT();
  // Every naira amount on the website shows in the language's country currency (D421). Set before children render.
  setDisplayConversion(currencyForLang(lang));
  useEffect(() => () => setDisplayConversion(null), []);
  useDocumentLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    // Menu links like /features#bookings land on their section; everything else starts at the top.
    if (location.hash) {
      window.requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' }));
    } else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <PlatformLook night>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2">
        {tr('Skip to content')}
      </a>
      <AnnouncementBar />
      <header className="sticky top-0 z-30 h-[88px] px-3 pt-3 print:hidden md:px-5">
        <div className={cn('relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 rounded-full bg-white pl-5 pr-2 text-[rgb(20_20_18)] transition-shadow duration-200 md:pl-7', scrolled ? 'shadow-3' : 'shadow-1')}>
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" aria-label={tr('KUBICU home')} className="flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <KubicuLogo accent="#6B8CFF" />
            </Link>
            <MegaMenu />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden lg:inline-flex">
              <LanguagePicker variant="site" />
            </span>
            <Link to="/signin" className={cn(pill, 'hidden bg-[rgb(238_233_221)] text-[rgb(20_20_18)] hover:bg-[rgb(224_217_202)] sm:inline-flex')}>
              {tr('Log in')}
            </Link>
            <Link to="/signup" className={cn(pill, 'bg-[rgb(20_20_18)] text-white hover:bg-[rgb(48_48_44)]')}>
              {tr('Sign up free')}
            </Link>
            <button
              type="button"
              aria-label={tr(menuOpen ? 'Close menu' : 'Open menu')}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(238_233_221)] text-[rgb(20_20_18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden">
              
              {menuOpen ? <XIcon size={20} aria-hidden /> : <MenuIcon size={20} aria-hidden />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen &&
          <motion.nav
            id="site-menu"
            aria-label={tr('Main')}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mx-auto mt-2 max-h-[calc(100dvh-112px)] max-w-7xl origin-top overflow-y-auto overscroll-contain rounded-[28px] bg-white p-3 text-[rgb(20_20_18)] shadow-3 lg:hidden">
            
              <MobileSiteMenu />
              <Link to="/copilot" className={cn(pill, 'mt-2 w-full gap-2 bg-[rgb(var(--kb-lime))] text-[rgb(var(--kb-forest))]')}>
                {tr('Start with Copilot')} <ArrowRightIcon size={16} aria-hidden />
              </Link>
              <Link to="/signin" className={cn(pill, 'mt-2 w-full bg-[rgb(238_233_221)] text-[rgb(20_20_18)] sm:hidden')}>
                {tr('Log in')}
              </Link>
              <div className="mt-2">
                <LanguagePicker variant="site" stretch side="top" align="start" />
              </div>
            </motion.nav>
          }
        </AnimatePresence>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="bg-[rgb(var(--kb-plum))] px-3 pb-8 pt-3 text-white print:hidden md:px-5">
        <div className="mx-auto w-full max-w-7xl rounded-[36px] bg-white px-6 py-12 text-[rgb(20_20_18)] md:px-12 md:py-14">
          {/* One footer heading groups the link columns below the page's own sections (D430). */}
          <h2 className="sr-only">{tr('Site links')}</h2>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_repeat(5,1fr)]">
            <div className="max-w-xs">
              <KubicuLogo />
              <p className="mt-4 text-[15px] font-medium text-[rgb(70_68_62)]">{tr('Your corner of the internet. Your whole business.')}</p>
              <Link to="/signup" className={cn(pill, 'mt-6 gap-2 bg-[rgb(var(--kb-lime))] text-[rgb(var(--kb-forest))] hover:scale-[1.03]')}>
                {tr('Create your page — free')} <ArrowRightIcon size={16} aria-hidden />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-5">
              {footer.map((col) =>
              <div key={col.title}>
                  <h3 className="text-[15px] font-extrabold">{tr(col.title)}</h3>
                  <ul className="mt-4 flex flex-col gap-3">
                    {col.links.map((l) =>
                  <li key={l.to}>
                        <Link to={l.to} className="rounded-sm text-[15px] font-medium text-[rgb(70_68_62)] transition-colors duration-150 hover:text-[rgb(20_20_18)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                          {tr(l.label)}
                        </Link>
                      </li>
                  )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <p aria-hidden className="kb-display mx-auto mt-6 max-w-7xl select-none text-center text-[22vw] leading-[0.8] text-[rgb(var(--kb-pink))] lg:text-[240px]">
          KUBICU
        </p>
        <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-3 px-2 text-[13px] text-white/80 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Saintstartup Technologies Ltd (RC 7298088) · KUBICU · kub.icu</p>
          <p className="max-w-xl md:text-right">
            {tr('Design prototype: example businesses are fictional, payments run in test mode and no accounts are stored.')}{' '}
            <Link to="/about/report" className="inline-flex items-center gap-1 font-semibold text-white hover:underline">
              <FlagIcon size={12} aria-hidden /> {tr('Report a page')}
            </Link>
          </p>
        </div>
      </footer>
    </PlatformLook>);

}