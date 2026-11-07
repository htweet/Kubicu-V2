import type { AdminStore, ReportReason, StaffMember } from '../../types/admin';
import type { TemplateStore } from '../../types/templateListing';
import type { SubmissionStore } from '../../types/extensionSubmission';
import { roleCanOpen } from '../../data/staffRoles';
import { approvalArea, effectiveStatus } from './approvals';
import { activeIncidents, impactLabels } from './incidents';
import { REVIEW_HOURS } from '../money/kyc';
import type { KycQueueItem } from '../../hooks/useKycQueue';

/*
 * Staff notifications (D168): everything in the console that needs a person, derived from live
 * queues — never stored — so an item disappears the moment the work is done. Filtered to the areas
 * the signed-in role can open. Ids are stable per thing-and-state, so "read" sticks until it changes.
 */

export interface StaffNotif {
  id: string;
  /** Super-admin area id (matches the sidebar), used for filters, icons and role checks. */
  area: string;
  kind: 'action' | 'update';
  /** Comes through even when the area is muted. */
  urgent: boolean;
  text: string;
  detail?: string;
  href: string;
  at: string;
}

const HOUR = 3600000;
const DAY = 24 * HOUR;

const reasonLabels: Record<ReportReason, string> = {
  scam: 'scam',
  counterfeit: 'counterfeit goods',
  hate: 'hate or harassment',
  adult: 'adult content',
  impersonation: 'impersonation',
  copyright: 'copyright',
  fundraising: 'fundraising scam or misuse',
  other: 'other',
};

const flagLabels: Record<string, string> = { ai_page_setup: 'AI page setup', storefront: 'Storefront' };
const aiLabels: Record<string, string> = { block_suggest: 'AI block suggestions', print_writer: 'AI print writer', coach: 'AI business coach' };

const ago = (iso: string, now: number) => {
  const h = Math.floor((now - Date.parse(iso)) / HOUR);
  if (h < 1) return 'just now';
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
};

export function staffFeed(store: AdminStore, templates: TemplateStore, subs: SubmissionStore, me: StaffMember, now = Date.now(), kyc: KycQueueItem[] = []): StaffNotif[] {
  const out: StaffNotif[] = [];
  const iso = new Date(now).toISOString();
  const myName = me.name;

  // Identity & business verification (D244): every submission waiting for a decision; urgent past the review promise.
  kyc.forEach((k) => {
    const late = now - Date.parse(k.submittedAt) > REVIEW_HOURS * HOUR;
    out.push({
      id: `kyc:${k.workspaceId}:${k.submittedAt}`,
      area: 'payments',
      kind: 'action',
      urgent: late,
      text: `Verification to review: ${k.workspace}`,
      detail: `${k.entityLabel}${k.attempts > 1 ? ` · resubmitted (attempt ${k.attempts})` : ''} · submitted ${ago(k.submittedAt, now)}${late ? ` · past the ${REVIEW_HOURS}-hour promise` : ''}`,
      href: '/admin/payments?tab=identity',
      at: k.submittedAt,
    });
  });

  // Platform health
  activeIncidents(store.incidents).forEach((i) => {
    const last = i.updates[i.updates.length - 1]?.at ?? i.startedAt;
    out.push({ id: `inc:${i.id}:${i.status}`, area: 'health', kind: 'action', urgent: i.impact !== 'minor', text: `Incident: ${i.title}`, detail: `${impactLabels[i.impact]} · ${i.status} · started ${ago(i.startedAt, now)}`, href: '/admin/health', at: i.startedAt });
    if (now - Date.parse(last) > HOUR)
      out.push({ id: `inc-stale:${i.id}:${last}`, area: 'health', kind: 'action', urgent: true, text: `No public update on “${i.title}” for over an hour`, detail: 'Post an update to the status page, even if nothing has changed', href: '/admin/health', at: last });
  });

  // Second-person approvals
  store.approvals.forEach((a) => {
    const status = effectiveStatus(a, now);
    const area = approvalArea[a.kind] ?? 'staff';
    if (status === 'pending' && a.requestedById !== me.id) {
      const left = Date.parse(a.expiresAt) - now;
      out.push({ id: `appr:${a.id}`, area, kind: 'action', urgent: left < 4 * HOUR, text: `Waiting for your approval: ${a.summary}`, detail: `Asked by ${a.requestedBy} · expires ${left < HOUR ? 'within the hour' : `in ${Math.round(left / HOUR)} hours`}`, href: `/admin/${area}`, at: a.requestedAt });
    } else if (status === 'pending' && a.requestedById === me.id && Date.parse(a.expiresAt) - now < 4 * HOUR) {
      out.push({ id: `appr-mine:${a.id}`, area, kind: 'update', urgent: false, text: `Your request is about to expire: ${a.summary}`, detail: 'Ask another Platform lead to review it', href: `/admin/${area}`, at: a.requestedAt });
    } else if (a.requestedById === me.id && a.decidedAt && (status === 'approved' || status === 'rejected') && now - Date.parse(a.decidedAt) < 7 * DAY) {
      out.push({ id: `appr-done:${a.id}:${status}`, area, kind: 'update', urgent: false, text: `${a.decidedBy ?? 'A Platform lead'} ${status} your request: ${a.summary}`, detail: a.decisionNote ?? undefined, href: `/admin/${area}`, at: a.decidedAt });
    } else if (a.requestedById === me.id && status === 'expired' && now - Date.parse(a.expiresAt) < 3 * DAY) {
      out.push({ id: `appr-exp:${a.id}`, area, kind: 'update', urgent: false, text: `Your request expired without a decision: ${a.summary}`, href: `/admin/${area}`, at: a.expiresAt });
    }
  });

  // Moderation
  store.reports
    .filter((r) => r.status === 'open')
    .forEach((r) =>
      out.push({ id: `rep:${r.id}`, area: 'moderation', kind: 'action', urgent: r.reason === 'scam' || r.reason === 'fundraising', text: `Page report: kubicu.page/${r.handle}`, detail: `Reported for ${reasonLabels[r.reason]} · ${ago(r.createdAt, now)}`, href: '/admin/moderation', at: r.createdAt }),
    );

  // Fundraisers (D179): every new one gets a look in its first week; paused ones stay on the list.
  (store.fundraisers ?? [])
    .filter((f) => now - Date.parse(f.createdAt) < 7 * DAY && !store.pausedFundraisers?.[f.handle])
    .forEach((f) =>
      out.push({ id: `fund:${f.handle}`, area: 'pages', kind: 'action', urgent: false, text: `New fundraiser: ${f.name}`, detail: `${f.workspaceName} · kub.icu/${f.handle} · goal ₦${f.goalNgn.toLocaleString('en-NG')} · ${ago(f.createdAt, now)}`, href: '/admin/pages', at: f.createdAt }),
    );
  Object.entries(store.pausedFundraisers ?? {}).forEach(([handle, p]) =>
    out.push({ id: `fund-paused:${handle}:${p.at}`, area: 'pages', kind: 'update', urgent: false, text: `Fundraiser paused: kub.icu/${handle}`, detail: `By ${p.by} · ${p.reason}`, href: '/admin/pages', at: p.at }),
  );

  // Appeals
  store.appeals
    .filter((a) => a.status === 'open')
    .forEach((a) => {
      const mine = !!a.originalBy && a.originalBy.startsWith(myName);
      out.push({
        id: `apl:${a.id}`,
        area: 'appeals',
        kind: mine ? 'update' : 'action',
        urgent: false,
        text: `${a.workspaceName} appealed a ${a.kind}`,
        detail: mine ? 'You made the original decision, so someone else must decide this one' : `From ${a.from} · ${ago(a.createdAt, now)}`,
        href: '/admin/appeals',
        at: a.createdAt,
      });
    });

  // Support
  store.tickets.forEach((t) => {
    const last = t.messages[t.messages.length - 1];
    if (t.status === 'open') {
      const waiting = now - Date.parse(last?.at ?? t.createdAt);
      out.push({ id: `tkt:${t.id}:${last?.id ?? ''}`, area: 'support', kind: 'action', urgent: waiting > DAY, text: `Help request #${t.number}: ${t.subject}`, detail: `${t.workspaceName} · ${last?.by === 'customer' && t.messages.length > 1 ? 'customer replied' : 'needs a first reply'} ${ago(last?.at ?? t.createdAt, now)}`, href: '/admin/support', at: last?.at ?? t.createdAt });
    }
  });

  // Data requests (legal deadlines)
  store.dataRequests
    .filter((d) => d.status === 'new' || d.status === 'in_progress')
    .forEach((d) => {
      const left = Date.parse(d.dueAt) - now;
      if (left > 7 * DAY && d.status !== 'new') return;
      const kind = d.kind === 'export' ? 'copy of their data' : d.kind === 'delete' ? 'deletion' : 'correction';
      out.push({ id: `dr:${d.id}:${left < 0 ? 'late' : left < 7 * DAY ? 'soon' : 'new'}`, area: 'data-requests', kind: 'action', urgent: left < 0, text: left < 0 ? `Overdue: ${d.name} asked for a ${kind}` : `${d.name} asked for a ${kind}`, detail: left < 0 ? 'The legal deadline has passed — finish or refuse it with a reason today' : `Due in ${Math.max(1, Math.ceil(left / DAY))} days`, href: '/admin/data-requests', at: d.receivedAt });
    });

  // Marketplace reviews
  templates.listings
    .filter((l) => l.status === 'in_review' || (l.status === 'listed' && l.pendingDoc))
    .forEach((l) =>
      out.push({ id: `tpl:${l.id}:${l.pendingVersion ?? l.listedVersion}`, area: 'modules', kind: 'action', urgent: false, text: `Template to review: ${l.name}`, detail: `${l.status === 'listed' ? `Update to version ${l.pendingVersion}` : 'New listing'} by ${l.creatorName} · ${ago(l.submittedAt, now)}`, href: '/admin/modules', at: l.submittedAt }),
    );
  subs.submissions
    .filter((s) => s.status === 'in_review' || (s.status === 'listed' && s.pending))
    .forEach((s) =>
      out.push({ id: `ext:${s.id}:${s.pending?.version ?? s.version}`, area: 'modules', kind: 'action', urgent: false, text: `Extension to review: ${s.name}`, detail: `${s.status === 'listed' ? `Update to ${s.pending?.version}` : 'New submission'} by ${s.developerName} · checks permissions it asks for`, href: '/admin/modules', at: s.submittedAt }),
    );

  // Staff & access
  const lastReview = store.accessReviews.filter((r) => r.completedAt).map((r) => Date.parse(r.completedAt as string)).sort((a, b) => b - a)[0];
  const openReview = store.accessReviews.find((r) => !r.completedAt);
  if (openReview) out.push({ id: `acr-open:${openReview.id}`, area: 'staff', kind: 'action', urgent: false, text: 'Access review in progress', detail: `Started by ${openReview.startedBy} · finish deciding keep or change for each person`, href: '/admin/staff', at: openReview.startedAt });
  else if (!lastReview || now - lastReview > 90 * DAY)
    out.push({ id: `acr-due:${lastReview ?? 'never'}`, area: 'staff', kind: 'action', urgent: false, text: 'Quarterly access review is due', detail: lastReview ? `Last completed ${ago(new Date(lastReview).toISOString(), now)}` : 'No access review has been completed yet', href: '/admin/staff', at: iso });
  store.staff
    .filter((s) => s.status === 'invited' && now - Date.parse(s.invitedAt) > 7 * DAY)
    .forEach((s) => out.push({ id: `inv:${s.id}`, area: 'staff', kind: 'update', urgent: false, text: `${s.name} hasn’t accepted their staff invite`, detail: `Invited ${ago(s.invitedAt, now)} · resend or cancel it`, href: '/admin/staff', at: s.invitedAt }));
  store.audit
    .filter((e) => (e.area === 'staff' || e.area === 'access') && !e.actor.startsWith(myName) && now - Date.parse(e.at) < 3 * DAY && e.action !== 'Signed in' && e.action !== 'Signed out')
    .slice(0, 5)
    .forEach((e) => out.push({ id: `aud:${e.id}`, area: 'staff', kind: 'update', urgent: false, text: `${e.actor.split(' ·')[0]}: ${e.action}`, detail: e.target, href: '/admin/audit', at: e.at }));

  // Outside services
  Object.entries(store.integrationTests).forEach(([service, t]) => {
    if (!t.ok) out.push({ id: `int:${service}:${t.at}`, area: 'notifications', kind: 'action', urgent: false, text: `Last test of ${service} failed`, detail: t.message, href: '/admin/notifications', at: t.at });
  });

  // Plans & coupons
  store.coupons
    .filter((c) => c.active)
    .forEach((c) => {
      if (c.maxUses && c.uses >= Math.ceil(c.maxUses * 0.9)) out.push({ id: `cpn-use:${c.id}:${c.uses}`, area: 'plans', kind: 'update', urgent: false, text: `Coupon ${c.code} is ${c.uses >= c.maxUses ? 'used up' : 'nearly used up'}`, detail: `${c.uses} of ${c.maxUses} uses`, href: '/admin/plans', at: iso });
      if (c.expiresAt && Date.parse(c.expiresAt) > now && Date.parse(c.expiresAt) - now < 7 * DAY) out.push({ id: `cpn-exp:${c.id}`, area: 'plans', kind: 'update', urgent: false, text: `Coupon ${c.code} expires soon`, detail: `In ${Math.ceil((Date.parse(c.expiresAt) - now) / DAY)} days`, href: '/admin/plans', at: iso });
    });

  // Kill switches that are on
  Object.entries(store.aiOff).forEach(([id, v]) => {
    if (v) out.push({ id: `ai-off:${id}:${v.at}`, area: 'ai', kind: 'update', urgent: false, text: `${aiLabels[id] ?? id} is switched off for everyone`, detail: `By ${v.by.split(' ·')[0]} · ${v.reason}`, href: '/admin/ai', at: v.at });
  });
  Object.entries(store.flags).forEach(([id, f]) => {
    if (!f.on) out.push({ id: `flag-off:${id}:${f.updatedAt}`, area: 'flags', kind: 'update', urgent: false, text: `${flagLabels[id] ?? id} is turned off for every workspace`, detail: 'Kill switch on', href: '/admin/flags', at: f.updatedAt });
  });

  // Tenants
  Object.entries(store.suspended).forEach(([ws, s]) => {
    if (now - Date.parse(s.at) < 7 * DAY) out.push({ id: `sus:${ws}:${s.at}`, area: 'tenants', kind: 'update', urgent: false, text: 'A workspace was suspended', detail: s.reason, href: '/admin/tenants', at: s.at });
  });

  return out
    .filter((n) => roleCanOpen(me.role, n.area))
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || Date.parse(b.at) - Date.parse(a.at));
}
