import type { WorkspacePlan } from '../types/plan';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { usePlan } from '../contexts/PlanContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useTeam } from '../contexts/TeamContext';
import { useMedia } from '../contexts/MediaContext';
import { useDomains } from '../contexts/DomainsContext';
import { planAtLeast, plans } from '../data/plans';
import { seatLimits } from '../data/permissions';
import { mediaQuota } from '../data/mediaQuota';
import { aiCredits } from '../data/aiLimits';
import { countedProducts, productLimit } from '../utils/commerce/limits';
import { activeExtraSpaces, extraSpaceLimits } from '../utils/spaces';
import { pageLimits } from '../utils/sitePages';
import { formatBytes } from '../utils/media/refs';

export interface ImpactItem {
  id: string;
  label: string;
  detail: string;
  /** Something stops working, vs. only a lower allowance. */
  severity: 'stops' | 'limit';
}

/** Exactly what goes over the limits on a lower plan (D65). Nothing is ever deleted. */
export function useDowngradeImpact(target: WorkspacePlan): ImpactItem[] {
  const { current } = useWorkspace();
  const plan = usePlan();
  const commerce = useCommerce().data;
  const team = useTeam();
  const media = useMedia();
  const domains = useDomains().data;
  const from = plan.id;
  const items: ImpactItem[] = [];
  if (planAtLeast(target, from)) return items;

  const pl = productLimit(target);
  const products = countedProducts(commerce);
  if (pl !== null && products > pl) items.push({ id: 'products', severity: 'limit', label: `${products - pl} product${products - pl === 1 ? '' : 's'} over the limit`, detail: `${plans[target].name} allows ${pl}. Extra products stay but can’t be sold until you remove some or upgrade.` });

  const extras = activeExtraSpaces(current).length;
  const sl = extraSpaceLimits[target];
  if (extras > sl) items.push({ id: 'spaces', severity: 'limit', label: `${extras - sl} campaign${extras - sl === 1 ? '' : 's'} or DealRoom${extras - sl === 1 ? '' : 's'} over the limit`, detail: sl === 0 ? 'They stay in My Spaces but can’t be published.' : `${plans[target].name} allows ${sl}. The rest can’t be published.` });

  const seats = seatLimits[target];
  if (team.seatsUsed > seats) items.push({ id: 'seats', severity: 'limit', label: `${team.seatsUsed - seats} member${team.seatsUsed - seats === 1 ? '' : 's'} become${team.seatsUsed - seats === 1 ? 's' : ''} Viewer${team.seatsUsed - seats === 1 ? '' : 's'}`, detail: `${plans[target].name} has ${seats} seat${seats === 1 ? '' : 's'}. Nobody is removed; their roles come back if you upgrade.` });

  if (media.usedBytes > mediaQuota[target]) items.push({ id: 'storage', severity: 'limit', label: 'Media storage is over the allowance', detail: `${formatBytes(media.usedBytes)} used of ${formatBytes(mediaQuota[target])}. Your images stay; new uploads pause until there’s room.` });

  if (pageLimits[target] < pageLimits[from]) items.push({ id: 'pages', severity: 'limit', label: `Up to ${pageLimits[target]} page${pageLimits[target] === 1 ? '' : 's'} per site`, detail: 'Existing pages stay. Sites with more can’t be published until you remove some.' });

  if (aiCredits[target] < aiCredits[from]) items.push({ id: 'ai', severity: 'limit', label: `${aiCredits[target]} AI credits a month`, detail: `Down from ${aiCredits[from]}.` });

  if (planAtLeast(from, 'pro') && !planAtLeast(target, 'pro'))
  items.push({ id: 'checkout', severity: 'stops', label: 'Checkout turns off', detail: 'Card checkout, digital file sales, built-in bookings, discounts and DealRooms stop on your pages. WhatsApp ordering keeps working.' });

  const liveDomains = domains.domains.filter((d) => d.status === 'live').length;
  if (liveDomains > 0 && !planAtLeast(target, 'creator')) items.push({ id: 'domains', severity: 'stops', label: `${liveDomains} custom domain${liveDomains === 1 ? '' : 's'} stop${liveDomains === 1 ? 's' : ''} showing your page`, detail: 'Your kub.icu link keeps working. Reconnect by upgrading.' });

  if (plan.canHideBadge && !plans[target].canHideBadge) items.push({ id: 'badge', severity: 'stops', label: '“Made with KUBICU” comes back', detail: 'The footer reappears on your public pages.' });

  return items;
}