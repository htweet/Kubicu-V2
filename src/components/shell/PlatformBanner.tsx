import React, { useMemo, useState } from 'react';
import { BanIcon, MegaphoneIcon, XIcon } from 'lucide-react';
import type { Appeal, AppealKind } from '../../types/admin';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { usePlan } from '../../contexts/PlanContext';
import { useAdminStore } from '../../utils/admin/store';
import { appealFor } from '../../utils/admin/appeals';
import { useAccount } from '../../utils/account/store';
import { workspaceSpaces } from '../../utils/spaces';
import { spaceHandle } from '../../utils/domains/links';
import { AppealDialog } from './AppealDialog';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

const DISMISS_KEY = 'kubicu.announcements.dismissed';

function readDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

/** Messages from KUBICU across the top of the app: a suspension notice, or an announcement (D75b). */
export function PlatformBanner() {
  const [store] = useAdminStore();
  const { current } = useWorkspace();
  const plan = usePlan();
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);
  const account = useAccount();
  const [appealing, setAppealing] = useState(false);
  const suspension = store.suspended[current.id];
  const announcement = store.announcements.find((a) => a.active && (a.audience === 'all' || a.audience === plan.id) && !dismissed.includes(a.id));

  // Any of this workspace's links that staff took down.
  const takedown = useMemo(() => {
    const handles = workspaceSpaces(current)
      .filter((s) => !s.archivedAt)
      .map((s) => spaceHandle(current.id, s.id))
      .filter((h): h is string => !!h);
    return store.takedowns.find((t) => handles.includes(t.handle)) ?? null;
  }, [current, store.takedowns]);

  const notice: { kind: AppealKind; key: string; handle: string | null; reason: string; title: string } | null = suspension
    ? { kind: 'suspension', key: current.id, handle: null, reason: suspension.reason, title: 'Your public pages are paused by KUBICU.' }
    : takedown
      ? { kind: 'takedown', key: takedown.handle, handle: takedown.handle, reason: takedown.reason, title: `kub.icu/${takedown.handle} was taken down by KUBICU.` }
      : null;

  if (notice) {
    const appeal = appealFor(store, notice.kind, notice.key);
    // An appeal decided before this decision was made doesn't count; a new one can be sent.
    const current_appeal: Appeal | undefined = appeal && (appeal.status === 'open' || (appeal.decidedAt && Date.parse(appeal.decidedAt) >= Date.parse(suspension?.at ?? takedown?.at ?? '0'))) ? appeal : undefined;
    return (
      <div role="alert" className="flex flex-col gap-3 border-b border-line bg-danger-soft px-5 py-3 sm:flex-row sm:items-start md:px-8">
        <BanIcon size={18} className="mt-0.5 shrink-0 text-danger max-sm:hidden" aria-hidden />
        <div className="min-w-0 flex-1 text-label text-fg">
          <p>
            <span className="font-semibold">{notice.title}</span> {notice.reason} Nothing has been deleted.
          </p>
          {current_appeal?.status === 'open' && <p className="mt-1 text-fg-muted">Appeal sent {new Date(current_appeal.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} — a different staff member is reviewing it.</p>}
          {current_appeal?.status === 'upheld' && (
            <p className="mt-1 text-fg-muted">
              <span className="font-semibold text-fg">Appeal reviewed — decision kept.</span> “{current_appeal.decision}” Contact support from Help if something has changed.
            </p>
          )}
        </div>
        {!current_appeal && (
          <Button size="sm" variant="secondary" className="shrink-0 self-start" onClick={() => setAppealing(true)}>
            Appeal this decision
          </Button>
        )}
        <AppealDialog
          open={appealing}
          onClose={() => setAppealing(false)}
          kind={notice.kind}
          handle={notice.handle}
          workspaceId={current.id}
          workspaceName={current.name}
          from={account.profile.name}
          originalReason={notice.reason}
        />
      </div>
    );
  }
  if (!announcement) return null;

  const dismiss = () => {
    const next = [...dismissed, announcement.id];
    setDismissed(next);
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked — dismissed for this visit only */
    }
  };

  return (
    <div role="status" className={cn('flex items-start gap-3 border-b border-line px-5 py-3 md:px-8', announcement.tone === 'warning' ? 'bg-warning-soft' : 'bg-action-soft')}>
      <MegaphoneIcon size={18} className={cn('mt-0.5 shrink-0', announcement.tone === 'warning' ? 'text-warning' : 'text-action')} aria-hidden />
      <p className="min-w-0 flex-1 text-label text-fg">
        <span className="font-semibold">{announcement.title}.</span> {announcement.body}
      </p>
      <button type="button" onClick={dismiss} aria-label="Dismiss announcement" className="shrink-0 rounded p-1 text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <XIcon size={16} aria-hidden />
      </button>
    </div>
  );
}
