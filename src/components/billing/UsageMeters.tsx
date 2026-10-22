import React from 'react';
import type { WorkspacePlan } from '../../types/plan';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { usePlan } from '../../contexts/PlanContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useMedia } from '../../contexts/MediaContext';
import { useAiUsage } from '../../hooks/useAiUsage';
import { planOrder } from '../../data/plans';
import { seatLimits } from '../../data/permissions';
import { mediaQuota } from '../../data/mediaQuota';
import { aiCredits } from '../../data/aiLimits';
import { countedProducts, productLimit } from '../../utils/commerce/limits';
import { activeExtraSpaces, extraSpaceLimits, MAIN_SPACE_ID, readSpacePage } from '../../utils/spaces';
import { pageCount, pageLimits } from '../../utils/sitePages';
import { formatBytes } from '../../utils/media/refs';
import { UpgradeButton } from '../ui/UpgradeButton';
import { cn } from '../../utils/cn';

interface Meter {
  id: string;
  label: string;
  used: number;
  limit: number | null;
  format?: (n: number) => string;
  feature: string;
  /** Lowest plan with a higher allowance. */
  next: WorkspacePlan | null;
}

function nextHigher(current: WorkspacePlan, table: Record<WorkspacePlan, number | null>): WorkspacePlan | null {
  const now = table[current];
  return planOrder.slice(planOrder.indexOf(current) + 1).find((p) => p !== 'enterprise' && (table[p] === null || now !== null && table[p] as number > now)) ?? null;
}

/** Every plan limit in one place. Amber at 80%, red at 100% (D65). */
export function UsageMeters() {
  const { current } = useWorkspace();
  const plan = usePlan();
  const commerce = useCommerce().data;
  const team = useTeam();
  const media = useMedia();
  const ai = useAiUsage();
  const main = readSpacePage(current.id, MAIN_SPACE_ID);
  const productTable = Object.fromEntries(planOrder.map((p) => [p, productLimit(p)])) as Record<WorkspacePlan, number | null>;

  const meters: Meter[] = [
  { id: 'products', label: 'Products', used: countedProducts(commerce), limit: productLimit(plan.id), feature: 'More products', next: nextHigher(plan.id, productTable) },
  { id: 'spaces', label: 'Campaigns & DealRooms', used: activeExtraSpaces(current).length, limit: extraSpaceLimits[plan.id], feature: 'More campaigns and DealRooms', next: nextHigher(plan.id, extraSpaceLimits) },
  { id: 'pages', label: 'Pages on your main site', used: main ? pageCount(main.draft) : 1, limit: pageLimits[plan.id], feature: 'More pages per site', next: nextHigher(plan.id, pageLimits) },
  { id: 'seats', label: 'Team seats', used: team.seatsUsed, limit: seatLimits[plan.id], feature: 'More team seats', next: nextHigher(plan.id, seatLimits) },
  { id: 'storage', label: 'Media storage', used: media.usedBytes, limit: mediaQuota[plan.id], format: formatBytes, feature: 'More media storage', next: nextHigher(plan.id, mediaQuota) },
  { id: 'ai', label: `AI credits (resets ${ai.resetsOn})`, used: ai.used, limit: aiCredits[plan.id], feature: 'More AI credits', next: nextHigher(plan.id, aiCredits) }];


  return (
    <ul className="flex flex-col gap-4">
      {meters.map((m) => {
        const fmt = m.format ?? ((n: number) => n.toLocaleString());
        const pct = m.limit ? Math.min(100, m.used / m.limit * 100) : 0;
        const tone = m.limit === null ? 'ok' : pct >= 100 ? 'full' : pct >= 80 ? 'near' : 'ok';
        return (
          <li key={m.id} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-label text-fg">{m.label}</span>
              <span className={cn('shrink-0 text-caption tabular-nums', tone === 'full' ? 'font-semibold text-danger' : tone === 'near' ? 'font-semibold text-warning' : 'text-fg-muted')}>
                {fmt(m.used)} {m.limit === null ? '· unlimited' : `of ${fmt(m.limit)}`}
              </span>
            </div>
            {m.limit !== null &&
            <div className="h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label={m.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
                <div className={cn('h-full rounded-full', tone === 'full' ? 'bg-danger' : tone === 'near' ? 'bg-warning' : 'bg-action')} style={{ width: `${Math.max(pct, m.used > 0 ? 2 : 0)}%` }} />
              </div>
            }
            {tone !== 'ok' && m.next && <UpgradeButton plan={m.next} feature={m.feature} variant="tertiary" className="self-start" />}
          </li>);

      })}
    </ul>);

}