import React, { useEffect, useMemo, useState } from 'react';
import { PageOpsProvider, type PageOpsActions } from '../contexts/PageOpsContext';
import { BookingSheet } from '../components/booking/BookingSheet';
import { usePageOps } from '../hooks/usePageOps';
import { upsertContact } from '../utils/ops/ops';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { SiteNav } from '../components/blocks/SiteNav';
import { findPage, navItems, pageHref, pageView, resolvePath, showsNav } from '../utils/sitePages';
import { ArrowLeftIcon, EyeIcon, InfoIcon } from 'lucide-react';
import { RenderPlanProvider } from '../contexts/RenderPlanContext';
import { CatalogProvider } from '../contexts/CatalogContext';
import { CartProvider } from '../contexts/CartContext';
import { PageSurface } from '../components/blocks/PageSurface';
import { BlockRenderer, spacingClass } from '../components/blocks/BlockRenderer';
import { MadeWithKubicu } from '../components/blocks/MadeWithKubicu';
import { CheckoutSheet } from '../components/checkout/CheckoutSheet';
import { CartButton } from '../components/checkout/CartButton';
import { Button } from '../components/ui/Button';
import { showsKubicuBadge } from '../utils/branding';
import { isLiveNow } from '../utils/schedule';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { usePageCommerce } from '../hooks/usePageCommerce';
import type { PageDocument } from '../types/page';
import type { PlanInfo } from '../data/plans';

export function PublicPage() {
  const { handle = '', pagePath } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isDraft = params.get('draft') === '1';
  const resolved = useResolvedPage(handle, isDraft);
  const commerce = usePageCommerce(resolved?.workspaceId ?? null, !!resolved?.isOwn);
  const ops = usePageOps(resolved?.workspaceId ?? null, !!resolved?.isOwn);
  const [bookingService, setBookingService] = useState<string | null>(null);

  const opsActions = useMemo<PageOpsActions | null>(() => {
    if (!resolved || resolved.example) return null;
    return {
      submitLead: (v, formTitle, consent) =>
      ops.apply((d) => upsertContact(d, { name: v.name, email: v.email, phone: v.phone }, 'form', `Sent “${formTitle}”${v.message ? `: ${v.message.slice(0, 140)}` : ''}`, { consent: consent ? 'subscribed' : 'transactional' })),
      subscribe: (v, title) => ops.apply((d) => upsertContact(d, { name: '', email: v.email, phone: '' }, 'newsletter', `Subscribed via “${title}”`, { consent: 'subscribed' })),
      openBooking: (id) => setBookingService(id)
    };
  }, [resolved, ops]);

  const route = resolved ? resolvePath(resolved.doc, pagePath) : null;
  const pageId = route && 'pageId' in route ? route.pageId : null;
  const sub = resolved ? findPage(resolved.doc, pageId) : undefined;

  useEffect(() => {
    const previous = document.title;
    const view = resolved ? pageView(resolved.doc, pageId) : null;
    document.title = resolved && view ? view.seo.title || (sub ? `${sub.title} · ${resolved.doc.title}` : resolved.doc.title) : 'Page not available · KUBICU';
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content') ?? null;
    if (meta && view) meta.setAttribute('content', view.seo.description);
    return () => {
      document.title = previous;
      if (meta && previousDescription !== null) meta.setAttribute('content', previousDescription);
    };
  }, [resolved, pageId, sub]);

  if (!resolved) return <Unavailable handle={handle} />;
  // Renamed or removed pages forward to their new address.
  if (route && 'redirect' in route) return <Navigate to={`${pageHref(handle, route.redirect)}${isDraft ? '?draft=1' : ''}`} replace />;
  if (!route)
  return (
    <Unavailable
      handle={`${handle}/${pagePath ?? ''}`}
      title="This page doesn’t exist"
      body={`${resolved.doc.title} doesn’t have a page at this address. It may have been renamed or removed.`}
      homeHref={`${pageHref(handle, '')}${isDraft ? '?draft=1' : ''}`}
      homeLabel={`Go to ${resolved.doc.title}`} />);


  const { doc, plan, example } = resolved;
  // Examples never sell anything; their catalogue is empty.
  const catalog = example ? null : commerce.data;

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
          <Button size="sm" variant="secondary" leadingIcon={ArrowLeftIcon} onClick={() => navigate(`/app/canvas/${doc.id}`)}>
            Back to editor
          </Button>
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
      <RenderPlanProvider plan={plan}>
        <CatalogProvider data={catalog}>
          <PageOpsProvider value={{ data: example ? null : ops.data, actions: isDraft ? null : opsActions }}>
            <CartProvider pageKey={`${resolved.workspaceId ?? 'example'}:${handle}`}>
              <PageBody site={doc} pageId={pageId} plan={plan} isDraft={isDraft} handle={handle} />
              {catalog && <CheckoutSheet theme={doc.theme} commerce={commerce} ownerPlan={plan.id} handle={handle} />}
              <CartButton theme={doc.theme} />
            </CartProvider>
            <BookingSheet theme={doc.theme} ops={ops} serviceId={bookingService} handle={handle} onClose={() => setBookingService(null)} />
          </PageOpsProvider>
        </CatalogProvider>
      </RenderPlanProvider>
    </div>);

}

function PageBody({ site, pageId, plan, isDraft, handle }: {site: PageDocument;pageId: string | null;plan: PlanInfo;isDraft: boolean;handle: string;}) {
  const doc = pageView(site, pageId);
  // Draft preview shows scheduled blocks too, so owners can check them before their window opens.
  const visible = doc.blocks.filter((b) => isDraft ? !b.visibility.hidden : isLiveNow(b.visibility));
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageId]);
  return (
    <main>
      <PageSurface
        theme={doc.theme}
        footer={showsKubicuBadge(doc, plan) ? <MadeWithKubicu theme={doc.theme} mode="live" /> : <div className="pb-10" />}
        header={
        showsNav(site) ?
        <SiteNav theme={doc.theme} title={site.title} items={navItems(site)} activeId={pageId} hrefFor={(item) => `${pageHref(handle, item.path)}${isDraft ? '?draft=1' : ''}`} /> :
        undefined
        }>
        
        {visible.map((block) =>
        <div key={block.id} className={spacingClass[block.layout.spacing]}>
            <BlockRenderer block={block} theme={doc.theme} mode="live" />
          </div>
        )}
      </PageSurface>
    </main>);

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