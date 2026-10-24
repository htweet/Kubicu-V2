import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, EyeOffIcon, InboxIcon, MessageSquareWarningIcon, XIcon } from 'lucide-react';
import type { ExtensionSubmission, SubmissionFields } from '../../types/extensionSubmission';
import { scopeInfo, webhookEvents } from '../../data/developerApi';
import { extensionCategories } from '../../data/extensions';
import { plans } from '../../data/plans';
import { DEV_SHARE, hostOf, subEvent, useSubmissions } from '../../utils/extensionSubmissions';
import { audit, useAdminStore } from '../../utils/admin/store';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { Tabs } from '../ui/Tabs';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { TextArea } from '../ui/TextArea';
import { EmptyState } from '../ui/EmptyState';

type Tab = 'queue' | 'listed' | 'closed';

const checklist = [
{ id: 'scopes', label: 'Permissions match what it says it does — nothing extra' },
{ id: 'claims', label: '“What it adds” is accurate; no invented reviews, results or guarantees' },
{ id: 'links', label: 'Setup address, support email and privacy policy work and belong to the developer' },
{ id: 'data', label: 'Privacy policy covers deleting data when an owner disconnects (NDPA)' },
{ id: 'price', label: 'Price and plan are clear; no hidden charges inside the app' }];


/** Super admin → Modules & marketplace → Extensions: review developer submissions and updates (D132). */
export function ExtensionReviews() {
  const [store, update] = useSubmissions();
  const [, setAdmin] = useAdminStore();
  const [tab, setTab] = useState<Tab>('queue');
  const [openId, setOpenId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);

  const queue = store.submissions.filter((s) => s.status === 'in_review' || s.status === 'listed' && s.pending);
  const rows = tab === 'queue' ? queue : store.submissions.filter((s) => tab === 'listed' ? s.status === 'listed' || s.status === 'unlisted' : s.status === 'changes_requested' || s.status === 'rejected');
  const open = store.submissions.find((s) => s.id === openId) ?? null;
  const reviewing = !!open && (open.status === 'in_review' || !!open.pending);
  const shown: SubmissionFields | null = open ? open.pending ?? open : null;
  const allChecked = checklist.every((c) => checks[c.id]);

  const openRow = (s: ExtensionSubmission) => {
    setOpenId(s.id);
    setChecks({});
    setNote('');
    setTried(false);
  };

  const decide = (kind: 'approve' | 'changes' | 'reject') => {
    if (!open) return;
    if (kind !== 'approve' && note.trim().length < 10) {
      setTried(true);
      return;
    }
    const isUpdate = !!open.pending;
    const ok = update((s) => ({
      ...s,
      submissions: s.submissions.map((x) => {
        if (x.id !== open.id) return x;
        if (kind === 'approve')
        return { ...x, ...(x.pending ?? {}), pending: null, status: 'listed' as const, reviewNote: null, listedAt: x.listedAt ?? new Date().toISOString(), history: [subEvent(isUpdate ? `Update v${x.pending?.version} approved` : 'Approved and listed', 'staff'), ...x.history] };
        if (isUpdate) return { ...x, pending: null, reviewNote: note.trim(), history: [subEvent(`Update not approved: ${note.trim()}`, 'staff'), ...x.history] };
        return { ...x, status: kind === 'changes' ? 'changes_requested' as const : 'rejected' as const, reviewNote: note.trim(), history: [subEvent(`${kind === 'changes' ? 'Changes requested' : 'Not approved'}: ${note.trim()}`, 'staff'), ...x.history] };
      })
    }));
    if (!ok) return;
    setAdmin((a) => audit(a, { area: 'extensions', action: kind === 'approve' ? isUpdate ? 'Approved extension update' : 'Approved extension' : kind === 'changes' ? 'Asked for extension changes' : 'Did not approve extension', target: `${open.name} · ${open.developerName}`, reason: kind === 'approve' ? 'Checklist complete' : note.trim() }));
    toast.success(kind === 'approve' ? `${open.name} ${isUpdate ? 'update is live' : 'is listed'}` : 'Sent back with your note', { description: 'The developer sees the outcome and your note word for word in Settings → Developers.' });
    setOpenId(null);
  };

  const unlist = (s: ExtensionSubmission) => {
    update((x) => ({ ...x, submissions: x.submissions.map((y) => y.id === s.id ? { ...y, status: 'unlisted', reviewNote: 'Unlisted by KUBICU', history: [subEvent('Unlisted by KUBICU', 'staff'), ...y.history] } : y) }));
    setAdmin((a) => audit(a, { area: 'extensions', action: 'Unlisted extension', target: `${s.name} · ${s.developerName}`, reason: 'Removed from the catalogue' }));
    toast('Unlisted', { description: 'Workspaces that installed it keep it until they uninstall.' });
    setOpenId(null);
  };

  return (
    <div>
      <Tabs<Tab>
        items={[
        { id: 'queue', label: `Review queue (${queue.length})` },
        { id: 'listed', label: 'Listed' },
        { id: 'closed', label: 'Sent back' }]
        }
        value={tab}
        onChange={setTab}
        ariaLabel="Extension reviews"
        idPrefix="adm-ext" />
      
      <div className="mt-6" role="tabpanel" id={`adm-ext-panel-${tab}`} aria-labelledby={`adm-ext-tab-${tab}`}>
        {rows.length === 0 ?
        <EmptyState icon={InboxIcon} title={tab === 'queue' ? 'Nothing waiting for review' : 'Nothing here'} description={tab === 'queue' ? 'New extensions and updates from developers appear here.' : undefined} /> :

        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
            {rows.map((s) =>
          <li key={s.id}>
                <button type="button" onClick={() => openRow(s)} className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-fg">{s.name}</span>
                      {s.pending && <Badge tone="info">Update v{s.pending.version}</Badge>}
                      {s.status === 'unlisted' && <Badge tone="neutral">Unlisted</Badge>}
                      {s.status === 'rejected' && <Badge tone="danger">Not approved</Badge>}
                      {s.status === 'changes_requested' && <Badge tone="warning">Changes requested</Badge>}
                      {s.sample && <Badge tone="neutral">Sample</Badge>}
                    </span>
                    <span className="block truncate text-caption text-fg-subtle">
                      {s.developerName} · {extensionCategories[s.category]} · {s.priceNgn ? `${formatNgn(s.priceNgn)}/mo` : 'Free'} · {s.scopes.length} permissions · submitted {formatTimestamp(s.submittedAt)}
                    </span>
                  </span>
                </button>
              </li>
          )}
          </ul>
        }
      </div>

      <Sheet
        open={!!open}
        onClose={() => setOpenId(null)}
        side="right"
        size="lg"
        title={open?.name ?? ''}
        description={open ? `${open.developerName} · v${shown?.version}${open.pending ? ` (update from v${open.version})` : ''}` : undefined}
        footer={
        reviewing ?
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <Button variant="tertiary" leadingIcon={XIcon} onClick={() => decide('reject')}>
                Don’t approve
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" leadingIcon={MessageSquareWarningIcon} onClick={() => decide('changes')}>
                  Ask for changes
                </Button>
                <Button leadingIcon={CheckIcon} disabled={!allChecked} onClick={() => decide('approve')}>
                  Approve
                </Button>
              </div>
            </div> :
        open?.status === 'listed' ?
        <Button variant="secondary" leadingIcon={EyeOffIcon} onClick={() => open && unlist(open)}>
              Unlist
            </Button> :
        undefined
        }>
        
        {open && shown &&
        <div className="flex flex-col gap-6 px-5 py-5">
            <section>
              <p className="text-label text-fg">{shown.summary}</p>
              <p className="mt-2 text-label text-fg-muted">{shown.description}</p>
              <ul className="mt-3 flex flex-col gap-1">
                {shown.adds.map((a) =>
              <li key={a} className="text-caption text-fg-muted">
                    · {a}
                  </li>
              )}
              </ul>
            </section>

            <dl className="grid gap-x-6 gap-y-3 text-label sm:grid-cols-2">
              <Row k="Price" v={shown.priceNgn ? `${formatNgn(shown.priceNgn)}/mo · developer gets ${formatNgn(Math.round(shown.priceNgn * DEV_SHARE))}` : 'Free'} />
              <Row k="Needs plan" v={`${plans[shown.minPlan].name}+`} />
              <Row k="Setup address" v={hostOf(shown.appUrl)} />
              <Row k="Support" v={shown.supportEmail} />
              <Row k="Privacy policy" v={hostOf(shown.privacyUrl)} />
              <Row k="What’s new" v={shown.releaseNotes || '—'} />
            </dl>

            <section aria-labelledby="ext-perms">
              <h3 id="ext-perms" className="text-label font-semibold text-fg">
                Permissions requested
              </h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {shown.scopes.map((sc) => {
                const info = scopeInfo.find((x) => x.id === sc);
                const added = open.pending && !open.scopes.includes(sc);
                return (
                  <li key={sc} className="flex flex-wrap items-center gap-2 text-caption text-fg">
                      {info?.label ?? sc}
                      {info?.risky && <Badge tone="warning">Changes data</Badge>}
                      {added && <Badge tone="danger">New in this update</Badge>}
                    </li>);

              })}
              </ul>
              {shown.events.length > 0 && <p className="mt-2 text-caption text-fg-muted">Events: {shown.events.map((e) => webhookEvents.find((x) => x.id === e)?.label ?? e).join(', ')}</p>}
            </section>

            {reviewing &&
          <>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-label font-semibold text-fg">Checklist — all five to approve</legend>
                  {checklist.map((c) =>
              <label key={c.id} className="flex min-h-[40px] cursor-pointer items-start gap-3 text-label text-fg">
                      <input type="checkbox" className="mt-0.5 size-4 accent-[rgb(var(--action))]" checked={!!checks[c.id]} onChange={(e) => setChecks((x) => ({ ...x, [c.id]: e.target.checked }))} />
                      {c.label}
                    </label>
              )}
                </fieldset>
                <TextArea id="adm-ext-note" label="Note to the developer" rows={3} value={note} error={tried && note.trim().length < 10 ? 'Explain what to change (at least 10 characters).' : undefined} hint="Needed to ask for changes or not approve. The developer sees it word for word." onChange={(e) => setNote(e.target.value)} />
              </>
          }

            <section aria-labelledby="ext-hist">
              <h3 id="ext-hist" className="text-label font-semibold text-fg">
                History
              </h3>
              <ol className="mt-2 flex flex-col gap-2">
                {open.history.map((e) =>
              <li key={e.id} className="text-caption">
                    <span className="text-fg">{e.label}</span>
                    <span className="block text-fg-subtle">
                      {formatTimestamp(e.at)} · {e.by === 'staff' ? 'KUBICU staff' : open.developerName}
                    </span>
                  </li>
              )}
              </ol>
            </section>
          </div>
        }
      </Sheet>
    </div>);

}

function Row({ k, v }: {k: string;v: string;}) {
  return (
    <div>
      <dt className="text-caption text-fg-subtle">{k}</dt>
      <dd className="break-words text-fg">{v}</dd>
    </div>);

}