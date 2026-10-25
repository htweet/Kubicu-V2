import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CopyIcon, DownloadIcon, PlusIcon, SparklesIcon, UploadIcon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Contact, ContactSource, ContactStage, ConsentStatus } from '../types/ops';
import { useOps } from '../contexts/OpsContext';
import { useCommerce } from '../contexts/CommerceContext';
import { syncOrdersToContacts } from '../utils/ops/syncOrders';
import { duplicatePairs, upsertContact } from '../utils/ops/ops';
import { consentLabels, sourceLabels, stageLabels } from '../data/audience';
import { downloadCsv, toCsv } from '../utils/csv';
import { formatRelative } from '../utils/format';
import { isValidEmail, isValidPhone } from '../utils/validation';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { SelectInput } from '../components/ui/SelectInput';
import { DataTable, type DataColumn } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Dialog } from '../components/ui/Dialog';
import { TextInput } from '../components/ui/TextInput';
import { ConsentBadge, ContactDetail } from '../components/audience/ContactDetail';
import { ImportContactsDialog } from '../components/audience/ImportContactsDialog';
import { DuplicatesDialog } from '../components/audience/DuplicatesDialog';
import { SampleTag } from '../components/commerce/StatusBadges';
import { cn } from '../utils/cn';
import { Stat, StatGroup } from '../components/ui/layout/Stat';
import { List, ListRow } from '../components/ui/layout/ListRow';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTeam } from '../contexts/TeamContext';
import { AssigneeChip, MineToggle } from '../components/team/AssigneeSelect';
import { useT } from '../contexts/LocaleContext';

type View = 'list' | 'pipeline';

export function Audience() {
  const { data, apply, applySystem, loadSample } = useOps();
  const { t: tr } = useT();
  const commerce = useCommerce().data;
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<View>('list');
  const [source, setSource] = useState<ContactSource | 'all'>('all');
  const [consent, setConsent] = useState<ConsentStatus | 'all'>('all');
  const [dialog, setDialog] = useState<'import' | 'dupes' | 'add' | null>(null);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [tried, setTried] = useState(false);
  const [stageTab, setStageTab] = useState<ContactStage>('new');
  const wide = useMediaQuery('(min-width: 768px)');
  const openId = params.get('contact');

  // Paid orders become contacts once each.
  useEffect(() => {
    applySystem((d) => syncOrdersToContacts(d, commerce));
  }, [commerce, applySystem]);

  // “Mine”: contacts I look after, or with an open follow-up for me (D60).
  const { me } = useTeam();
  const [mine, setMine] = useState(false);
  const isMine = (c: Contact) => c.assigneeId === me.id || c.tasks.some((t) => !t.done && t.assigneeId === me.id);
  const mineCount = data.contacts.filter(isMine).length;
  const rows = useMemo(
    () => data.contacts.filter((c) => (source === 'all' || c.sources.includes(source)) && (consent === 'all' || c.consent === consent) && (!mine || c.assigneeId === me.id || c.tasks.some((t) => !t.done && t.assigneeId === me.id))),
    [data.contacts, source, consent, mine, me.id]
  );
  const dupes = duplicatePairs(data.contacts).length;
  const subscribed = data.contacts.filter((c) => c.consent === 'subscribed').length;
  const openTasks = data.contacts.reduce((s, c) => s + c.tasks.filter((t) => !t.done).length, 0);

  const followUps = (c: Contact) => {
    const n = c.tasks.filter((t) => !t.done).length;
    return tr(n === 1 ? '{n} follow-up' : '{n} follow-ups', { n });
  };

  const exportCsv = () =>
  downloadCsv(
    `kubicu-contacts-${new Date().toISOString().slice(0, 10)}.csv`,
    toCsv(['name', 'email', 'phone', 'consent', 'sources', 'tags', 'stage', 'created'], rows.map((c) => [c.name, c.email, c.phone, c.consent, c.sources.join('; '), c.tags.join('; '), c.stage, c.createdAt]))
  );

  const addErrors = {
    contact: !newContact.email.trim() && !newContact.phone.trim() ? 'Add an email or phone' : '',
    email: newContact.email.trim() && !isValidEmail(newContact.email) ? 'Email looks wrong' : '',
    phone: newContact.phone.trim() && !isValidPhone(newContact.phone) ? 'Phone looks wrong' : ''
  };

  const columns: DataColumn<Contact>[] = [
  {
    key: 'name',
    header: 'Contact',
    sortValue: (c) => c.name.toLowerCase(),
    render: (c) =>
    <button type="button" onClick={() => setParams({ contact: c.id })} className={cn('group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', c.consent === 'unsubscribed' && 'opacity-60')}>
          <span className="flex items-center gap-2">
            <span className="font-semibold text-fg group-hover:underline">{c.name || tr('(no name)')}</span>
            {c.sample && <SampleTag />}
          </span>
          <span className="block text-caption text-fg-subtle">{[c.email, c.phone].filter(Boolean).join(' · ')}</span>
        </button>

  },
  { key: 'consent', header: 'Consent', render: (c) => <ConsentBadge consent={c.consent} /> },
  { key: 'source', header: 'Came from', hideOnMobile: true, render: (c) => <span className="text-fg-muted">{c.sources.map((s) => tr(sourceLabels[s])).join(', ')}</span> },
  { key: 'tags', header: 'Tags', hideOnMobile: true, render: (c) => <span className="text-fg-muted">{c.tags.join(', ') || '—'}</span> },
  { key: 'stage', header: 'Stage', hideOnMobile: true, sortValue: (c) => c.stage, render: (c) => <span className="text-fg-muted">{tr(stageLabels[c.stage])}</span> },
  { key: 'owner', header: 'Looked after by', hideOnMobile: true, render: (c) => <AssigneeChip memberId={c.assigneeId} /> },
  { key: 'last', header: 'Last activity', align: 'right', sortValue: (c) => Date.parse(c.activity[0]?.at ?? c.createdAt), render: (c) => <span className="text-fg-muted">{formatRelative(c.activity[0]?.at ?? c.createdAt)}</span> }];


  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
      <PageHeader
        title="Audience"
        description="Everyone your page brings in — customers, bookings, enquiries and subscribers — with their consent."
        actions={
        <>
            <Button variant="tertiary" leadingIcon={UploadIcon} onClick={() => setDialog('import')}>
              Import
            </Button>
            <Button variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={rows.length === 0}>
              Export
            </Button>
            <Button leadingIcon={PlusIcon} onClick={() => setDialog('add')}>
              Add contact
            </Button>
          </>
        } />
      

      {data.contacts.length === 0 ?
      <EmptyState
        framed
        className="mt-8"
        icon={UsersIcon}
        title="No contacts yet"
        description="Orders, bookings, enquiry forms and newsletter signups on your page add people here automatically."
        action={
        <div className="flex flex-wrap justify-center gap-2">
                <Button leadingIcon={UploadIcon} variant="secondary" onClick={() => setDialog('import')}>
                  Import CSV
                </Button>
                <Button variant="secondary" leadingIcon={SparklesIcon} onClick={loadSample}>
                  Explore with sample data
                </Button>
              </div>
        } /> :


      <>
          <div className="mt-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
            <StatGroup columns={3} className="flex-1 items-end">
              <Stat primary label="Contacts" value={data.contacts.length} />
              <Stat label="Can receive marketing" value={subscribed} hint={data.contacts.length ? tr('{n}% of contacts', { n: Math.round(subscribed / data.contacts.length * 100) }) : undefined} />
              <Stat label="Open follow-ups" value={openTasks} />
            </StatGroup>
            {dupes > 0 &&
          <Button size="sm" variant="secondary" leadingIcon={CopyIcon} className="self-start md:self-end" onClick={() => setDialog('dupes')}>
                {tr(dupes === 1 ? 'Review {n} possible duplicate' : 'Review {n} possible duplicates', { n: dupes })}
              </Button>
          }
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-2">
              <Segmented<View> ariaLabel="View" value={view} onChange={setView} options={[{ value: 'list', label: 'List' }, { value: 'pipeline', label: 'Pipeline' }]} />
              <MineToggle mine={mine} count={mineCount} onChange={setMine} />
            </div>
            <div className="grid grid-cols-2 gap-3 md:flex">
              <div className="md:w-44">
                <SelectInput id="aud-src" label="Came from" value={source} onChange={setSource} options={[{ value: 'all', label: tr('Anywhere') }, ...(Object.keys(sourceLabels) as ContactSource[]).map((s) => ({ value: s, label: tr(sourceLabels[s]) }))]} />
              </div>
              <div className="md:w-48">
                <SelectInput id="aud-con" label="Consent" value={consent} onChange={setConsent} options={[{ value: 'all', label: tr('Any') }, ...(Object.keys(consentLabels) as ConsentStatus[]).map((s) => ({ value: s, label: tr(consentLabels[s]) }))]} />
              </div>
            </div>
          </div>

          {view === 'list' ?
        <div className="mt-4">
              <DataTable caption="Contacts" rows={rows} columns={columns} filterText={(c) => `${c.name} ${c.email} ${c.phone} ${c.tags.join(' ')}`} filterPlaceholder="Search name, email, phone or tag" emptyTitle="No contacts match" emptyDescription="Try other filters." />
            </div> :
        !wide ?
        // Phones: one stage at a time, switched with tabs that show each stage's count.
        <div className="mt-4">
              <div role="tablist" aria-label={tr('Stage')} className="scroll-quiet -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
                {(Object.keys(stageLabels) as ContactStage[]).map((stage) => {
              const on = stage === stageTab;
              const n = rows.filter((c) => c.stage === stage).length;
              return (
                <button
                  key={stage}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setStageTab(stage)}
                  className={cn(
                    'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    on ? 'border-action bg-action-soft text-action' : 'border-line bg-raised text-fg-muted'
                  )}>
                  
                      {tr(stageLabels[stage])} <span className="tabular-nums opacity-70">{n}</span>
                    </button>);

            })}
              </div>
              <div role="tabpanel" aria-label={tr(stageLabels[stageTab])} className="mt-3 overflow-hidden rounded-lg border border-line bg-raised">
                {rows.every((c) => c.stage !== stageTab) ?
            <p className="px-5 py-10 text-center text-label text-fg-muted">{tr('No one at this stage.')}</p> :

            <List>
                    {rows.
              filter((c) => c.stage === stageTab).
              map((c) =>
              <ListRow
                key={c.id}
                onClick={() => setParams({ contact: c.id })}
                title={c.name || c.email}
                meta={c.activity[0]?.label}
                trailing={
                <span className="flex flex-col items-end gap-1">
                              <ConsentBadge consent={c.consent} />
                              {c.tasks.some((t) => !t.done) && <span className="text-caption font-semibold text-action">{followUps(c)}</span>}
                            </span>
                } />

              )}
                  </List>
            }
              </div>
            </div> :

        <div className="scroll-quiet mt-4 grid auto-cols-[minmax(240px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2">
              {(Object.keys(stageLabels) as ContactStage[]).map((stage) => {
            const list = rows.filter((c) => c.stage === stage);
            return (
              <section key={stage} aria-label={tr(stageLabels[stage])} className="flex flex-col rounded-lg border border-line bg-sunken p-3">
                    <h2 className="flex items-baseline justify-between px-1 text-label font-semibold text-fg">
                      {tr(stageLabels[stage])} <span className="tabular-nums text-fg-subtle">{list.length}</span>
                    </h2>
                    <ul className="mt-3 flex flex-col gap-2">
                      {list.map((c) =>
                  <li key={c.id}>
                          <button type="button" onClick={() => setParams({ contact: c.id })} className="w-full rounded-md border border-line bg-raised p-3 text-left shadow-1 transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                            <span className="block truncate text-label font-semibold text-fg">{c.name || c.email}</span>
                            <span className="block truncate text-caption text-fg-subtle">{c.activity[0]?.label}</span>
                            {c.tasks.some((t) => !t.done) && <span className="mt-1.5 inline-block text-caption font-semibold text-action">{followUps(c)}</span>}
                          </button>
                        </li>
                  )}
                      {list.length === 0 && <li className="px-1 text-caption text-fg-subtle">{tr('No one here.')}</li>}
                    </ul>
                  </section>);

          })}
            </div>
        }
          <p className="mt-4 text-caption text-fg-subtle">{tr('Unsubscribed contacts are greyed and excluded from every marketing message and automation. Buying or booking isn’t marketing consent.')}</p>
        </>
      }

      <ContactDetail contactId={openId} onClose={() => setParams({})} />
      <ImportContactsDialog open={dialog === 'import'} onClose={() => setDialog(null)} />
      <DuplicatesDialog open={dialog === 'dupes'} onClose={() => setDialog(null)} />
      <Dialog
        open={dialog === 'add'}
        onClose={() => setDialog(null)}
        size="sm"
        title="Add a contact"
        description="Added contacts get service messages only until they opt in themselves."
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
            onClick={() => {
              setTried(true);
              if (Object.values(addErrors).some(Boolean)) return;
              if (apply((d) => upsertContact(d, newContact, 'manual', 'Added by you'))) {
                toast(tr('Contact added'));
                setNewContact({ name: '', email: '', phone: '' });
                setTried(false);
                setDialog(null);
              }
            }}>
            
              Add contact
            </Button>
          </>
        }>
        
        <div className="flex flex-col gap-4">
          <TextInput id="add-name" label="Name" value={newContact.name} onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))} />
          <TextInput id="add-email" label="Email" type="email" value={newContact.email} error={tried ? addErrors.email || addErrors.contact || undefined : undefined} onChange={(e) => setNewContact((c) => ({ ...c, email: e.target.value }))} />
          <TextInput id="add-phone" label="Phone" type="tel" value={newContact.phone} error={tried ? addErrors.phone || undefined : undefined} onChange={(e) => setNewContact((c) => ({ ...c, phone: e.target.value }))} />
        </div>
      </Dialog>
    </div>);

}