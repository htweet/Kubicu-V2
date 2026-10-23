import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DownloadIcon, FileArchiveIcon, Loader2Icon, Trash2Icon } from 'lucide-react';
import { useAccount, updateAccount, newExport, formatAccountDate, ACCOUNT_KEY } from '../../utils/account/store';
import { DELETION_GRACE_DAYS } from '../../data/accountOptions';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useNow } from '../../hooks/useNow';
import { Card } from '../ui/layout/Card';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { InlineAlert } from '../ui/InlineAlert';

const EXPORT_DAYS = 7;
const reasons = [
{ value: '', label: 'Choose one (optional)' },
{ value: 'not_using', label: 'I’m not using it any more' },
{ value: 'switching', label: 'I’m moving to another tool' },
{ value: 'cost', label: 'It costs too much' },
{ value: 'privacy', label: 'Privacy concerns' },
{ value: 'other', label: 'Something else' }];


/** Account → Data & privacy: emails from KUBICU, data export and account deletion (D80). */
export function DataPrivacyTab() {
  const account = useAccount();
  const { workspaces } = useWorkspace();
  const now = useNow(account.exports.some((e) => Date.parse(e.readyAt) > Date.now()) ? 1000 : null);
  const [deleting, setDeleting] = useState(false);
  const exports = account.exports.filter((e) => Date.parse(e.readyAt) + EXPORT_DAYS * 86400000 > now);
  const preparing = exports.some((e) => Date.parse(e.readyAt) > now);

  const download = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      note: 'KUBICU prototype export. A real export also includes each workspace’s pages, orders and contacts you have access to.',
      account: JSON.parse(localStorage.getItem(ACCOUNT_KEY) ?? 'null') ?? account,
      workspaces: workspaces.map((w) => ({ id: w.id, name: w.name, plan: w.plan, createdAt: w.createdAt }))
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'kubicu-my-data.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const setComms = (patch: Partial<typeof account.comms>) => updateAccount((a) => ({ ...a, comms: { ...a.comms, ...patch } }));

  return (
    <div className="flex flex-col gap-6">
      {account.deletion &&
      <InlineAlert
        tone="danger"
        title={`Your account will be deleted on ${formatAccountDate(account.deletion.scheduledFor, account.prefs, false)}`}
        action={
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            updateAccount((a) => ({ ...a, deletion: null }));
            toast.success('Deletion cancelled', { description: 'Your account and workspaces stay as they are.' });
          }}>
          
              Keep my account
            </Button>
        }>
        
          Until then everything works as normal and you can change your mind.
        </InlineAlert>
      }

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card id="dp-comms" title="Emails from KUBICU" description="Choose what we send you. Your customers’ messages are set in each workspace.">
          <div className="flex flex-col gap-5">
            <Switch id="dp-news" label="Product news" description="New features and changes, about once a month." checked={account.comms.productNews} onChange={(productNews) => setComms({ productNews })} />
            <Switch id="dp-tips" label="Tips for selling online" description="Short guides based on what’s working for other businesses." checked={account.comms.tips} onChange={(tips) => setComms({ tips })} />
            <Switch id="dp-research" label="Help shape KUBICU" description="Invitations to short interviews and early previews." checked={account.comms.research} onChange={(research) => setComms({ research })} />
            <p className="border-t border-line pt-4 text-caption text-fg-subtle">Security alerts, receipts and invoices are always sent — they’re about your account, not marketing.</p>
          </div>
        </Card>

        <Card
          id="dp-export"
          title="Download your data"
          description="A copy of your account details, sign-in history and the workspaces you belong to."
          footer={
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={FileArchiveIcon}
            disabled={preparing}
            onClick={() => {
              updateAccount((a) => ({ ...a, exports: [newExport(), ...a.exports].slice(0, 5) }));
              toast('Preparing your data', { description: 'We’ll email you when it’s ready. Prototype: it takes a few seconds.' });
            }}>
            
              {preparing ? 'Preparing…' : 'Request a copy'}
            </Button>
          }>
          
          {exports.length === 0 ?
          <p className="text-caption text-fg-muted">No copies yet. Each copy can be downloaded for {EXPORT_DAYS} days.</p> :

          <ul className="flex flex-col divide-y divide-line">
              {exports.map((e) => {
              const ready = Date.parse(e.readyAt) <= now;
              return (
                <li key={e.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="min-w-0 flex-1">
                      <span className="block text-label font-medium text-fg">Requested {formatAccountDate(e.requestedAt, account.prefs)}</span>
                      <span className="block text-caption text-fg-subtle">{ready ? `Available until ${formatAccountDate(new Date(Date.parse(e.readyAt) + EXPORT_DAYS * 86400000).toISOString(), account.prefs, false)}` : 'Preparing your file…'}</span>
                    </span>
                    {ready ?
                  <Button size="sm" variant="secondary" leadingIcon={DownloadIcon} onClick={download}>
                        Download
                      </Button> :

                  <Badge>
                        <Loader2Icon size={12} className="mr-1 animate-spin motion-reduce:animate-none" aria-hidden /> Preparing
                      </Badge>
                  }
                  </li>);

            })}
            </ul>
          }
        </Card>
      </div>

      <Card id="dp-delete" title="Delete your account" description="Permanently removes your account and every workspace you own.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex max-w-xl flex-wrap items-center gap-1.5 text-caption text-fg-muted">
            You get {DELETION_GRACE_DAYS} days to change your mind. Paid plans stop renewing straight away, and live pages show “This page is no longer available”.
          </p>
          <Button variant="destructive" leadingIcon={Trash2Icon} disabled={!!account.deletion} onClick={() => setDeleting(true)} className="shrink-0">
            {account.deletion ? 'Deletion scheduled' : 'Delete account'}
          </Button>
        </div>
      </Card>

      <DeleteDialog open={deleting} onClose={() => setDeleting(false)} workspaceNames={workspaces.map((w) => w.name)} />
    </div>);

}

function DeleteDialog({ open, onClose, workspaceNames }: {open: boolean;onClose: () => void;workspaceNames: string[];}) {
  const [typed, setTyped] = useState('');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (open) {
      setTyped('');
      setReason('');
      setTried(false);
    }
  }, [open]);

  const confirm = () => {
    setTried(true);
    if (typed.trim().toUpperCase() !== 'DELETE') return;
    const now = Date.now();
    updateAccount((a) => ({ ...a, deletion: { requestedAt: new Date(now).toISOString(), scheduledFor: new Date(now + DELETION_GRACE_DAYS * 86400000).toISOString(), reason } }));
    toast('Account deletion scheduled', { description: `Nothing is removed for ${DELETION_GRACE_DAYS} days. Prototype — nothing is ever actually deleted.` });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Delete your account?"
      description={`After ${DELETION_GRACE_DAYS} days this can’t be undone.`}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirm}>
            Schedule deletion
          </Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-label font-semibold text-fg">These workspaces are deleted with it</p>
          <ul className="mt-2 flex flex-col gap-1 text-label text-fg-muted">
            {workspaceNames.map((n) =>
            <li key={n}>· {n} — pages, products, orders, contacts and team</li>
            )}
          </ul>
          <p className="mt-2 text-caption text-fg-subtle">To keep one, transfer its ownership to a teammate first.</p>
        </div>
        <SelectInput id="del-reason" label="Why are you leaving?" value={reason} options={reasons} onChange={setReason} />
        <TextInput id="del-typed" label="Type DELETE to confirm" autoComplete="off" value={typed} error={tried && typed.trim().toUpperCase() !== 'DELETE' ? 'Type DELETE exactly' : undefined} onChange={(e) => setTyped(e.target.value)} />
      </div>
    </Dialog>);

}