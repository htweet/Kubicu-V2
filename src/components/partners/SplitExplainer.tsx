import React from 'react';
import { InfoIcon } from 'lucide-react';
import { formatNgn } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

interface SplitExplainerProps {
  leadName: string;
  partnerName: string;
  leadSharePct: number;
  /** Example sale used for the worked numbers. */
  exampleNgn?: number;
  /** Who is reading — changes "you" wording. */
  viewer?: 'lead' | 'partner' | 'neutral';
  /** Compact = bar + one line, with the rules folded into a disclosure. */
  compact?: boolean;
  className?: string;
}

/**
 * How partner money is split and who decides (D121). Shown wherever a split is set, proposed,
 * accepted or paid, so both businesses read the same rules — each in their own screen language.
 */
export function SplitExplainer({ leadName, partnerName, leadSharePct, exampleNgn = 100_000, viewer = 'neutral', compact, className }: SplitExplainerProps) {
  const { t: tr } = useT();
  const partnerPct = 100 - leadSharePct;
  const leadAmt = Math.round(exampleNgn * leadSharePct / 100);
  const partnerAmt = exampleNgn - leadAmt;
  const them = partnerName || tr('your partner');
  const you = ` (${tr('you')})`;
  const rules =
  <ul className="flex flex-col gap-2 text-caption text-fg-muted">
      <Rule title={tr('Who decides')}>{tr('{lead} proposed the starting split when inviting {partner}. It only applies once both accept. Either business can propose a new split later — the current one stays until the other accepts. KUBICU never changes it.', { lead: leadName, partner: them })}</Rule>
      <Rule title={tr('What it’s worked out on')}>{tr('What the customer actually pays for the things you sell together — after any discount, before delivery fees. Delivery money goes to whoever delivers.')}</Rule>
      <Rule title={tr('Fees')}>{tr('Each business pays its own KUBICU fee on its own share, at its own plan’s rate (guest partners: 2%). The payment provider’s fee is shared in the same proportion as the money.')}</Rule>
      <Rule title={tr('Refunds')}>{tr('A refund comes back from each share in the same proportion. A partial refund on one business’s item comes from that business only.')}</Rule>
      <Rule title={tr('Bundles')}>{tr('A bundle can use exact naira amounts per item instead of the percentage. Both businesses accept those amounts before the bundle can go live.')}</Rule>
    </ul>;


  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border border-line bg-sunken/60 p-4', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-label font-semibold text-fg">{tr('How the money is split')}</p>
        <span className="text-caption tabular-nums text-fg-subtle">
          {leadSharePct}% · {partnerPct}%
        </span>
      </div>

      <div className="flex h-2.5 overflow-hidden rounded-full" role="img" aria-label={`${leadName} ${leadSharePct}%, ${them} ${partnerPct}%`}>
        <span className="bg-action" style={{ width: `${leadSharePct}%` }} />
        <span className="bg-accent" style={{ width: `${partnerPct}%` }} />
      </div>
      <dl className="grid grid-cols-2 gap-3 text-caption">
        <div>
          <dt className="flex items-center gap-1.5 text-fg-subtle">
            <span className="h-2 w-2 rounded-full bg-action" aria-hidden />
            {leadName}
            {viewer === 'lead' ? you : ''}
          </dt>
          <dd className="mt-0.5 text-label font-semibold tabular-nums text-fg">{formatNgn(leadAmt)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-fg-subtle">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
            {them}
            {viewer === 'partner' ? you : ''}
          </dt>
          <dd className="mt-0.5 text-label font-semibold tabular-nums text-fg">{formatNgn(partnerAmt)}</dd>
        </div>
      </dl>
      <p className="text-caption text-fg-subtle">{tr('Example: a customer pays {amount} for something you sell together. Each share lands in that business’s wallet the moment it’s paid, before each pays its own fees.', { amount: formatNgn(exampleNgn) })}</p>

      {compact ?
      <details className="group border-t border-line pt-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-caption font-semibold text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            <InfoIcon size={13} aria-hidden /> {tr('Who decides, fees and refunds')}
          </summary>
          <div className="mt-3">{rules}</div>
        </details> :

      <div className="border-t border-line pt-3">{rules}</div>
      }
    </div>);

}

function Rule({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <li className="grid gap-0.5">
      <span className="font-semibold text-fg">{title}</span>
      <span>{children}</span>
    </li>);

}