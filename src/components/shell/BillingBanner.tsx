import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangleIcon, ClockIcon } from 'lucide-react';
import { useBilling } from '../../contexts/BillingContext';
import { useTeam } from '../../contexts/TeamContext';
import { usePlan } from '../../contexts/PlanContext';
import { plans } from '../../data/plans';
import { TRIAL_REMINDER_DAYS } from '../../data/billing';
import { daysUntil, formatDate } from '../../utils/billing';
import { cn } from '../../utils/cn';

/** App-wide strip for a failed renewal (grace period) or a trial about to end (D65). */
export function BillingBanner() {
  const { data } = useBilling();
  const plan = usePlan();
  const can = useTeam().can('billing.manage').allowed;
  const onBilling = useLocation().pathname.startsWith('/app/settings/billing');
  if (onBilling) return null;

  let tone: 'danger' | 'info' | null = null;
  let text = '';
  if (data.status === 'past_due' && data.graceEndsAt) {
    const days = daysUntil(data.graceEndsAt);
    tone = 'danger';
    text = `Your ${plan.name} payment failed. ${days} day${days === 1 ? '' : 's'} left to update the card before the workspace moves to Free on ${formatDate(data.graceEndsAt)}.`;
  } else if (data.trial && daysUntil(data.trial.endsAt) <= TRIAL_REMINDER_DAYS) {
    tone = 'info';
    text = `Your ${plan.name} trial ends ${formatDate(data.trial.endsAt)}. Then you go back to ${plans[data.trial.previousPlan].name} — nothing is deleted.`;
  }
  if (!tone) return null;
  const Icon = tone === 'danger' ? AlertTriangleIcon : ClockIcon;

  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('border-b', tone === 'danger' ? 'border-danger/30 bg-danger-soft' : 'border-line bg-info-soft')}>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 py-2.5 sm:flex-row sm:items-center md:px-10">
        <p className={cn('flex flex-1 items-start gap-2 text-label', tone === 'danger' ? 'text-danger' : 'text-info')}>
          <Icon size={15} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            {text}
            {!can && ' Ask the Owner to sort it out.'}
          </span>
        </p>
        {can &&
        <Link
          to="/app/settings/billing"
          className="inline-flex h-9 shrink-0 items-center justify-center self-start rounded-md bg-action px-3 text-label font-medium text-action-fg hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:self-auto">
          
            {tone === 'danger' ? 'Update card' : 'Choose a plan'}
          </Link>
        }
      </div>
    </div>);

}