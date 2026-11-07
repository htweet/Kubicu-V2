import type { PageDocument } from '../../types/page';
import type { CommerceData } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';
import type { ValidationIssue } from '../validation';
import { planAtLeast } from '../../data/plans';
import { canSell, findProduct, isSoldOut, linkedGridProducts, priceRange } from './catalog';
import { boxShortfall } from './subscriptions';
import { eventPhase, eventSelling, findEvent, ticketTypeState } from './tickets';
import { COURSE_PLAN, findCourse } from './courses';
import { NO_WA_NUMBER, waNumber } from '../businessWhatsApp';

/** Plan that unlocks KUBICU checkout and digital delivery (hypothesis). */
export const CHECKOUT_PLAN: WorkspacePlan = 'pro';

/** Pre-publish checks for blocks that read from Commerce. */
export function catalogLinkIssues(doc: PageDocument, data: CommerceData | null, plan: WorkspacePlan): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (blockId: string, severity: ValidationIssue['severity'], message: string, field: string) =>
    issues.push({ id: `${blockId}:catalog:${field}`, blockId, severity, message, field, upgradeTo: /Pro plan/.test(message) ? CHECKOUT_PLAN : undefined,
      upgradeFeature: /^Checkout/.test(message) ? 'Checkout on your page' : 'Selling files with secure delivery',
    });
  const checkoutAllowed = planAtLeast(plan, CHECKOUT_PLAN);

  doc.blocks
    .filter((b) => !b.visibility.hidden)
    .forEach((b) => {
      if (b.type === 'product') {
        const c = b.content;
        if (c.ctaAction === 'checkout' && !checkoutAllowed) push(b.id, 'error', 'Checkout is on the Pro plan — switch to WhatsApp or upgrade', 'ctaAction');
        if (c.source !== 'catalog') return;
        const p = findProduct(data, c.productId);
        if (!p) return push(b.id, 'error', 'The linked product no longer exists — pick another or switch to manual', 'productId');
        if (p.status !== 'active') push(b.id, 'warning', `“${p.name}” is ${p.status} in Commerce, so this block is hidden from visitors`, 'productId');
        else if (isSoldOut(p)) push(b.id, 'warning', `“${p.name}” is sold out — visitors see a Sold out label`, 'productId');
        if (p.status === 'active' && !priceRange(p)) push(b.id, 'warning', `“${p.name}” has no price in Commerce`, 'productId');
        if (c.ctaAction === 'whatsapp' && !waNumber(c.whatsappPhone)) push(b.id, 'error', NO_WA_NUMBER, 'whatsappPhone');
      }
      if (b.type === 'productGrid') {
        const c = b.content;
        if (c.orderAction === 'checkout' && !checkoutAllowed) push(b.id, 'error', 'Checkout is on the Pro plan — switch to WhatsApp or upgrade', 'orderAction');
        if (c.source !== 'catalog') return;
        const shown = linkedGridProducts(c, data);
        const picked = c.collectionId ? null : c.productIds ?? [];
        if (c.collectionId && !data?.collections.some((col) => col.id === c.collectionId)) push(b.id, 'error', 'The linked collection no longer exists', 'source');
        else if (shown.length === 0) push(b.id, 'error', 'No active products to show — pick products or a collection', 'source');
        if (picked && picked.length > shown.length && shown.length > 0)
          push(b.id, 'warning', `${picked.length - shown.length} picked product${picked.length - shown.length === 1 ? ' is' : 's are'} archived, drafted or deleted and won’t show`, 'source');
      }
      if (b.type === 'menu') {
        const linked = b.content.categories.flatMap((cat) => cat.items).filter((i) => i.productId);
        const missing = linked.filter((i) => !findProduct(data, i.productId)).length;
        const hidden = linked.filter((i) => {
          const p = findProduct(data, i.productId);
          return p && p.status !== 'active';
        });
        if (missing) push(b.id, 'warning', `${missing} linked dish${missing === 1 ? '’s product was' : 'es’ products were'} deleted — showing the last typed details`, 'categories');
        if (hidden.length) push(b.id, 'warning', `${hidden.length} linked dish${hidden.length === 1 ? ' is' : 'es are'} drafted or archived in Commerce and hidden from the menu`, 'categories');
      }
      if (b.type === 'download') {
        const c = b.content;
        if (c.source !== 'catalog') return;
        if (!checkoutAllowed) push(b.id, 'error', 'Selling files with secure delivery is on the Pro plan', 'source');
        const p = findProduct(data, c.productId);
        if (!p || p.kind !== 'digital') return push(b.id, 'error', 'Pick a digital product from Commerce', 'productId');
        if (!canSell(p)) push(b.id, 'warning', `“${p.name}” isn’t ready to sell (needs to be active with a scanned file)`, 'productId');
      }
      if (b.type === 'event' && b.content.source === 'catalog') {
        // Ticketing (D73): free registration on every plan, paid tickets on Pro.
        const id = (f: string) => `${b.id}:event:${f}`;
        const ev = findEvent(data, b.content.eventId);
        if (!ev) {
          issues.push({ id: id('missing'), blockId: b.id, severity: 'error', message: b.content.eventId ? 'The linked event no longer exists — pick another or switch to manual' : 'Pick an event from Commerce', field: 'eventId' });
          return;
        }
        const now = Date.now();
        if (ev.status === 'cancelled') issues.push({ id: id('cancelled'), blockId: b.id, severity: 'error', message: `“${ev.name}” was cancelled — remove this block or pick another event`, field: 'eventId' });
        else if (eventPhase(ev, now) === 'past') issues.push({ id: id('past'), blockId: b.id, severity: 'warning', message: `“${ev.name}” has ended — visitors see an Event ended note`, field: 'eventId' });
        else if (ev.status === 'draft') issues.push({ id: id('draft'), blockId: b.id, severity: 'error', message: `“${ev.name}” is a draft — put it on sale in Commerce → Events first`, field: 'eventId' });
        else if (ev.status === 'paused') issues.push({ id: id('paused'), blockId: b.id, severity: 'warning', message: `Ticket sales for “${ev.name}” are paused`, field: 'eventId' });
        else if (!eventSelling(data, ev, now) && !ev.ticketTypes.some((t) => ticketTypeState(data, ev, t, now) === 'not_yet'))
          issues.push({ id: id('none'), blockId: b.id, severity: 'warning', message: `No ticket type for “${ev.name}” is on sale right now`, field: 'eventId' });
        if (!checkoutAllowed && ev.ticketTypes.some((t) => t.priceNgn > 0))
          issues.push({ id: id('plan'), blockId: b.id, severity: 'error', message: 'Paid tickets are on the Pro plan — make every ticket free or upgrade', field: 'eventId', upgradeTo: CHECKOUT_PLAN, upgradeFeature: 'Selling event tickets' });
      }
      if (b.type === 'subscription') {
        // Subscriptions (D69): Pro plan, live plans, and boxes that can be filled.
        const id = (f: string) => `${b.id}:subs:${f}`;
        if (!checkoutAllowed)
          issues.push({ id: id('plan'), blockId: b.id, severity: 'error', message: 'Subscriptions are on the Pro plan — remove this block or upgrade', field: 'planIds', upgradeTo: CHECKOUT_PLAN, upgradeFeature: 'Subscriptions and recurring payments' });
        const plans = b.content.planIds.map((pid) => data?.subPlans.find((p) => p.id === pid));
        const missing = plans.filter((p) => !p).length;
        if (missing) issues.push({ id: id('missing'), blockId: b.id, severity: 'error', message: `${missing} chosen plan${missing === 1 ? ' no longer exists' : 's no longer exist'} — pick again`, field: 'planIds' });
        plans.forEach((p) => {
          if (!p) return;
          if (p.status === 'archived') issues.push({ id: id(`arch-${p.id}`), blockId: b.id, severity: 'warning', message: `“${p.name}” is archived and won’t show`, field: 'planIds' });
          else if (data && boxShortfall(data, p).length) issues.push({ id: id(`stock-${p.id}`), blockId: b.id, severity: p.trialDays ? 'warning' : 'error', message: `“${p.name}” can’t fill a box right now: ${boxShortfall(data, p).join(', ')} out of stock`, field: 'planIds' });
        });
        if (plans.length > 0 && plans.every((p) => !p || p.status === 'archived')) issues.push({ id: id('none'), blockId: b.id, severity: 'error', message: 'None of the chosen plans can take sign-ups', field: 'planIds' });
      }
      if (b.type === 'course' && b.content.courseId) {
        // Courses (D197): Creator for free/members courses, Pro when they're sold at checkout.
        const id = (f: string) => `${b.id}:course:${f}`;
        const course = findCourse(data, b.content.courseId);
        if (!course) {
          issues.push({ id: id('missing'), blockId: b.id, severity: 'error', message: 'The linked course no longer exists — pick another', field: 'courseId' });
          return;
        }
        if (course.status !== 'published') issues.push({ id: id('draft'), blockId: b.id, severity: 'error', message: `“${course.title || 'This course'}” isn’t published — publish it in Commerce → Courses first`, field: 'courseId' });
        if (!planAtLeast(plan, COURSE_PLAN)) issues.push({ id: id('plan'), blockId: b.id, severity: 'error', message: 'Courses are on the Creator plan — remove this block or upgrade', field: 'courseId', upgradeTo: COURSE_PLAN, upgradeFeature: 'Courses' });
        else if (course.access === 'paid' && !checkoutAllowed) issues.push({ id: id('paid'), blockId: b.id, severity: 'error', message: 'Paid courses go through checkout, which is on the Pro plan — make it free or upgrade', field: 'courseId', upgradeTo: CHECKOUT_PLAN, upgradeFeature: 'Selling courses at checkout' });
      }
    });
  return issues;
}
