import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudIcon } from 'lucide-react';
import { useImports } from '../../contexts/ImportsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { DEMO_WORKSPACE_ID } from '../../utils/workspaceStorage';
import { describeError, ApiError } from '../../utils/auth/session';
import { restoreSealedCopy } from '../../utils/legacyBundle';
import { formatDate } from '../../utils/billing';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';
import { Card } from '../ui/layout/Card';
import { ImportWorkspaceDialog } from './ImportWorkspaceDialog';

/** Sends the person to sign in again for a sensitive action (step-up), then back here. */
function useStepUp(): () => void {
  const navigate = useNavigate();
  return () => navigate(`/signin?reauth=1&next=${encodeURIComponent('/app/account/workspaces')}`);
}

/**
 * Account → Workspaces with real sign-in (D-UI-2 row 6): link state per browser workspace, "Bring to your
 * account", undo within 7 days. Only loaded with real sign-in on.
 */
export function WorkspaceLink({ workspaceId, part }: {workspaceId: string;part: 'badge' | 'actions';}) {
  const imports = useImports();
  const { t } = useT();
  const stepUp = useStepUp();
  const [importing, setImporting] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<ReturnType<typeof describeError> | null>(null);
  const [needsStepUp, setNeedsStepUp] = useState(false);
  if (!imports) return null;
  const link = imports.linkFor(workspaceId);

  if (part === 'badge') {
    if (workspaceId === DEMO_WORKSPACE_ID) return <span className="text-caption text-fg-subtle">{t('Demo workspaces stay on this device')}</span>;
    return link ? <Badge tone="success"><CloudIcon size={12} aria-hidden /> {t('Linked to account')}</Badge> : null;
  }
  if (workspaceId === DEMO_WORKSPACE_ID || !imports.loaded) return null;

  const canUndo = link && new Date(link.undoUntil).getTime() > Date.now();
  const undo = async () => {
    if (!link) return;
    setBusy(true);
    setProblem(null);
    setNeedsStepUp(false);
    try {
      await imports.undo(link.importId);
      setUndoing(false);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'step_up_required') setNeedsStepUp(true);
      setProblem(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {link ?
      canUndo &&
      <Button size="sm" variant="tertiary" onClick={() => setUndoing(true)}>
            Undo link
          </Button> :

      <Button size="sm" variant="secondary" leadingIcon={CloudIcon} onClick={() => setImporting(true)}>
          Bring to your account
        </Button>
      }
      <ImportWorkspaceDialog open={importing} workspaceId={workspaceId} onClose={() => setImporting(false)} />
      <Dialog
        open={undoing}
        onClose={() => setUndoing(false)}
        title="Undo the link?"
        description={link ? t('The copy in your account is deleted. This browser copy stays exactly as it is. You can link it again later. Possible until {date}.', { date: formatDate(link.undoUntil) }) : undefined}
        footer={
        <>
            <Button variant="secondary" disabled={busy} onClick={() => setUndoing(false)}>Keep it</Button>
            {needsStepUp ?
          <Button onClick={stepUp}>Sign in again</Button> :
          <Button variant="destructive" loading={busy} onClick={() => void undo()}>Undo link</Button>
          }
          </>
        }>
        
        {problem && <InlineAlert tone={problem.tone} title={problem.title}>{problem.body}</InlineAlert>}
      </Dialog>
    </>);

}

/** Workspaces saved in the account that are not in this browser: restore them here (another device). */
export function AccountCopies() {
  const imports = useImports();
  const { workspaces } = useWorkspace();
  const { t } = useT();
  const stepUp = useStepUp();
  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<{id: string;tone: 'warning' | 'danger';title: string;body: string;stepUp: boolean;} | null>(null);
  if (!imports?.loaded) return null;
  const elsewhere = imports.imports.filter((i) => i.status === 'completed' && i.mode === 'primary' && !workspaces.some((w) => w.id === i.legacyWorkspaceId));
  if (!elsewhere.length) return null;

  const restore = async (importId: string) => {
    setBusy(importId);
    setProblem(null);
    try {
      restoreSealedCopy(await imports.sealedCopy(importId));
      window.location.assign('/app/account/workspaces');
    } catch (e) {
      setProblem({ id: importId, ...describeError(e), stepUp: e instanceof ApiError && e.code === 'step_up_required' });
      setBusy(null);
    }
  };

  return (
    <Card id="acc-ws-account" title="In your account, not on this device" description="Bring a copy into this browser to keep working on it here." body="flush">
      <ul className="divide-y divide-line">
        {elsewhere.map((i) =>
        <li key={i.importId} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 md:px-6">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-label font-semibold text-fg">{i.workspaceName ?? i.legacyWorkspaceId}</span>
              <span className="block text-caption text-fg-subtle">{t('Saved in your account')}</span>
              {problem?.id === i.importId &&
            <InlineAlert tone={problem.tone} title={problem.title} className="mt-2">{problem.body}</InlineAlert>
            }
            </span>
            {problem?.id === i.importId && problem.stepUp ?
          <Button size="sm" onClick={stepUp}>Sign in again</Button> :
          <Button size="sm" variant="secondary" loading={busy === i.importId} onClick={() => void restore(i.importId)}>
                Download to this device
              </Button>
          }
          </li>
        )}
      </ul>
    </Card>);

}
