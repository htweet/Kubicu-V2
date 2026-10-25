import React from 'react';
import { BadgeCheckIcon, ClockIcon, RotateCcwIcon, XCircleIcon } from 'lucide-react';
import type { KycCase } from '../../types/kyc';
import { entityInfo, REVIEW_HOURS } from '../../utils/money/kyc';
import { tierInfo } from '../../utils/money/store';
import { formatNgn, formatRelative, formatTimestamp } from '../../utils/format';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface KycStatusPanelProps {
  k: KycCase;
  canEdit: boolean;
  onRestart: () => void;
}

/** What the owner sees once verification is sent: in review, verified, or not approved. */
export function KycStatusPanel({ k, canEdit, onRestart }: KycStatusPanelProps) {
  const tier = k.entity ? tierInfo[entityInfo[k.entity].tier] : tierInfo[0];
  const due = k.submittedAt ? new Date(Date.parse(k.submittedAt) + REVIEW_HOURS * 3_600_000).toISOString() : null;

  const head =
  k.status === 'approved' ?
  { icon: BadgeCheckIcon, tone: 'bg-success-soft text-success', title: `Verified · ${tier.label}`, body: `Payouts are on. You can pay out up to ${formatNgn(tier.dailyPayoutNgn)} a day${tier.balanceCapNgn ? ` and hold up to ${formatNgn(tier.balanceCapNgn)}` : ' with no balance limit'}.` } :
  k.status === 'rejected' ?
  { icon: XCircleIcon, tone: 'bg-danger-soft text-danger', title: 'Verification wasn’t approved', body: 'Sales still arrive in your wallet, but payouts stay off until you’re verified.' } :
  { icon: ClockIcon, tone: 'bg-info-soft text-info', title: 'With KUBICU for review', body: `Sent ${k.submittedAt ? formatRelative(k.submittedAt) : ''}. Most reviews finish within one business day${due ? ` — by ${formatTimestamp(due)}` : ''}. We’ll notify you either way.` };

  return (
    <section aria-labelledby="kyc-status-title" className="rounded-lg border border-line bg-raised shadow-1">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:p-6">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full', head.tone)}>
          <head.icon size={22} strokeWidth={2.25} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="kyc-status-title" className="text-heading font-semibold text-fg">
            {head.title}
          </h2>
          <p className="mt-1 text-label text-fg-muted">{head.body}</p>
          {k.note &&
          <blockquote className="mt-3 border-l-2 border-line-strong pl-3 text-label text-fg">
              “{k.note}”
              <footer className="mt-1 text-caption text-fg-subtle">— KUBICU review{k.decidedAt ? `, ${formatRelative(k.decidedAt)}` : ''}</footer>
            </blockquote>
          }
          {k.status === 'rejected' && canEdit &&
          <Button className="mt-4" variant="secondary" leadingIcon={RotateCcwIcon} onClick={onRestart}>
              Fix and send again
            </Button>
          }
          {k.status === 'approved' && <p className="mt-3 text-caption text-fg-subtle">To change your verified details (for example a new director or bank name), contact support from Help. Changes are checked again before they apply.</p>}
          {k.status === 'in_review' && <p className="mt-3 text-caption text-fg-subtle">Prototype: approve or ask for changes in Super admin → Payments &amp; providers → Verification.</p>}
        </div>
      </div>

      {k.history.length > 0 &&
      <div className="border-t border-line px-5 py-5 md:px-6">
          <h3 className="text-label font-semibold text-fg">History</h3>
          <ol className="mt-3 flex flex-col divide-y divide-line">
            {k.history.slice(0, 8).map((e, i) =>
          <li key={`${e.at}-${i}`} className="flex items-baseline justify-between gap-3 py-2.5 text-caption first:pt-0 last:pb-0">
                <span className="text-label text-fg">{e.label}</span>
                <span className="shrink-0 tabular-nums text-fg-subtle">{formatTimestamp(e.at)}</span>
              </li>
          )}
          </ol>
        </div>
      }
    </section>);

}