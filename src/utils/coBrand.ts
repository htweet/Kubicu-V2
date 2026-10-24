import type { Block, BlockOwner, CoBrandSettings, PageDocument } from '../types/page';
import type { AgreementSide, Partnership } from '../types/partnership';
import type { WorkspacePlan } from '../types/plan';
import type { ValidationIssue } from './validation';
import { allBlocks } from './sitePages';
import { changedBlocks, type BlockChange } from './reviews';
import { guestReady, PARTNERSHIP_PLAN } from './partnerships';
import { planAtLeast, plans } from '../data/plans';

/**
 * Co-branded spaces (D121): a campaign space two businesses run together. The business that
 * sets it up (the lead) owns the space and publishes it; the partner signs off on what concerns them.
 */
export const COBRAND_PLAN = PARTNERSHIP_PLAN;

export const ownerOf = (b: Block): BlockOwner => b.owner ?? 'lead';

export const modeLabels = {
  sections: { label: 'Own sections', detail: 'Each block is Yours, Theirs or Shared. Each business edits its own; shared blocks either can edit.' },
  open: { label: 'Open editing', detail: 'Both can change anything. Every change since it went live is listed, and either of you can undo it.' }
} as const;

/** "Yours", "Theirs" (by name) or "Shared", from the viewer's side. */
export function ownerLabel(owner: BlockOwner, viewer: AgreementSide, cb: Pick<CoBrandSettings, 'leadName' | 'partnerName'>): string {
  if (owner === 'shared') return 'Shared';
  if (owner === viewer) return 'Yours';
  return owner === 'lead' ? cb.leadName : cb.partnerName;
}

export function canEditBlock(cb: CoBrandSettings | null | undefined, b: Block, actor: AgreementSide): boolean {
  if (!cb || cb.mode === 'open') return true;
  const o = ownerOf(b);
  return o === 'shared' || o === actor;
}

/**
 * (D123) Which item(s) a single drag moved: ids that, taken out of both orders, leave them identical.
 * An adjacent swap returns both, since either could have been the one dragged.
 */
export function movedIds(prev: string[], next: string[]): string[] {
  if (prev.join('|') === next.join('|')) return [];
  return next.filter((id) => {
    if (prev.indexOf(id) === next.indexOf(id)) return false;
    const a = prev.filter((x) => x !== id);
    const b = next.filter((x) => x !== id);
    return a.join('|') === b.join('|');
  });
}

/** Only the current owner (either business for shared blocks) can hand a block over. */
export const canReassign = (cb: CoBrandSettings | null | undefined, b: Block, actor: AgreementSide) => !!cb && canEditBlock({ ...cb, mode: 'sections' }, b, actor);

export function mapBlocks(doc: PageDocument, fn: (b: Block) => Block): PageDocument {
  return { ...doc, blocks: doc.blocks.map(fn), pages: doc.pages?.map((p) => ({ ...p, blocks: p.blocks.map(fn) })) };
}

export const setOwner = (doc: PageDocument, id: string, owner: BlockOwner) => mapBlocks(doc, (b) => b.id === id ? { ...b, owner } as Block : b);

/** Removes co-branding: the space goes back to being the lead's own campaign. */
export const clearCoBrand = (doc: PageDocument): PageDocument => mapBlocks({ ...doc, coBrand: null }, (b) => {
  const { owner: _o, ...rest } = b;
  return rest as Block;
});

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i) | 0;
  return (h >>> 0).toString(36);
}

const visible = (b: Block) => {
  const { createdAt: _c, updatedAt: _u, locked: _l, groupId: _g, ...rest } = b;
  return rest;
};

/**
 * What the partner must sign off on. First publish and open editing: the whole page.
 * After that, in own-sections mode: shared blocks, their blocks, and the look and link both share.
 */
export const approvalScope = (cb: CoBrandSettings, hasLive: boolean): 'all' | 'partner' => !hasLive || cb.mode === 'open' ? 'all' : 'partner';

export function fingerprint(doc: PageDocument, scope: 'all' | 'partner'): string {
  const blocks = allBlocks(doc);
  const inScope = scope === 'all' ? blocks : blocks.filter((b) => ownerOf(b) !== 'lead');
  return hash(JSON.stringify({ s: scope, t: doc.title, h: doc.handle, th: doc.theme, seo: doc.seo, b: inScope.map(visible), o: scope === 'all' ? blocks.map((b) => b.id) : null }));
}

export function needsPartnerApproval(doc: PageDocument, hasLive: boolean): boolean {
  const cb = doc.coBrand;
  if (!cb || !cb.partnerApproval) return !!cb;
  return approvalScope(cb, hasLive) === 'all' ? cb.partnerApproval.sig !== fingerprint(doc, 'all') : cb.partnerApproval.partnerSig !== fingerprint(doc, 'partner');
}

/** Records the partner's sign-off on this exact version (both fingerprints, so it survives the first publish). */
export const approve = (doc: PageDocument): PageDocument =>
doc.coBrand ? { ...doc, coBrand: { ...doc.coBrand, partnerApproval: { sig: fingerprint(doc, 'all'), partnerSig: fingerprint(doc, 'partner'), at: new Date().toISOString() } } } : doc;

export interface OwnedChange extends BlockChange {
  owner: BlockOwner;
}

/** Changes since the page went live, each with who looks after the block. */
export function changesSinceLive(live: PageDocument | null, draft: PageDocument): OwnedChange[] {
  const byId = new Map([...(live ? allBlocks(live) : []), ...allBlocks(draft)].map((b) => [b.id, b]));
  return changedBlocks(live, draft).map((c) => ({ ...c, owner: byId.get(c.id) ? ownerOf(byId.get(c.id)!) : 'lead' }));
}

/** Puts one block back the way it is on the live page (home page of a one-page campaign space). */
export function revertBlock(draft: PageDocument, live: PageDocument, id: string): PageDocument {
  const liveIdx = live.blocks.findIndex((b) => b.id === id);
  const draftIdx = draft.blocks.findIndex((b) => b.id === id);
  if (liveIdx < 0) return { ...draft, blocks: draft.blocks.filter((b) => b.id !== id) };
  const restored = live.blocks[liveIdx];
  if (draftIdx >= 0) return { ...draft, blocks: draft.blocks.map((b) => b.id === id ? restored : b) };
  const blocks = [...draft.blocks];
  blocks.splice(Math.min(liveIdx, blocks.length), 0, restored);
  return { ...draft, blocks };
}

/** Publish checks for a co-branded space. */
export function coBrandIssues(doc: PageDocument, ctx: {hasLive: boolean;partnership: Partnership | undefined;plan: WorkspacePlan;}): ValidationIssue[] {
  const cb = doc.coBrand;
  if (!cb) return [];
  const out: ValidationIssue[] = [];
  const p = ctx.partnership;
  if (!planAtLeast(ctx.plan, COBRAND_PLAN))
  out.push({ id: 'cobrand:plan', blockId: null, severity: 'error', message: `Co-branded spaces are on the ${plans[COBRAND_PLAN].name} plan for the business that sets them up.`, upgradeTo: COBRAND_PLAN, upgradeFeature: 'Co-branded spaces' });
  if (!p) {
    out.push({ id: 'cobrand:missing', blockId: null, severity: 'error', message: `We can’t find your partnership with ${cb.partnerName}. Stop co-branding in Page settings, or start a new partnership.` });
    return out;
  }
  if (p.status !== 'active' && p.status !== 'ending') {
    out.push({ id: 'cobrand:inactive', blockId: null, severity: 'error', message: `Your partnership with ${cb.partnerName} has ${p.status === 'ended' ? 'ended' : 'not started'}, so this shared page can’t go live.`, guidance: 'Stop co-branding in Page settings to publish it as your own page.' });
    return out;
  }
  if (needsPartnerApproval(doc, ctx.hasLive))
  out.push({
    id: 'cobrand:approval',
    blockId: null,
    severity: 'error',
    message: ctx.hasLive ? `${cb.partnerName} needs to approve these changes before they go live.` : `${cb.partnerName} needs to approve the page before it first goes live.`,
    guidance: ctx.hasLive && cb.mode === 'sections' ? 'Only changes to shared blocks, their blocks, the look or the link need their approval. Changes to just your own blocks don’t.' : 'Open the partner panel from the top bar to see what changed and ask them to approve.'
  });
  if (p.kind === 'guest' && !guestReady(p)) out.push({ id: 'cobrand:guest-pay', blockId: null, severity: 'warning', message: `${cb.partnerName} hasn’t added a bank account yet, so they can’t be paid for anything sold together.` });
  return out;
}