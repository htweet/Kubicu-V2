import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowUpDownIcon, BanIcon, ExternalLinkIcon, GlobeIcon, MoreHorizontalIcon, RotateCcwIcon, ShieldCheckIcon, UserCogIcon, UserMinusIcon, WalletIcon } from 'lucide-react';
import type { Workspace } from '../../../types/workspace';
import type { Role } from '../../../types/team';
import type { CountryCode } from '../../../types/country';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { countries } from '../../../data/countries';
import { readTeam, writeTeam } from '../../../utils/team';
import { Menu } from '../../ui/Menu';
import { IconButton } from '../../ui/IconButton';
import { SelectInput } from '../../ui/SelectInput';
import { ReasonDialog } from '../ReasonDialog';
import type { Person } from '../../../utils/admin/people';
import { peopleIn, roleNames } from '../../../utils/admin/people';
import { plans } from '../../../data/plans';
import { countryInfo } from '../../../utils/country';
import { audit, staffActor, useAdminStore } from '../../../utils/admin/store';
import { formatRelative, formatTimestamp } from '../../../utils/format';
import { uid } from '../../../utils/id';
import { Sheet } from '../../ui/Sheet';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { StaffNotes } from './StaffNotes';

export interface WorkspaceSummary {
  workspace: Workspace;
  handle: string;
  live: boolean;
  spaces: number;
  suspended: boolean;
}

/** One workspace: who's in it, its plan and country, and the staff actions (D472). */
type MemberAct = {kind: 'role' | 'remove';person: Person;memberId: string;role: Role;} | {kind: 'country';} | null;

export function WorkspaceSheet({
  item,
  people,
  onClose,
  onOpenPerson,
  onAction,
  onVerification,
  onTeamChanged









}: {item: WorkspaceSummary | null;people: Person[];onClose: () => void;onOpenPerson: (key: string) => void;onAction: (kind: 'plan' | 'suspend' | 'restore') => void;onVerification: () => void; /** Called after staff change someone's role or remove them, so lists rebuild. */onTeamChanged: () => void;}) {
  const [store, setStore] = useAdminStore();
  const { update } = useWorkspace();
  const [act, setAct] = useState<MemberAct>(null);
  const [role, setRole] = useState<Role>('editor');
  const [newCountry, setNewCountry] = useState<CountryCode>('NG');

  // Staff can change a teammate's role or remove them, and move the workspace's country (D473). The owner is never changed here.
  const confirmAct = (reason: string) => {
    if (!act || !w) return;
    if (act.kind === 'country') {
      const info = countryInfo(newCountry);
      update(w.id, { country: newCountry, currency: info.currency });
      setStore((s) => audit(s, { area: 'tenants', action: `Moved country ${countryInfo(w.country ?? 'NG').name} → ${info.name} (currency ${info.currency})`, target: w.name, reason }));
      toast.success(`${w.name} now sells from ${info.name}`, { description: `Prices show in ${info.currency}. Existing orders keep the currency they were paid in.` });
    } else {
      const team = readTeam(w.id);
      if (!team) return setAct(null);
      const next =
      act.kind === 'role' ?
      { ...team, members: team.members.map((m) => m.id === act.memberId ? { ...m, role } : m) } :
      { ...team, members: team.members.filter((m) => m.id !== act.memberId) };
      try {
        writeTeam(w.id, next);
      } catch {
        toast.error('Couldn’t save — browser storage is full');
        return;
      }
      setStore((s) =>
      audit(s, {
        area: 'tenants',
        action: act.kind === 'role' ? `Changed ${act.person.name}’s role ${roleNames[act.role]} → ${roleNames[role]}` : `Removed ${act.person.name} from the workspace`,
        target: w.name,
        reason
      })
      );
      toast.success(act.kind === 'role' ? `${act.person.name} is now ${roleNames[role]}` : `${act.person.name} removed`);
      onTeamChanged();
    }
    setAct(null);
  };
  const navigate = useNavigate();
  const w = item?.workspace;
  const team = w ? peopleIn(people, w.id) : [];
  const notes = w && store.workspaceNotes?.[w.id] || [];

  const addNote = (text: string) => {
    if (!w) return;
    const note = { id: uid('note'), text, at: new Date().toISOString(), by: staffActor(store) };
    setStore((s) => audit({ ...s, workspaceNotes: { ...s.workspaceNotes, [w.id]: [note, ...(s.workspaceNotes?.[w.id] ?? [])] } }, { area: 'tenants', action: 'Added a staff note', target: w.name, reason: text.slice(0, 120) }));
  };

  const country = w ? countryInfo(w.country ?? 'NG') : null;

  return (
    <Sheet open={!!item} onClose={onClose} side="right" size="lg" bodyClassName="px-5 py-6" title={w?.name ?? ''} description={item ? `kub.icu/${item.handle}` : undefined}>
      {item && w && country &&
      <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-2">
            {item.suspended ?
          <Badge tone="danger" dot>
                Suspended
              </Badge> :
          item.live ?
          <Badge tone="success" dot>
                Live
              </Badge> :

          <Badge tone="neutral">Draft</Badge>
          }
            <Badge tone="neutral">{plans[w.plan].name}</Badge>
            {w.demoData && <Badge tone="info">Demo data</Badge>}
          </div>
          {item.suspended && store.suspended[w.id] && <p className="-mt-5 text-caption text-fg-muted">{`Suspended ${formatTimestamp(store.suspended[w.id].at)} — “${store.suspended[w.id].reason}”`}</p>}

          <section aria-labelledby="ws-details">
            <h3 id="ws-details" className="text-label font-semibold text-fg">
              Details
            </h3>
            <dl className="mt-2 grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-x-4 gap-y-2 text-label">
              <dt className="text-fg-muted">Country</dt>
              <dd className="text-fg">{country.name}</dd>
              <dt className="text-fg-muted">Currency</dt>
              <dd className="text-fg">{w.currency ?? country.currency}</dd>
              <dt className="text-fg-muted">Spaces</dt>
              <dd className="text-fg">{item.spaces}</dd>
              <dt className="text-fg-muted">Business WhatsApp</dt>
              <dd className="text-fg">{w.whatsapp || '—'}</dd>
              <dt className="text-fg-muted">Created</dt>
              <dd className="text-fg">{formatTimestamp(w.createdAt)}</dd>
            </dl>
          </section>

          <section aria-labelledby="ws-team">
            <h3 id="ws-team" className="text-label font-semibold text-fg">{`People: ${team.length}`}</h3>
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {team.map(({ person, ws }) =>
            <li key={person.key} className="flex items-center gap-1">
                  <button type="button" onClick={() => onOpenPerson(person.key)} className="-ml-2 flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    <span className="min-w-0">
                      <span className="block truncate text-label font-medium text-fg">{person.name}</span>
                      <span className="block truncate text-caption text-fg-subtle">
                        {[person.email || person.phone, ws.lastActiveAt ? `active ${formatRelative(ws.lastActiveAt)}` : null, person.workspaces.length > 1 ? `in ${person.workspaces.length} workspaces` : null].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {store.people?.[person.key]?.locked && <Badge tone="danger">Locked</Badge>}
                      <Badge tone={ws.role === 'owner' ? 'accent' : 'neutral'}>{roleNames[ws.role]}</Badge>
                    </span>
                  </button>
                  {ws.role !== 'owner' && ws.memberId &&
              <Menu
                align="end"
                items={[
                { id: 'role', label: 'Change role…', icon: UserCogIcon, onSelect: () => (setRole(ws.role), setAct({ kind: 'role', person, memberId: ws.memberId!, role: ws.role })) },
                { id: 'remove', label: 'Remove from workspace…', icon: UserMinusIcon, destructive: true, onSelect: () => setAct({ kind: 'remove', person, memberId: ws.memberId!, role: ws.role }) }]
                }
                trigger={(p) => <IconButton {...p} size="sm" icon={MoreHorizontalIcon} label={`Actions for ${person.name}`} />} />

              }
                </li>
            )}
            </ul>
          </section>

          <section aria-labelledby="ws-actions">
            <h3 id="ws-actions" className="text-label font-semibold text-fg">
              Actions
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.live &&
            <Button size="sm" variant="secondary" leadingIcon={ExternalLinkIcon} onClick={() => window.open(`/p/${item.handle}`, '_blank', 'noopener')}>
                  Open live page
                </Button>
            }
              <Button size="sm" variant="secondary" leadingIcon={ShieldCheckIcon} onClick={onVerification}>
                Verification
              </Button>
              <Button size="sm" variant="secondary" leadingIcon={ArrowUpDownIcon} onClick={() => onAction('plan')}>
                Change plan
              </Button>
              <Button size="sm" variant="secondary" leadingIcon={GlobeIcon} onClick={() => (setNewCountry(w.country ?? 'NG'), setAct({ kind: 'country' }))}>
                Change country
              </Button>
              <Button size="sm" variant="secondary" leadingIcon={WalletIcon} onClick={() => navigate('/admin/plans')}>
                Billing and credits
              </Button>
              {item.suspended ?
            <Button size="sm" variant="secondary" leadingIcon={RotateCcwIcon} onClick={() => onAction('restore')}>
                  Restore
                </Button> :

            <Button size="sm" variant="destructive" leadingIcon={BanIcon} onClick={() => onAction('suspend')}>
                  Suspend
                </Button>
            }
            </div>
          </section>

          <StaffNotes id="ws" notes={notes} onAdd={addNote} />
        </div>
      }
      <ReasonDialog
        open={!!act}
        onClose={() => setAct(null)}
        onConfirm={confirmAct}
        destructive={act?.kind === 'remove'}
        title={act?.kind === 'role' ? `Change ${act.person.name}’s role` : act?.kind === 'remove' ? `Remove ${act.person.name}?` : `Change ${w?.name ?? ''}’s country`}
        description={
        act?.kind === 'role' ?
        'Use when the owner can’t do it themselves — for example they’ve lost access. The owner sees the change in their Activity log.' :
        act?.kind === 'remove' ?
        'They lose access to this workspace straight away. Their other workspaces aren’t affected, and their past activity stays in the log.' :
        'Sets where the business sells from: currency, phone formats, regions, banks and checkout options follow. Existing orders keep the currency they were paid in.'
        }
        confirmLabel={act?.kind === 'role' ? 'Change role' : act?.kind === 'remove' ? 'Remove' : 'Change country'}>
        
        {act?.kind === 'role' && <SelectInput<Role> id="ws-member-role" label="New role" value={role} onChange={setRole} options={(['admin', 'editor', 'sales', 'viewer'] as Role[]).map((r) => ({ value: r, label: roleNames[r] }))} />}
        {act?.kind === 'country' && <SelectInput<CountryCode> id="ws-country" label="Country" value={newCountry} onChange={setNewCountry} options={countries.map((c) => ({ value: c.code, label: `${c.name} · ${c.currency}` }))} />}
      </ReasonDialog>
    </Sheet>);

}