import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import { useCommerce } from '../../contexts/CommerceContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { SelectInput } from '../../components/ui/SelectInput';
import { BusinessReceiptsSection } from '../../components/commerce/settings/BusinessReceiptsSection';
import { CheckoutSettingsSection } from '../../components/commerce/settings/CheckoutSettingsSection';
import { ShopPaymentMethodsSection } from '../../components/commerce/settings/ShopPaymentMethodsSection';
import { DeliveryPickupSection } from '../../components/commerce/settings/DeliveryPickupSection';
import { TaxSection } from '../../components/commerce/settings/TaxSection';
import { OrdersStockSection } from '../../components/commerce/settings/OrdersStockSection';
import { PoliciesSection } from '../../components/commerce/settings/PoliciesSection';
import { StoreStatusSection } from '../../components/commerce/settings/StoreStatusSection';
import { CustomerMessagesSection } from '../../components/commerce/settings/CustomerMessagesSection';
import { shopSettingsOf } from '../../utils/commerce/shopSettings';
import { cn } from '../../utils/cn';

const sections = [
{ id: 'business', label: 'Business & receipts' },
{ id: 'checkout', label: 'Checkout' },
{ id: 'methods', label: 'Payment methods' },
{ id: 'delivery', label: 'Delivery & pickup' },
{ id: 'tax', label: 'Tax' },
{ id: 'orders', label: 'Orders & stock' },
{ id: 'policies', label: 'Policies' },
{ id: 'status', label: 'Store status' },
{ id: 'messages', label: 'Customer messages' }];


/** Settings that live on other screens, linked so nothing exists in two places (D222). */
const elsewhere = [
{ label: 'Currency and business WhatsApp', to: '/app/settings/business' },
{ label: 'Payment provider, pay on delivery and instalments', to: '/app/commerce/payments' },
{ label: 'Bank account and payouts', to: '/app/commerce/wallet' },
{ label: 'Shop look and WhatsApp ordering', to: '/app/commerce/storefront' }];


/** Commerce settings, one page with sections and a contents list (D222). Each section saves on its own. */
export function CommerceSettings() {
  const { data, loadSample, clearSampleData, hasSample } = useCommerce();
  const [confirmClear, setConfirmClear] = useState(false);
  const [active, setActive] = useState(sections[0].id);
  const paused = shopSettingsOf(data).status.paused;

  // Highlight the section in view.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const jump = (id: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setActive(id);
    window.setTimeout(() => document.getElementById(`${id}-title`)?.focus({ preventScroll: true }), reduce ? 0 : 350);
  };

  // Links from other screens (e.g. "Edit in Policies") land on their section, not the top of the page.
  const { hash } = useLocation();
  useEffect(() => {
    const id = hash.replace('#', '');
    if (!sections.some((s) => s.id === id)) return;
    const t = window.setTimeout(() => jump(id), 60);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <>
      <PageHeader title="Commerce settings" description={paused ? 'Your shop is paused — checkout is closed until you open it again.' : 'How your shop takes orders, gets paid and talks to buyers.'} />

      <div className="mt-6 lg:hidden">
        <SelectInput<string> id="cs-jump" label="Jump to" value={active} options={sections.map((s) => ({ value: s.id, label: s.label }))} onChange={jump} />
      </div>

      <div className="mt-6 grid items-start gap-10 lg:mt-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Commerce settings sections" className="sticky top-6 hidden lg:block">
          <ul className="flex flex-col gap-0.5 border-l border-line">
            {sections.map((s) =>
            <li key={s.id}>
                <a
                href={`#${s.id}`}
                aria-current={active === s.id ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  jump(s.id);
                }}
                className={cn(
                  '-ml-px block border-l-2 py-1.5 pl-3 text-label transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  active === s.id ? 'border-action font-semibold text-fg' : 'border-transparent text-fg-muted hover:text-fg'
                )}>
                
                  {s.label}
                </a>
              </li>
            )}
          </ul>
          <div className="mt-8 flex flex-col gap-2 pl-3">
            <p className="text-caption font-semibold text-fg-subtle">Set elsewhere</p>
            {elsewhere.map((e) =>
            <Link key={e.to} to={e.to} className="inline-flex items-start gap-1 text-caption text-fg-muted hover:text-fg hover:underline">
                {e.label} <ArrowUpRightIcon size={11} aria-hidden className="mt-0.5 shrink-0" />
              </Link>
            )}
          </div>
        </nav>

        <div className="flex min-w-0 flex-col gap-8">
          <BusinessReceiptsSection />
          <CheckoutSettingsSection />
          <ShopPaymentMethodsSection />
          <DeliveryPickupSection />
          <TaxSection />
          <OrdersStockSection />
          <PoliciesSection />
          <StoreStatusSection />
          <CustomerMessagesSection />

          <section aria-labelledby="sample-heading" className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="sample-heading" className="text-label font-semibold text-fg">
                Sample data
              </h2>
              <p className="text-caption text-fg-subtle">{hasSample ? 'Sample products and orders are labelled “Sample”. Clear them before you start selling.' : 'Add labelled sample products and orders to explore every screen.'}</p>
            </div>
            {hasSample ?
            <Button variant="destructive" size="sm" onClick={() => setConfirmClear(true)}>
                Clear sample data
              </Button> :

            <Button variant="secondary" size="sm" onClick={loadSample}>
                Add sample data
              </Button>
            }
          </section>

          <div className="flex flex-col gap-2 lg:hidden">
            <p className="text-caption font-semibold text-fg-subtle">Set elsewhere</p>
            {elsewhere.map((e) =>
            <Link key={e.to} to={e.to} className="inline-flex min-h-[36px] items-center gap-1 text-label text-fg-muted hover:text-fg hover:underline">
                {e.label} <ArrowUpRightIcon size={12} aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        size="sm"
        title="Clear all sample data?"
        description="Sample products, orders and stock history are removed. Anything you added yourself stays. Page blocks linked to sample products will show a warning."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmClear(false)} data-autofocus>
              Cancel
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              clearSampleData();
              setConfirmClear(false);
            }}>
            
              Clear sample data
            </Button>
          </>
        } />
      
    </>);

}