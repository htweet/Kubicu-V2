import type { PageDocument } from '../types/page';
import type { CommerceData } from '../types/commerce';
import type { WorkspacePlan } from '../types/plan';
import type { ValidationIssue } from './validation';
import { planAtLeast, plans } from '../data/plans';
import { coveredCount, memberAreas } from './members';
import { sitePages } from './sitePages';
import { CHECKOUT_PLAN } from './commerce/linkIssues';
import type { TrustLevel } from './trustPassport';

/** Pre-publish checks for members-only content (D110) and the Trust Passport badge (D111). */
export function memberIssues(doc: PageDocument, data: CommerceData | null, plan: WorkspacePlan, trust: { appOn: boolean; level: TrustLevel }): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const pages = [{ id: null as string | null, title: doc.homeLabel || 'Home', blocks: doc.blocks, rule: null }, ...sitePages(doc).map((p) => ({ id: p.id, title: p.title || 'Untitled', blocks: p.blocks, rule: p.membersOnly ?? null }))];
  const areas = memberAreas(pages);
  const livePlans = (data?.subPlans ?? []).filter((p) => p.status === 'active');

  if (areas.length > 0 && !planAtLeast(plan, CHECKOUT_PLAN))
    out.push({ id: 'members:plan', blockId: null, severity: 'error', message: `Members-only content is on the ${plans[CHECKOUT_PLAN].name} plan. Make it public or upgrade to publish.`, upgradeTo: CHECKOUT_PLAN, upgradeFeature: 'Members-only content' });
  if (areas.length > 0 && livePlans.length === 0)
    out.push({ id: 'members:noplans', blockId: null, severity: 'error', message: 'Members-only content needs a subscription plan people can join. Create one in Commerce → Subscriptions.' });

  areas.forEach((a, i) => {
    const where = a.kind === 'page' ? `The “${a.pageTitle}” page` : a.pageId ? `${a.pageTitle} · ${a.label}` : a.label;
    const key = `members:${a.blockId ?? `page-${a.pageId}`}`;
    if (a.rule.access !== 'plans') return;
    const chosen = a.rule.planIds.map((id) => data?.subPlans.find((p) => p.id === id));
    const missing = chosen.filter((p) => !p).length;
    if (a.kind === 'page' && a.rule.planIds.length === 0) out.push({ id: `${key}:none`, blockId: null, severity: 'error', message: `${where} is for chosen plans, but none are picked`, pageId: a.pageId });
    if (missing) out.push({ id: `${key}:missing:${i}`, blockId: a.blockId ?? null, severity: 'error', message: `${where}: ${missing} chosen plan${missing === 1 ? ' no longer exists' : 's no longer exist'} — pick again`, field: 'planIds', pageId: a.pageId });
    else if (chosen.length > 0 && chosen.every((p) => p?.status === 'archived'))
      out.push({ id: `${key}:archived`, blockId: a.blockId ?? null, severity: 'warning', message: `${where}: every chosen plan is archived, so nobody new can join`, field: 'planIds', pageId: a.pageId });
  });

  pages.forEach((p) => {
    p.blocks.forEach((b, i) => {
      if (b.type === 'membersOnly' && !b.visibility.hidden && coveredCount(p.blocks, i) === 0)
        out.push({ id: `members:empty:${b.id}`, blockId: b.id, severity: 'warning', message: 'Nothing is below this members-only section yet — add the blocks members should see under it', field: 'covers', pageId: p.id });
      if (b.type === 'trustBadge' && !b.visibility.hidden) {
        if (!trust.appOn) out.push({ id: `trust:off:${b.id}`, blockId: b.id, severity: 'warning', message: 'Trust Passport is off, so this badge is hidden. Install or resume it in Extensions.', pageId: p.id });
        else if (trust.level === 'starting') out.push({ id: `trust:starting:${b.id}`, blockId: b.id, severity: 'warning', message: 'Your badge will say “Just starting”. You may want to wait until verification and a few completed orders lift it.', pageId: p.id });
      }
    });
  });

  sitePages(doc).forEach((p) => {
    if (p.membersOnly && p.hideFromNav)
      out.push({ id: `members:hidden:${p.id}`, blockId: null, severity: 'warning', message: `The members-only “${p.title || 'Untitled'}” page isn’t in your site menu, so members can only reach it from its link`, pageId: p.id });
  });
  return out;
}
