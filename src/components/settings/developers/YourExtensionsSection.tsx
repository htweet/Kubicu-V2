import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useTeam } from '../../../contexts/TeamContext';
import type { ExtensionSubmission, SubmissionStatus } from '../../../types/extensionSubmission';
import { priceCapFor, subEvent, useSubmissions } from '../../../utils/extensionSubmissions';
import { usePlan } from '../../../contexts/PlanContext';
import { formatNaira as formatNgn, formatRelative } from '../../../utils/format';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { SubmitExtensionDialog } from './SubmitExtensionDialog';

const status: Record<SubmissionStatus, { label: string; tone: 'info' | 'warning' | 'success' | 'danger' | 'neutral' }> = {
  in_review: { label: 'In review', tone: 'info' },
  changes_requested: { label: 'Changes requested', tone: 'warning' },
  listed: { label: 'Listed', tone: 'success' },
  rejected: { label: 'Not approved', tone: 'danger' },
  unlisted: { label: 'Unlisted', tone: 'neutral' },
};

/** Settings → Developers → Your extensions: submit to the marketplace and follow the review (D132). */
export function YourExtensionsSection({ canManage }: { canManage: boolean }) {
  const { current } = useWorkspace();
  const team = useTeam();
  const plan = usePlan();
  const [store, update] = useSubmissions();
  const [dialog, setDialog] = useState<{ editing: ExtensionSubmission | null } | null>(null);
  const mine = store.submissions.filter((s) => s.workspaceId === current.id);

  const setListed = (s: ExtensionSubmission, listed: boolean) => {
    update((x) => ({ ...x, submissions: x.submissions.map((y) => (y.id === s.id ? { ...y, status: listed ? 'listed' : 'unlisted', history: [subEvent(listed ? 'Listed again' : 'Unlisted by developer', 'developer'), ...y.history] } : y)) }));
    team.log('settings', `${listed ? 'listed' : 'unlisted'} the extension “${s.name}”`, '/app/settings/developers');
    toast(listed ? `${s.name} is listed again` : `${s.name} is unlisted`, { description: listed ? undefined : 'Workspaces that installed it keep it. New installs stop.' });
  };

  return (
    <Card
      id="your-extensions"
      title="Your extensions"
      description={`Build something other sellers need and list it in Extensions. Every submission and update is reviewed by KUBICU first. You keep 80% of paid installs. On ${plan.name} you can charge up to ${formatNgn(priceCapFor(plan.id))} a month (example figures).`}
      body="flush"
      actions={canManage ? <Button size="sm" leadingIcon={PlusIcon} onClick={() => setDialog({ editing: null })}>Submit an extension</Button> : undefined}
    >
      {mine.length === 0 ? (
        <div className="px-5 py-6 md:px-6">
          <p className="text-label font-medium text-fg">Nothing submitted yet</p>
          <p className="mt-0.5 text-caption text-fg-muted">
            Build against a test key first, then submit with the permissions and events it needs. See the{' '}
            <Link to="/developers" target="_blank" className="font-medium text-action underline-offset-2 hover:underline">
              developer docs
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {mine.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 px-5 py-4 md:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-label font-semibold text-fg">{s.name}</span>
                    <Badge tone={status[s.status].tone}>{status[s.status].label}</Badge>
                    <span className="text-caption text-fg-subtle">v{s.version}</span>
                    {s.pending && <Badge tone="info">Update v{s.pending.version} in review</Badge>}
                    {s.priceNgn > priceCapFor(plan.id) && (
                      <span title={`It stays on sale at its current price. Your next update must be ${formatNgn(priceCapFor(plan.id))} a month or less, or move to a higher plan.`}>
                        <Badge tone="warning">Above your plan’s cap</Badge>
                      </span>
                    )}
                  </span>
                  <span className="block text-caption text-fg-subtle">
                    {s.priceNgn ? `${formatNgn(s.priceNgn)}/mo` : 'Free'} · {s.scopes.length} permission{s.scopes.length === 1 ? '' : 's'} · {s.history[0]?.label.toLowerCase()} {formatRelative(s.history[0]?.at ?? s.submittedAt)}
                  </span>
                </span>
                {canManage && (
                  <span className="flex shrink-0 flex-wrap gap-2">
                    {(s.status === 'changes_requested' || s.status === 'rejected') && (
                      <Button size="sm" onClick={() => setDialog({ editing: s })}>
                        Fix and resubmit
                      </Button>
                    )}
                    {s.status === 'listed' && (
                      <>
                        <Button size="sm" variant="secondary" disabled={!!s.pending} onClick={() => setDialog({ editing: s })}>
                          Release update
                        </Button>
                        <Button size="sm" variant="tertiary" onClick={() => setListed(s, false)}>
                          Unlist
                        </Button>
                      </>
                    )}
                    {s.status === 'unlisted' && (
                      <Button size="sm" variant="secondary" onClick={() => setListed(s, true)}>
                        List again
                      </Button>
                    )}
                  </span>
                )}
              </div>
              {s.reviewNote && (s.status === 'changes_requested' || s.status === 'rejected' || s.status === 'listed') && (
                <p className="rounded-md border border-line bg-sunken px-3 py-2 text-caption text-fg-muted">
                  <span className="font-semibold text-fg">KUBICU: </span>“{s.reviewNote}”
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <SubmitExtensionDialog open={!!dialog} editing={dialog?.editing ?? null} onClose={() => setDialog(null)} />
    </Card>
  );
}
