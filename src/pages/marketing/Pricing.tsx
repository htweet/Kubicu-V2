import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, MinusIcon, PuzzleIcon } from 'lucide-react';
import { plans } from '../../data/plans';
import { planHighlights } from '../../data/planHighlights';
import { addOns, pricingFaq } from '../../data/marketing';
import { featureStatusLabels, planMatrix, type PlanCell } from '../../data/planMatrix';
import type { WorkspacePlan } from '../../types/plan';
import type { BillingCycle } from '../../types/billing';
import { priceFor, yearlySaving } from '../../utils/billing';
import { formatNgn } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Segmented } from '../../components/ui/Segmented';
import { FaqList } from '../../components/marketing/FaqList';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { cn } from '../../utils/cn';

type Cell = PlanCell;

const shown: WorkspacePlan[] = ['free', 'creator', 'pro', 'business', 'agency'];
const featured: WorkspacePlan = 'pro';
const groups = planMatrix;

export function Pricing() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-14 md:px-8 md:pt-20">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.032em] text-fg md:text-[56px]">
          Start free. <span className="nm-text">Pay when it pays you.</span>
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-fg-muted">Every plan includes the canvas and publishing. Upgrade for your own brand, checkout, bookings and teams.</p>
        <div className="mt-8 flex flex-col items-center gap-2">
          <Segmented
            ariaLabel="Billing period"
            value={cycle}
            onChange={setCycle}
            options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly · 2 months free' }]
            } />
          
          <p className="text-caption text-fg-subtle">Launch prices. Nobody is charged in this prototype.</p>
        </div>
      </header>

      {/* Plan cards */}
      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {shown.map((id) => {
          const price = priceFor(id, cycle);
          const isFeatured = id === featured;
          const card =
          <div className={cn('flex h-full flex-col rounded-2xl p-5', isFeatured ? 'rounded-[15px] bg-raised' : 'border border-line bg-raised/60')}>
              <div className="flex min-h-[24px] items-center justify-between gap-2">
                <h2 className="text-heading font-semibold text-fg">{plans[id].name}</h2>
                {isFeatured && <span className="nm-fill rounded-full px-2 py-0.5 text-[11px] font-semibold text-[rgb(16_14_26)]">Most chosen</span>}
              </div>
              <p className="mt-1 min-h-[40px] text-caption text-fg-subtle">{plans[id].intendedFor}</p>
              <p className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-[30px] font-semibold tabular-nums tracking-[-0.02em] text-fg">{price === 0 ? '₦0' : formatNgn(price)}</span>
                {price > 0 && <span className="text-caption text-fg-muted">/{cycle === 'yearly' ? 'yr' : 'mo'}</span>}
              </p>
              <p className="min-h-[20px] text-caption text-success">{cycle === 'yearly' && price > 0 ? `Save ${formatNgn(yearlySaving(id))}` : ''}</p>
              <Button variant={isFeatured ? 'brand' : id === 'free' ? 'primary' : 'secondary'} fullWidth className="mt-5" onClick={() => navigate('/signup')}>
                {id === 'free' ? 'Start free' : `Choose ${plans[id].name}`}
              </Button>
              <ul className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5">
                {planHighlights[id].map((h) =>
              <li key={h} className="flex gap-2 text-label text-fg-muted">
                    <CheckIcon size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-[rgb(var(--nm-1))]" aria-hidden />
                    {h}
                  </li>
              )}
              </ul>
            </div>;

          return (
            <li key={id} className={cn(isFeatured && 'nm-frame nm-glow rounded-2xl')}>
              {card}
            </li>);

        })}
      </ul>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-label text-fg-muted">
          <span className="font-semibold text-fg">{plans.enterprise.name}</span> — {plans.enterprise.intendedFor.toLowerCase()}. Custom limits, contracts and dedicated support.
        </p>
        <Button variant="secondary" trailingIcon={ArrowRightIcon} onClick={() => navigate('/about/contact')}>
          Talk to us
        </Button>
      </div>

      {/* Comparison */}
      <section aria-labelledby="compare-heading" className="mt-24">
        <SectionHeading id="compare-heading" title="Compare every plan" lead="Including what’s in preview and what’s coming, so you can plan ahead. Preview means it works, with a partner’s side simulated for now." />
        <div className="scroll-quiet mt-10 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <caption className="sr-only">Plan comparison</caption>
            <thead>
              <tr className="border-b border-line bg-raised">
                <th scope="col" className="w-[30%] px-5 py-4 text-label font-medium text-fg-subtle">Feature</th>
                {shown.map((id) =>
                <th key={id} scope="col" className={cn('px-4 py-4 text-label font-semibold text-fg', id === featured && 'bg-sunken')}>
                    {plans[id].name}
                  </th>
                )}
              </tr>
            </thead>
            {groups.map((g) =>
            <tbody key={g.area}>
                <tr>
                  <th scope="rowgroup" colSpan={shown.length + 1} className="border-b border-line px-5 pb-2 pt-6 text-caption font-semibold text-fg">
                    <span className="nm-text">{g.area}</span>
                  </th>
                </tr>
                {g.rows.map((row) =>
              <tr key={row.label} className="border-b border-line last:border-0">
                    <th scope="row" className="px-5 py-3.5 text-label font-medium text-fg">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {row.label}
                        {row.status !== 'live' &&
                    <span
                      className={cn(
                        'rounded-full border px-1.5 py-px text-[11px] font-semibold leading-4',
                        row.status === 'preview' ? 'border-[rgb(var(--nm-3)/0.5)] text-[rgb(var(--nm-3))]' : 'border-line-strong text-fg-subtle'
                      )}>
                      
                            {featureStatusLabels[row.status]}
                          </span>
                    }
                      </span>
                      {row.note && <span className="block text-caption font-normal text-fg-subtle">{row.note}</span>}
                    </th>
                    {shown.map((id) =>
                <td key={id} className={cn('px-4 py-3.5 text-label', id === featured && 'bg-sunken/50')}>
                        <CellValue value={row.values[id]} />
                      </td>
                )}
                  </tr>
              )}
              </tbody>
            )}
          </table>
        </div>
      </section>

      {/* Add-ons */}
      <section aria-labelledby="addons-heading" className="mt-24">
        <SectionHeading id="addons-heading" title="Add-ons from the marketplace" lead="Install only what you need. Uninstalling never deletes your data." />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {addOns.map((a) =>
          <li key={a.name} className="flex flex-col rounded-2xl border border-line bg-raised p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sunken">
                  <PuzzleIcon size={18} strokeWidth={2.2} className="text-[rgb(var(--nm-3))]" aria-hidden />
                </span>
                <h3 className="text-heading font-semibold text-fg">{a.name}</h3>
              </div>
              <p className="mt-3 text-label leading-relaxed text-fg-muted">{a.text}</p>
              <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-caption">
                <span className="font-semibold text-fg">{a.price}</span>
                <span className="text-fg-subtle">{a.plan}</span>
              </div>
            </li>
          )}
        </ul>
      </section>

      {/* Fees + FAQ */}
      <section aria-labelledby="pricing-faq-heading" className="mt-24 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div>
          <SectionHeading id="pricing-faq-heading" title="Fees and questions" />
          <dl className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-raised p-5 text-label">
            <div className="flex justify-between gap-4">
              <dt className="text-fg-muted">Payment provider</dt>
              <dd className="font-semibold tabular-nums text-fg">1.5% + ₦100</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-muted">KUBICU fee</dt>
              <dd className="font-semibold tabular-nums text-fg">0–2% by plan</dd>
            </div>
            <div className="border-t border-line pt-3 text-caption text-fg-subtle">KUBICU fees are confirmed. The provider rate is an example until a payment partner is chosen.</div>
          </dl>
        </div>
        <FaqList items={pricingFaq} />
      </section>

      <p className="mt-12 text-center text-caption text-fg-subtle">Downgrading never deletes your content. Features above your plan pause until you upgrade again.</p>
    </div>);

}

function CellValue({ value }: {value: Cell;}) {
  if (value === true) return <CheckIcon size={17} strokeWidth={2.4} className="text-success" aria-label="Included" />;
  if (value === false) return <MinusIcon size={17} className="text-fg-subtle" aria-label="Not included" />;
  return <span className="tabular-nums text-fg-muted">{value}</span>;
}