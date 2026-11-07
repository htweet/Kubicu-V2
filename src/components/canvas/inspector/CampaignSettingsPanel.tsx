import React from 'react';
import { Link } from 'react-router-dom';
import type { CampaignSettings, PageDocument } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useT } from '../../../contexts/LocaleContext';
import { DateTimeInput } from '../../ui/DateTimeInput';
import { Badge } from '../../ui/Badge';
import { fieldControlClass } from '../../ui/Field';
import { campaignPhase, campaignTotals, phaseLabels, starterLabels } from '../../../utils/campaign';
import { discountStatus, discountStatusLabel, valueLabel } from '../../../utils/commerce/discounts';
import { formatSchedule, timeZoneLabel } from '../../../utils/schedule';
import { formatNgn } from '../../../utils/format';
import { cn } from '../../../utils/cn';

/** Campaign window, linked discount, featured products and results (D52). Translated in D307. */
export function CampaignSettingsPanel() {
  const { t: tr } = useT();
  const { state, actions } = useEditor();
  const { data } = useCommerce();
  const c = state.site.campaign;
  if (!c) return null;
  const phase = campaignPhase(c);
  // Same facts as phaseSummary(), with the date placed inside a translatable sentence.
  const summary =
    phase === 'before' && c.startsAt
      ? tr('Starts {when}', { when: formatSchedule(c.startsAt) })
      : phase === 'live'
        ? c.endsAt
          ? tr('Ends {when}', { when: formatSchedule(c.endsAt) })
          : tr('No end date')
        : c.endsAt
          ? tr('Ended {when}', { when: formatSchedule(c.endsAt) })
          : tr('Ended');
  const totals = campaignTotals(data, state.site.handle);
  const codes = data.discounts.filter((d) => d.kind === 'code');
  const products = data.products.filter((p) => p.status !== 'archived' && p.kind !== 'ticket');

  const update = (patch: Partial<CampaignSettings>) =>
    actions.transformDocument((doc) => {
      if (!doc.campaign) return doc;
      const prev = doc.campaign;
      const next = { ...prev, ...patch };
      // Countdowns that pointed at the old start/end follow the new dates.
      const retarget = (d: PageDocument['blocks']) =>
        d.map((b) => {
          if (b.type !== 'countdown') return b;
          const t = b.content.target;
          if ('startsAt' in patch && t === prev.startsAt) return { ...b, content: { ...b.content, target: next.startsAt } };
          if ('endsAt' in patch && t === prev.endsAt) return { ...b, content: { ...b.content, target: next.endsAt } };
          return b;
        });
      return { ...doc, campaign: next, blocks: retarget(doc.blocks) };
    });

  const toggleProduct = (id: string) => update({ productIds: c.productIds.includes(id) ? c.productIds.filter((x) => x !== id) : [...c.productIds, id] });

  return (
    <section aria-labelledby="campaign-heading" className="flex flex-col gap-4 border-b border-line pb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="campaign-heading" className="text-label font-semibold text-fg">
            {tr('Campaign')}
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">
            {tr(starterLabels[c.starter].label)} · {summary}
          </p>
        </div>
        <Badge tone={phase === 'live' ? 'success' : phase === 'before' ? 'info' : 'neutral'} dot>
          {tr('Now: {phase}', { phase: tr(phaseLabels[phase]) })}
        </Badge>
      </div>

      <div className="grid gap-3">
        <DateTimeInput id="camp-start" label={tr('Starts')} optional clearable value={c.startsAt} onChange={(startsAt) => update({ startsAt })} hint={tr('Empty = starts as soon as it’s published.')} />
        <DateTimeInput
          id="camp-end"
          label={tr('Ends')}
          clearable
          value={c.endsAt}
          onChange={(endsAt) => update({ endsAt })}
          error={c.startsAt && c.endsAt && Date.parse(c.endsAt) <= Date.parse(c.startsAt) ? tr('End after it starts.') : !c.endsAt ? tr('Needed to publish.') : undefined}
        />
        <p className="text-caption text-fg-subtle">{tr('Times are in {zone}. Visitors see the Before, Live and Ended versions automatically.', { zone: timeZoneLabel() })}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="camp-discount" className="text-label font-medium text-fg">
          {tr('Discount code')} <span className="font-normal text-fg-subtle">· {tr('optional')}</span>
        </label>
        <select id="camp-discount" value={c.discountId ?? ''} onChange={(e) => update({ discountId: e.target.value || null })} className={cn(fieldControlClass, 'h-10')}>
          <option value="">{tr('No discount')}</option>
          {codes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.code} — {valueLabel(d.value)} ({tr(discountStatusLabel[discountStatus(d, data)])})
            </option>
          ))}
        </select>
        <p className="text-caption text-fg-subtle">
          {tr('Applied automatically at checkout while the campaign is live.')}{' '}
          <Link to="/app/commerce/discounts" className="font-medium text-fg underline underline-offset-2">
            {tr('Manage discounts')}
          </Link>
        </p>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-label font-medium text-fg">{tr('Featured products')}</legend>
        {products.length === 0 ? (
          <p className="text-caption text-fg-subtle">
            {tr('No products yet.')}{' '}
            <Link to="/app/commerce/products" className="font-medium text-fg underline underline-offset-2">
              {tr('Add products')}
            </Link>
          </p>
        ) : (
          <ul className="scroll-quiet flex max-h-44 flex-col overflow-y-auto rounded-md border border-line">
            {products.map((p) => (
              <li key={p.id} className="border-b border-line last:border-0">
                <label className="flex min-h-[40px] cursor-pointer items-center gap-2.5 px-3 py-1.5 text-label text-fg hover:bg-sunken">
                  <input type="checkbox" className="h-4 w-4" checked={c.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                  <span className="truncate">{p.name}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1.5 text-caption text-fg-subtle">{tr('Checked before publishing for stock and status. Add a Product grid block to show them.')}</p>
      </fieldset>

      <dl className="grid grid-cols-3 gap-2 rounded-md bg-sunken p-3">
        <div>
          <dt className="text-caption text-fg-subtle">{tr('Orders')}</dt>
          <dd className="text-label font-semibold tabular-nums text-fg">{totals.orders}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">{tr('Revenue')}</dt>
          <dd className="text-label font-semibold tabular-nums text-fg">{formatNgn(totals.revenueNgn)}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">{tr('Discounted')}</dt>
          <dd className="text-label font-semibold tabular-nums text-fg">{totals.discountNgn ? `−${formatNgn(totals.discountNgn)}` : '—'}</dd>
        </div>
      </dl>
    </section>
  );
}
