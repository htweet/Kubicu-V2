import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusIcon } from 'lucide-react';
import type { AccountFailure } from '../../types/accountMode';
import type { WorkspacePlan } from '../../types/plan';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { useT } from '../../contexts/LocaleContext';
import { plans } from '../../data/plans';
import { roleInfo } from '../../data/permissions';
import { SAMPLE_OWNED_WORKSPACE_LIMIT } from '../../data/accountModeSamples';
import { simulate } from '../../utils/accountModeSim';
import { initialsOf } from '../../utils/account/store';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';
import { AccountStateAlert, isScreenFailure } from '../account/AccountStates';

interface Row {
  id: string;
  name: string;
  plan: WorkspacePlan;
  local: boolean;
}

/**
 * Account → Workspaces in account mode (D537). Remove becomes Archive: the server keeps the data and the
 * workspace disappears for everyone. No restore is promised. The demo workspace card is browser-only.
 */
export function WorkspacesTabAccount() {
  const { t: tr } = useT();
  const navigate = useNavigate();
  const { workspaces, current, switchTo } = useWorkspace();
  const { simulation, withStepUp } = useAccountMode();
  const [created, setCreated] = useState<Row[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  const [archiving, setArchiving] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<AccountFailure | null>(null);
  const [screenFailure, setScreenFailure] = useState<AccountFailure | null>(null);
  const [form, setForm] = useState({ name: '', ownerName: '', type: '', country: '', currency: '', whatsapp: '' });
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setFailure(null);
    setTried(false);
    if (creating) setForm({ name: '', ownerName: '', type: '', country: '', currency: '', whatsapp: '' });
  }, [creating, archiving]);

  const rows: Row[] = [...workspaces.map((w) => ({ id: w.id, name: w.name, plan: w.plan, local: true })), ...created].filter((r) => !archived.includes(r.id));

  const archive = async () => {
    if (!archiving) return;
    setBusy(true);
    setFailure(null);
    const r = await withStepUp(() => simulate('workspace.archive', simulation, { stepUp: true, refusal: tr('Only the Owner can archive this workspace.') }));
    setBusy(false);
    if (r.ok) {
      setArchived((a) => [...a, archiving.id]);
      toast(tr('{name} archived', { name: archiving.name }), { description: tr('It’s gone from everyone’s list. Its data is kept.') });
      setArchiving(null);
      return;
    }
    if (r.code === 'cancelled') return;
    if (isScreenFailure(r.code)) {
      setArchiving(null);
      setScreenFailure(r);
      return;
    }
    setFailure(r);
  };

  const create = async () => {
    setTried(true);
    if (!form.name.trim()) return;
    setBusy(true);
    setFailure(null);
    const r = await simulate('workspace.create', simulation, { refusal: tr('You already own {n} workspaces, the most allowed. Archive one first.', { n: SAMPLE_OWNED_WORKSPACE_LIMIT }) });
    setBusy(false);
    if (r.ok) {
      setCreated((c) => [...c, { id: `acc_ws_${Date.now()}`, name: form.name.trim(), plan: 'free', local: false }]);
      toast.success(tr('{name} created', { name: form.name.trim() }));
      setCreating(false);
      return;
    }
    if (isScreenFailure(r.code)) {
      setCreating(false);
      setScreenFailure(r);
      return;
    }
    setFailure(r);
  };

  const field = (key: keyof typeof form, label: string, hint?: string) => (
    <TextInput id={`acc-ws-${key}`} label={label} hint={hint} value={form[key]} error={key === 'name' && tried && !form.name.trim() ? tr('Enter a name for the workspace.') : undefined} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
  );

  return (
    <div className="flex flex-col gap-6">
      {screenFailure && <AccountStateAlert failure={screenFailure} />}
      <Card
        id="acc-ws"
        title={tr('Your workspaces')}
        description={`${tr('Workspaces: {n}', { n: rows.length })}. ${tr('Each has its own pages, products, customers, team and plan.')}`}
        body="flush"
        actions={
          <Button size="sm" variant="secondary" leadingIcon={PlusIcon} onClick={() => setCreating(true)}>
            {tr('New workspace')}
          </Button>
        }
      >
        <ul className="divide-y divide-line">
          {rows.map((w) => {
            const isCurrent = w.id === current.id;
            return (
              <li key={w.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 md:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sunken text-label font-semibold text-fg">
                    {initialsOf(w.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-label font-semibold text-fg">{w.name}</span>
                      {isCurrent && <Badge tone="info">{tr('Open now')}</Badge>}
                    </span>
                    <span className="block truncate text-caption text-fg-subtle">
                      {tr(roleInfo.owner.label)} · {tr('{plan} plan', { plan: plans[w.plan].name })}
                    </span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                  {!isCurrent && w.local && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        switchTo(w.id);
                        navigate('/app');
                      }}
                    >
                      {tr('Open')}
                    </Button>
                  )}
                  <Button size="sm" variant="tertiary" onClick={() => setArchiving(w)}>
                    {tr('Archive workspace')}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-line px-5 py-3 text-caption text-fg-muted md:px-6">{tr('Owners can’t leave a workspace. To hand one over, open it and use Settings → Team → Transfer ownership.')}</p>
      </Card>

      <Dialog
        open={!!archiving}
        onClose={() => !busy && setArchiving(null)}
        title={archiving ? tr('Archive {name}?', { name: archiving.name }) : ''}
        description={tr('It disappears for everyone in the team. Its data is kept. You’ll be asked to confirm it’s you.')}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setArchiving(null)}>
              {tr('Cancel')}
            </Button>
            <Button variant="destructive" loading={busy} onClick={() => void archive()}>
              {busy ? tr('Archiving…') : tr('Archive workspace')}
            </Button>
          </>
        }
      >
        {failure ? <AccountStateAlert failure={failure} onRetry={() => void archive()} /> : <p className="text-caption text-fg-muted">{tr('There’s no restore button yet. To get it back, contact Kubicu support.')}</p>}
      </Dialog>

      <Dialog
        open={creating}
        onClose={() => !busy && setCreating(false)}
        title={tr('New workspace')}
        description={tr('Only the name is needed. You can fill in the rest later in Settings.')}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setCreating(false)}>
              {tr('Cancel')}
            </Button>
            <Button loading={busy} onClick={() => void create()}>
              {busy ? tr('Creating…') : tr('Create workspace')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {failure?.code === 'refused' ? (
            <InlineAlert tone="warning" title={tr('Workspace limit reached')}>
              {failure.message ?? ''}
            </InlineAlert>
          ) : failure ? (
            <AccountStateAlert failure={failure} onRetry={() => void create()} />
          ) : null}
          {field('name', tr('Workspace name'))}
          {field('ownerName', tr('Owner name (optional)'))}
          {field('type', tr('Business type (optional)'))}
          <div className="grid gap-4 sm:grid-cols-2">
            {field('country', tr('Country (optional)'))}
            {field('currency', tr('Currency (optional)'))}
          </div>
          {field('whatsapp', tr('WhatsApp number (optional)'))}
        </div>
      </Dialog>
    </div>
  );
}
