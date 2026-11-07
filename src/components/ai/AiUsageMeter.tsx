import React from 'react';
import { planOrder } from '../../data/plans';
import { useAiUsage } from '../../hooks/useAiUsage';
import { UpgradeButton } from '../ui/UpgradeButton';
import { cn } from '../../utils/cn';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { AiCreditMeterAccount } from '../accountMode/AiCreditsAccount';

/** Credits meter. Account mode adds "On hold" from the server figures (D540); browser mode is unchanged. */
export function AiUsageMeter({ cost, className }: { cost?: number; className?: string }) {
  const account = useAccountMode();
  return account.active ? <AiCreditMeterAccount cost={cost} className={className} /> : <AiUsageMeterBrowser cost={cost} className={className} />;
}

/** Credits used this month, with the way out when they run out. */
function AiUsageMeterBrowser({ cost, className }: { cost?: number; className?: string }) {
  const u = useAiUsage();
  const pct = Math.min(100, Math.round((u.used / Math.max(1, u.limit)) * 100));
  const next = planOrder[planOrder.indexOf(u.planId) + 1];
  const out = cost !== undefined && !u.canSpend(cost);
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2 text-caption">
        <span className="text-fg-muted">
          {u.remaining} of {u.limit} AI credits left{cost ? ` · this uses ${cost}` : ''}
        </span>
        <span className="text-fg-subtle">Resets {u.resetsOn}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-sunken" role="meter" aria-label="AI credits used" aria-valuemin={0} aria-valuemax={u.limit} aria-valuenow={u.used}>
        <div className={cn('h-full rounded-full', pct >= 90 ? 'bg-warning' : 'ai-fill')} style={{ width: `${pct}%` }} />
      </div>
      {out && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-caption text-fg">Not enough credits left this month. Everything already on your page stays as it is.</p>
          {next && <UpgradeButton plan={next} feature="More AI credits" />}
        </div>
      )}
    </div>
  );
}
