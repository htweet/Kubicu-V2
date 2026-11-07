import type { AdminStore, Appeal, AppealKind } from '../../types/admin';
import { uid } from '../id';

/** Who made the decision being appealed — the most recent matching audit entry. */
export function originalDecider(s: AdminStore, kind: AppealKind, target: string): string | null {
  const hit = s.audit.find((a) => (kind === 'takedown' ? /^took .*down/i.test(a.action) && a.target.includes(target) : /^suspended/i.test(a.action) && a.target.includes(target)));
  return hit?.actor ?? null;
}

interface NewAppeal {
  kind: AppealKind;
  handle: string | null;
  workspaceId: string;
  workspaceName: string;
  from: string;
  originalReason: string;
  statement: string;
}

/** Files an owner's appeal. One open appeal per decision. */
export function fileAppeal(s: AdminStore, a: NewAppeal): AdminStore {
  const target = a.kind === 'takedown' ? `kub.icu/${a.handle}` : a.workspaceName;
  const appeal: Appeal = {
    id: uid('apl'),
    ...a,
    originalBy: originalDecider(s, a.kind, target),
    createdAt: new Date().toISOString(),
    status: 'open',
    decision: null,
    decidedBy: null,
    decidedAt: null,
  };
  return { ...s, appeals: [appeal, ...s.appeals] };
}

/** The latest appeal about one decision (a takedown by handle, or a workspace suspension). */
export function appealFor(s: AdminStore, kind: AppealKind, key: string): Appeal | undefined {
  return s.appeals.find((a) => a.kind === kind && (kind === 'takedown' ? a.handle === key : a.workspaceId === key));
}
