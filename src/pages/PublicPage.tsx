import React, { useEffect, useMemo, useState } from 'react';
import { PageOpsProvider, usePageOpsContext, type PageOpsActions } from '../contexts/PageOpsContext';
import { BookingSheet } from '../components/booking/BookingSheet';
import { SubscribeSheet } from '../components/subscriptions/SubscribeSheet';
import { SubscribeProvider } from '../contexts/SubscribeContext';
import { usePageOps } from '../hooks/usePageOps';
import { upsertContact } from '../utils/ops/ops';
import { contactFrom, recordSubmission } from '../utils/forms/submit';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { SiteNav } from '../components/blocks/SiteNav';
import { CoBrandStrip } from '../components/blocks/CoBrandStrip';
import { findPage, navItems, pageHref, pageView, resolvePath, type NavItem } from '../utils/sitePages';
import { STOREFRONT_PATH, findShopProduct, productSlug, storefrontAvailable, storefrontOrdering } from '../utils/commerce/storefront';
import { readDomains } from '../utils/domains/storage';
import { spaceHandle } from '../utils/domains/links';
import { ExternalRedirect } from '../components/domains/ExternalRedirect';
import { StorefrontView } from '../components/storefront/StorefrontView';
import { ProductDetailView } from '../components/storefront/ProductDetailView';
import { sellerPhone } from '../hooks/useResolvedPage';

import { DealRoomPanel } from '../components/dealroom/DealRoomPanel';
import { dealRoomCheckout } from '../utils/dealRoom';

const SHOP_NAV_ID = '__shop';
import { ArrowLeftIcon, EyeIcon, InfoIcon } from 'lucide-react';
import { RenderPlanProvider } from '../contexts/RenderPlanContext';
import { DataSaverProvider } from '../contexts/DataSaverContext';
import { DataSaverBar } from '../components/blocks/DataSaverBar';
import { CatalogProvider } from '../contexts/CatalogContext';
import { CartProvider } from '../contexts/CartContext';
import { PageSurface } from '../components/blocks/PageSurface';
import { BlockRenderer, spacingClass } from '../components/blocks/BlockRenderer';
import { PublicFooter } from '../components/blocks/PublicFooter';
import { SkipLink } from '../components/ui/SkipLink';
import { flagOn, useAdminStore } from '../utils/admin/store';
import { CheckoutSheet } from '../components/checkout/CheckoutSheet';
import { CartButton } from '../components/checkout/CartButton';
import { ConsentStrip } from '../components/blocks/ConsentStrip';
import { Button } from '../components/ui/Button';
import { showsKubicuBadge } from '../utils/branding';
import { isLiveNow } from '../utils/schedule';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { usePageCommerce } from '../hooks/usePageCommerce';
import type { CampaignPhase, PageDocument } from '../types/page';
import { blockInPhase, campaignPhase, phaseLabels, phaseOrder } from '../utils/campaign';
import { cn } from '../utils/cn';
import type { PlanInfo } from '../data/plans';
import { TrackProvider, createTracker, useTrack } from '../contexts/TrackContext';
import { visitSource } from '../utils/analytics/track';
import { intentSources, showsForSource } from '../utils/intentflow';
import type { SourceId } from '../types/analytics';
import { blockName } from '../utils/blocks';
import type { Block } from '../types/page';
import { MembersProvider, useMembers, type MembersValue } from '../contexts/MembersContext';
import { MemberSignInSheet } from '../components/members/MemberSignInSheet';
import { MembersLocked, MembersOpenBar } from '../components/members/MembersGate';
import { checkAccess, coveredCount, maskContact, memberAreas, readSession, writeSession, type MemberSession } from '../utils/members';
import { announce } from '../utils/announce';
import { sitePages } from '../utils/sitePages';

export function PublicPage({ view = 'page' }: {view?: 'page' | 'shop';}) {
  const { handle = '', pagePath: rawPath, productId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isDraft = params.get('draft') === '1';
  const resolved = useResolvedPage(handle, isDraft);
  const commerce = usePageCommerce(resolved?.workspaceId ?? null, !!resolved?.isOwn);
  const ops = usePageOps(resolved?.workspaceId ?? null, !!resolved?.isOwn);
  const [bookingService, setBookingService] = useState<string | null>(null);
  const [subPlanId, setSubPlanId] = useState<string | null>(null);
  // Members-only content (D110): the member's session on this device, and the sign-in sheet.
  const memberWid = resolved && !resolved.example ? resolved.workspaceId ?? null : null;
  const [memberSession, setMemberSession] = useState<MemberSession | null>(() => memberWid ? readSession(memberWid) : null);
  const [signInOpen, setSignInOpen] = useState(false);
  useEffect(() => {
    setMemberSession(memberWid ? readSession(memberWid) : null);
  }, [memberWid]);

  // Visitor analytics (D61): where this visit came from, and a tracker for this page.
  const visit = useMemo(() => visitSource(params), [params]);
  const trackPageId = view === 'shop' ? 'shop' : resolved && rawPath ? (resolvePath(resolved.doc, rawPath) as {pageId?: string | null;} | null)?.pageId ?? null : null;
  const track = useMemo(
    () => createTracker({ workspaceId: resolved?.example ? null : resolved?.workspaceId ?? null, handle, pageId: trackPageId, source: visit, disabled: isDraft, isOwner: !!resolved?.isOwn }),
    [resolved?.example, resolved?.workspaceId, resolved?.isOwn, handle, trackPageId, visit, isDraft]
  );
  const viewKey = resolved ? `${handle}/${view}/${rawPath ?? ''}/${productId ?? ''}` : null;
  useEffect(() => {
    if (!viewKey) return;
    track('view');
    if (view === 'shop' && productId) track('product_view', { label: productId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);

  const opsActions = useMemo<PageOpsActions | null>(() => {
    if (!resolved || resolved.example) return null;
    return {
      submitLead: (v, formTitle, consent) => {
        track('lead', { label: formTitle });
        return ops.apply((d) => upsertContact(d, { name: v.name, email: v.email, phone: v.phone }, 'form', `Sent “${formTitle}”${v.message ? `: ${v.message.slice(0, 140)}` : ''}`, { consent: consent ? 'subscribed' : 'transactional' }));
      },
      subscribe: (v, title) => {
        track('signup', { label: title });
        return ops.apply((d) => upsertContact(d, { name: '', email: v.email, phone: '' }, 'newsletter', `Subscribed via “${title}”`, { consent: 'subscribed' }));
      },
      openBooking: (id) => {
        track('booking_open', { label: id });
        setBookingService(id);
      },
      // Forms add-on (D79): save the submission, add/update the contact (consent only if they ticked it), record it.
      submitForm: (form, answers, paymentNgn) => {
        const wid = resolved.workspaceId;
        if (!wid) return false;
        const sub = recordSubmission(wid, form, answers, paymentNgn, { source: visit.source, campaign: visit.campaign ?? null, handle });
        track('form_submit', { label: form.id, valueNgn: paymentNgn ?? undefined });
        const c = contactFrom(form, sub.answers);
        if (c.email || c.phone) {
          ops.apply((d) => upsertContact(d, { name: c.name, email: c.email, phone: c.phone }, 'form', `Sent “${form.name}”${paymentNgn ? ` and paid ₦${paymentNgn.toLocaleString()} (test)` : ''}`, { consent: c.consent ? 'subscribed' : 'transactional' }));
        }
        return true;
      },
      trackForm: (formId, stage) => track(stage === 'view' ? 'form_view' : 'form_start', { label: formId })
    };
  }, [resolved, ops, track, visit, handle]);

  // The storefront answers /shop unless it's off or a page of the site already uses that address (D53).
  const shopData = resolved && !resolved.example ? commerce.data : null;
  // Super admin can switch the storefront off platform-wide (D75b).
  const [adminStore] = useAdminStore();
  const shopOn = !!resolved && flagOn(adminStore, 'storefront') && storefrontAvailable(resolved.doc, shopData);
  const wantShop = view === 'shop' && shopOn;
  const pagePath = view === 'shop' && !shopOn ? productId ? '\u0000missing' : STOREFRONT_PATH : rawPath;
  const shopProduct = wantShop && productId ? findShopProduct(shopData, productId) : undefined;
  // Custom domains (D62): a live domain turns on readable product addresses; your own redirects apply to unknown paths.
  const domainsData = resolved?.workspaceId ? readDomains(resolved.workspaceId) : null;
  const readableProducts = !!domainsData?.domains.some((d) => d.status === 'live');
  const customRedirect =
  resolved?.workspaceId && view === 'page' && rawPath ?
  domainsData?.redirects.find((r) => r.from === rawPath && spaceHandle(resolved.workspaceId as string, r.spaceId) === handle) :
  undefined;
  const route = resolved ? wantShop ? { pageId: null } : resolvePath(resolved.doc, pagePath) : null;
  const pageId = route && 'pageId' in route ? route.pageId : null;
  const sub = resolved ? findPage(resolved.doc, pageId) : undefined;

  useEffect(() => {
    const previous = document.title;
    const view = resolved ? pageView(resolved.doc, pageId) : null;
    const shopSeoTitle = shopData?.storefront.seoTitle?.trim();
    const shopTitle = wantShop && resolved ? shopProduct ? `${shopProduct.name} · ${resolved.doc.title}` : shopSeoTitle || `${shopData?.storefront.title || 'Shop'} · ${resolved.doc.title}` : null;
    document.title = shopTitle ?? (resolved && view ? view.seo.title || (sub ? `${sub.title} · ${resolved.doc.title}` : resolved.doc.title) : 'Page not available · KUBICU');
    // Page language for screen readers and translation (WCAG 3.1.1, D76).
    const previousLang = document.documentElement.lang;
    document.documentElement.lang = resolved?.doc.language || 'en';
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content') ?? null;
    if (meta && view) meta.setAttribute('content', wantShop ? shopProduct?.description.slice(0, 160) ?? (shopData?.storefront.seoDescription?.trim() || shopData?.storefront.intro || '') : view.seo.description);
    return () => {
      document.title = previous;
      document.documentElement.lang = previousLang || 'en';
      if (meta && previousDescription !== null) meta.setAttribute('content', previousDescription);
    };
  }, [resolved, pageId, sub, wantShop, shopProduct, shopData]);

  if (!resolved) return <Unavailable handle={handle} />;
  // Staff actions (D75b): a taken-down page or a suspended workspace isn't shown — the owner's own draft preview still is.
  if (!resolved.example && !isDraft) {
    if (adminStore.takedowns.some((t) => t.handle === handle))
    return <Unavailable handle={handle} title="This page was removed" body="It was taken down for breaking KUBICU’s rules. If you own it, check your app for how to appeal." />;
    if (resolved.workspaceId && adminStore.suspended[resolved.workspaceId])
    return <Unavailable handle={handle} title="This page is temporarily unavailable" body="The account behind it is paused while KUBICU looks into something. Please try again later." />;
  }
  // An archived campaign or DealRoom forwards to the main page (D50).
  if (resolved.redirectTo && resolved.redirectTo !== handle) return <Navigate to={pageHref(resolved.redirectTo, '')} replace />;
  // Renamed or removed pages forward to their new address.
  if (route && 'redirect' in route) return <Navigate to={`${pageHref(handle, route.redirect)}${isDraft ? '?draft=1' : ''}`} replace />;
  if (!route && customRedirect)
  return /^https?:\/\//.test(customRedirect.to) ?
  <ExternalRedirect url={customRedirect.to} /> :

  <Navigate to={`${pageHref(handle, customRedirect.to)}${isDraft ? '?draft=1' : ''}`} replace />;

  if (!route)
  return (
    <Unavailable
      handle={`${handle}/${view === 'shop' ? STOREFRONT_PATH : rawPath ?? ''}`}
      title="This page doesn’t exist"
      body={`${resolved.doc.title} doesn’t have a page at this address. It may have been renamed or removed.`}
      homeHref={`${pageHref(handle, '')}${isDraft ? '?draft=1' : ''}`}
      homeLabel={`Go to ${resolved.doc.title}`} />);


  const draftQs = isDraft ? '?draft=1' : '';
  const shopHref = `${pageHref(handle, STOREFRONT_PATH)}${draftQs}`;
  if (wantShop && productId && !shopProduct)
  return (
    <Unavailable
      handle={`${handle}/${STOREFRONT_PATH}`}
      title="This product isn’t available"
      body="It may have sold out for good, been renamed or removed. Everything else is still in the shop."
      homeHref={shopHref}
      homeLabel="Back to the shop" />);


  const { doc, plan, example } = resolved;
  // Examples never sell anything; their catalogue is empty.
  const catalog = example ? null : commerce.data;
  const sf = catalog?.storefront;
  const nav: NavItem[] = [...navItems(doc), ...(shopOn && sf?.showInMenu ? [{ id: SHOP_NAV_ID, label: sf.menuLabel || 'Shop', path: STOREFRONT_PATH }] : [])];
  const roomCheckout = doc.dealRoom && catalog ? dealRoomCheckout(doc.dealRoom, handle, catalog) : undefined;
  const navHref = (item: NavItem) => `${pageHref(handle, item.path)}${draftQs}`;
  const productHref = (id: string) => {
    const p = readableProducts ? catalog?.products.find((x) => x.id === id) : undefined;
    return `${pageHref(handle, `${STOREFRONT_PATH}/${p && catalog ? productSlug(p, catalog.products) : id}`)}${draftQs}`;
  };
  // Campaigns show the version for the current phase; draft previews can pick one (D52).
  const previewPhase = params.get('phase');
  const phase: CampaignPhase | null = doc.campaign ?
  isDraft && (previewPhase === 'before' || previewPhase === 'live' || previewPhase === 'ended') ?
  previewPhase :
  campaignPhase(doc.campaign) :
  null;
  const campaignCode = doc.campaign?.discountId ? catalog?.discounts.find((d) => d.id === doc.campaign?.discountId)?.code || undefined : undefined;
  const hasMemberContent = memberAreas([{ id: null, title: '', blocks: doc.blocks }, ...sitePages(doc).map((p) => ({ id: p.id, title: p.title, blocks: p.blocks, rule: p.membersOnly ?? null }))]).length > 0;
  const memberPreview: MembersValue['preview'] = isDraft ? params.get('member') === '1' ? 'member' : 'visitor' : null;
  const membersValue: MembersValue = {
    handle,
    session: memberPreview ? null : memberSession,
    preview: memberPreview,
    check: (rule) => memberPreview === 'member' ? { ok: true } : memberPreview === 'visitor' ? { ok: false, reason: 'signed_out' } : checkAccess(catalog, memberSession, rule),
    openSignIn: () => {
      if (memberPreview || example) return;
      setSignInOpen(true);
    },
    signOut: () => {
      if (memberWid) writeSession(memberWid, null);
      setMemberSession(null);
      announce('Signed out of members-only content');
    },
    join: isDraft || example || !catalog ? null : (id) => {
      track('subscribe_open', { label: id });
      setSubPlanId(id);
    }
  };
  const memberQs = (m: boolean) => {
    const next = new URLSearchParams(params);
    if (m) next.set('member', '1');else
    next.delete('member');
    return `?${next.toString()}`;
  };

  return (
    <div className="min-h-screen w-full" style={{ background: doc.theme.background }}>
      {isDraft &&
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-raised px-3 py-2 text-fg shadow-1">
          <span className="inline-flex min-w-0 items-center gap-2 text-label">
            <EyeIcon size={15} className="shrink-0 text-action" aria-hidden />
            <span className="truncate">
              <span className="font-semibold">Draft preview</span>
              <span className="hidden text-fg-muted sm:inline"> — visitors still see your last published version</span>
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {hasMemberContent &&
          <nav aria-label="View members-only content as" className="flex items-center gap-0.5 rounded-md border border-line p-0.5">
                {([false, true] as const).map((m) =>
            <Link
              key={String(m)}
              to={memberQs(m)}
              replace
              aria-current={memberPreview === 'member' === m ? 'true' : undefined}
              className={cn('whitespace-nowrap rounded-sm px-2.5 py-1 text-caption font-medium', memberPreview === 'member' === m ? 'bg-sunken text-fg' : 'text-fg-muted hover:text-fg')}>
              
                    {m ? 'Member' : 'Visitor'}
                  </Link>
            )}
              </nav>
          }
            {phase &&
          <nav aria-label="Preview campaign phase" className="hidden items-center gap-0.5 rounded-md border border-line p-0.5 sm:flex">
                {phaseOrder.map((p) =>
            <Link
              key={p}
              to={`?draft=1&phase=${p}`}
              replace
              aria-current={p === phase ? 'true' : undefined}
              className={cn('rounded-sm px-2.5 py-1 text-caption font-medium', p === phase ? 'bg-sunken text-fg' : 'text-fg-muted hover:text-fg')}>
              
                    {phaseLabels[p]}
                  </Link>
            )}
              </nav>
          }
            <Button size="sm" variant="secondary" leadingIcon={ArrowLeftIcon} onClick={() => navigate(`/app/canvas/${doc.id}`)}>
              Back to editor
            </Button>
          </div>
        </div>
      }
      {example &&
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-center text-[12px] font-medium" style={{ background: doc.theme.text, color: doc.theme.background }}>
          <InfoIcon size={13} aria-hidden className="shrink-0" />
          <span>
            Example page — {example.name} is a fictional business.{' '}
            <Link to={`/templates/${example.id}`} className="underline underline-offset-2">
              Use this template
            </Link>
          </span>
        </div>
      }
      <DataSaverProvider disabled={isDraft} sellerDefault={!!doc.branding?.startLightweight}>
      <DataSaverBar theme={doc.theme} />
      <TrackProvider value={track}>
      <RenderPlanProvider plan={plan}>
        <CatalogProvider data={catalog}>
          <PageOpsProvider value={{ data: example ? null : ops.data, actions: isDraft ? null : opsActions, workspaceId: example ? null : resolved.workspaceId ?? null }}>
          <SubscribeProvider
                  open={
                  isDraft || example || !catalog ?
                  null :
                  (id) => {
                    track('subscribe_open', { label: id });
                    setSubPlanId(id);
                  }
                  }>
                  
            <MembersProvider value={membersValue}>
            <CartProvider pageKey={`${resolved.workspaceId ?? 'example'}:${handle}`}>
              {wantShop && catalog ?
                      <main>
                  {nav.length > 1 && <SkipLink target="page-content" />}
                  <PageSurface
                          theme={doc.theme}
                          columnClassName="max-w-[1120px] md:px-8"
                          footer={<PublicFooter theme={doc.theme} badge={showsKubicuBadge(doc, plan)} handle={handle} workspaceId={resolved.workspaceId ?? null} />}
                          header={nav.length > 1 ? <SiteNav theme={doc.theme} title={doc.title} items={nav} activeId={SHOP_NAV_ID} hrefFor={navHref} /> : undefined}>
                          
                    <span id="page-content" tabIndex={-1} className="sr-only">Page content</span>
                    {shopProduct ?
                          <ProductDetailView theme={doc.theme} data={catalog} product={shopProduct} ordering={storefrontOrdering(catalog, plan.id)} whatsappPhone={catalog.storefront.whatsappPhone || sellerPhone(doc)} shopHref={shopHref} productHref={productHref} /> :

                          <StorefrontView theme={doc.theme} data={catalog} productHref={productHref} />
                          }
                  </PageSurface>
                </main> :

                      <PageBody site={doc} pageId={pageId} plan={plan} isDraft={isDraft} phase={phase} nav={nav} navHref={navHref} handle={handle} />
                      }
              {catalog && <CheckoutSheet theme={doc.theme} commerce={commerce} ownerPlan={plan.id} handle={handle} defaultCode={phase === 'live' ? campaignCode : undefined} dealRoom={roomCheckout} />}
              <CartButton theme={doc.theme} />
              {resolved?.workspaceId && !resolved.example && !isDraft && <ConsentStrip workspaceId={resolved.workspaceId} theme={doc.theme} />}
            </CartProvider>
            {hasMemberContent && !isDraft && !example &&
                    <MemberSignInSheet
                      open={signInOpen}
                      onClose={() => setSignInOpen(false)}
                      theme={doc.theme}
                      data={catalog}
                      business={doc.title}
                      onJoin={membersValue.join ? () => {
                        setSignInOpen(false);
                        const first = catalog?.subPlans.find((p) => p.status === 'active');
                        if (first) membersValue.join?.(first.id);
                      } : null}
                      onSignedIn={(s) => {
                        if (memberWid) writeSession(memberWid, s);
                        setMemberSession(s);
                        setSignInOpen(false);
                        track('member_signin');
                        announce(`Signed in as ${maskContact(s.contact, s.channel)}. Members-only content is now showing.`);
                      }} />

                    }
            </MembersProvider>
            <BookingSheet theme={doc.theme} ops={ops} serviceId={bookingService} handle={handle} onClose={() => setBookingService(null)} />
            {catalog &&
                  <SubscribeSheet
                    theme={doc.theme}
                    commerce={commerce}
                    planId={subPlanId}
                    handle={handle}
                    ownerPlan={plan.id}
                    onClose={() => setSubPlanId(null)}
                    onSubscribed={(c, planName, consent) => ops.apply((d) => upsertContact(d, c, 'order', `Subscribed to ${planName}`, { consent: consent ? 'subscribed' : 'transactional' }))} />

                  }
          </SubscribeProvider>
          </PageOpsProvider>
        </CatalogProvider>
      </RenderPlanProvider>
      </TrackProvider>
      </DataSaverProvider>
    </div>);

}

function PageBody({
  site,
  pageId,
  plan,
  isDraft,
  phase,
  nav,
  navHref,
  handle









}: {site: PageDocument;pageId: string | null;plan: PlanInfo;isDraft: boolean;phase: CampaignPhase | null;nav: NavItem[];navHref: (item: NavItem) => string;handle: string;}) {
  const doc = pageView(site, pageId);
  const track = useTrack();
  // Draft preview shows scheduled blocks too, so owners can check them before their window opens.
  // IntentFlow (D64): blocks follow the visit's source; draft previews can pick one with ?as=.
  const [params] = useSearchParams();
  const asParam = isDraft ? params.get('as') as SourceId | null : null;
  const source: SourceId = asParam && intentSources.includes(asParam) ? asParam : visitSource(params).source;
  const visible = doc.blocks.filter((b) => (isDraft ? !b.visibility.hidden : isLiveNow(b.visibility)) && (!phase || blockInPhase(b, phase)) && showsForSource(b.visibility, source));
  // Members-only (D110): a members-only page shows one sign-in card; a section hides the blocks below it.
  const members = useMembers();
  const pageRule = pageId ? findPage(site, pageId)?.membersOnly ?? null : null;
  const pageAccess = pageRule && members ? members.check(pageRule) : { ok: true };
  const pageLocked = !!pageRule && !pageAccess.ok;
  const renderList = buildRenderList(visible, members);
  // QR codes and links can open onto one block (D72): scroll to it, mark it briefly, and open booking straight away.
  const anchor = params.get('b');
  const [marked, setMarked] = useState<string | null>(null);
  const opsCtx = usePageOpsContext();
  useEffect(() => {
    const target = anchor ? visible.find((b) => b.id === anchor) : undefined;
    if (!target) {
      window.scrollTo(0, 0);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(() => {
      document.getElementById(`b-${target.id}`)?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      setMarked(target.id);
      if (target.type === 'booking') {
        const c = target.content as {source?: string;serviceId?: string | null;};
        if (c.source === 'catalog' && c.serviceId && opsCtx.data?.services.some((s) => s.id === c.serviceId && s.active)) opsCtx.actions?.openBooking(c.serviceId);
      }
    }, 120);
    const clear = window.setTimeout(() => setMarked(null), 1900);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(clear);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, anchor]);
  return (
    <main>
      {nav.length > 1 && <SkipLink target="page-content" />}
      <PageSurface
        theme={doc.theme}
        footer={<PublicFooter theme={doc.theme} badge={showsKubicuBadge(doc, plan)} handle={handle} workspaceId={null} />}
        header={
        nav.length > 1 || site.coBrand ?
        <>
              {site.coBrand && <CoBrandStrip coBrand={site.coBrand} theme={doc.theme} />}
              {nav.length > 1 && <SiteNav theme={doc.theme} title={site.title} items={nav} activeId={pageId} hrefFor={navHref} />}
            </> :
        undefined
        }>
        
        <span id="page-content" tabIndex={-1} className="sr-only">Page content</span>
        {site.dealRoom && !pageId &&
        <div className="mb-4">
            <DealRoomPanel room={site.dealRoom} handle={handle} theme={doc.theme} mode="live" />
          </div>
        }
        {pageLocked && pageRule && members ?
        <MembersLocked
          theme={doc.theme}
          rule={pageRule}
          id={`page-${pageId}`}
          kind="page"
          title={`${findPage(site, pageId)?.title || 'This page'} is for members`}
          teaser={pageRule.teaser}
          joinLabel="Become a member"
          hiddenCount={0}
          access={pageAccess} /> :


        <>
            {pageRule && members && <div className="mb-3"><MembersOpenBar theme={doc.theme} title="Members-only page" id={`page-${pageId}`} access={pageAccess} /></div>}
            {renderList.map((item) => {
            if (item.kind === 'locked')
            return (
              <div key={item.block.id} id={`b-${item.block.id}`} className={cn(spacingClass[item.block.layout.spacing], 'scroll-mt-20')}>
                    <MembersLocked theme={doc.theme} rule={item.block.content} id={item.block.id} kind="section" title={item.block.content.title} teaser={item.block.content.teaser} joinLabel={item.block.content.joinLabel} hiddenCount={item.hidden} access={item.access} />
                  </div>);

            if (item.kind === 'open')
            return (
              <div key={item.block.id} id={`b-${item.block.id}`} className={cn(spacingClass[item.block.layout.spacing], 'scroll-mt-20')}>
                    <MembersOpenBar theme={doc.theme} title={item.block.content.title} id={item.block.id} access={item.access} />
                  </div>);

            const block = item.block;
            return (
              <div
                key={block.id}
                id={`b-${block.id}`}
                data-block-type={block.type}
                className={cn(spacingClass[block.layout.spacing], 'scroll-mt-20 rounded-[14px] transition-[outline-color] duration-300 ease-out')}
                style={{ outline: '2px solid', outlineOffset: 4, outlineColor: marked === block.id ? doc.theme.text : 'transparent' }}
                // Taps on any link or button inside a block are counted for that block (D61).
                onClickCapture={(e) => {
                  const el = (e.target as HTMLElement).closest('a,button');
                  if (!el) return;
                  track('tap', { blockId: block.id, label: (el.getAttribute('aria-label') || el.textContent || blockName(block)).trim().slice(0, 80) });
                }}>
                
            <BlockRenderer block={block} theme={doc.theme} mode="live" />
          </div>);

          })}
          </>
        }
      </PageSurface>
    </main>);

}

type RenderItem =
{kind: 'block';block: Block;} |
{kind: 'locked';block: Extract<Block, {type: 'membersOnly';}>;hidden: number;access: ReturnType<MembersValue['check']>;} |
{kind: 'open';block: Extract<Block, {type: 'membersOnly';}>;access: ReturnType<MembersValue['check']>;};

/** Swaps each members-only section for a sign-in card (and drops what it hides) or a members strip. */
function buildRenderList(blocks: Block[], members: MembersValue | null): RenderItem[] {
  const out: RenderItem[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type !== 'membersOnly') {
      out.push({ kind: 'block', block: b });
      continue;
    }
    if (!members) continue;
    const access = members.check(b.content);
    if (access.ok) {
      out.push({ kind: 'open', block: b, access });
      continue;
    }
    const hidden = coveredCount(blocks, i);
    out.push({ kind: 'locked', block: b, hidden, access });
    i += hidden;
  }
  return out;
}

export function Unavailable({
  handle,
  title = 'This page isn’t available',
  body,
  homeHref = '/',
  homeLabel = 'Create your own KUBICU page'






}: {handle: string;title?: string;body?: string;homeHref?: string;homeLabel?: string;}) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F4F1EA] px-6 text-center text-[#171717]">
      <p className="text-[13px] font-medium text-[#6B6459]">kub.icu/{handle}</p>
      <h1 className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-[-0.022em]">{title}</h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[#5E574D]">
        {body ?? 'It may not be published yet, or the owner may have changed its link. Check the address and try again.'}
      </p>
      <Link to={homeHref} className="mt-8 inline-flex h-12 items-center rounded-full bg-[#171717] px-6 text-[15px] font-semibold text-[#F4F1EA]">
        {homeLabel}
      </Link>
    </main>);

}