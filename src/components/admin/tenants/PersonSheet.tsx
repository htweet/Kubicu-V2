import React, { useState } from 'react';
import { toast } from 'sonner';
import { KeyRoundIcon, LockIcon, LogOutIcon, MailIcon, UnlockIcon } from 'lucide-react';
import type { PersonStaffState } from '../../../types/admin';
import type { Person } from '../../../utils/admin/people';
import { roleNames } from '../../../utils/admin/people';
import { audit, staffActor, useAdminStore } from '../../../utils/admin/store';
import { updateAccount } from '../../../utils/account/store';
import { formatRelative, formatTimestamp } from '../../../utils/format';
import { uid } from '../../../utils/id';
import { useT } from '../../../contexts/LocaleContext';
import { Sheet } from '../../ui/Sheet';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ReasonDialog } from '../ReasonDialog';
import { StaffNotes } from './StaffNotes';

type Act = 'signout' | 'twostep' | 'lock' | 'unlock' | 'verify';

const copy: Record<Act, {title: string;description: string;confirm: string;destructive?: boolean;}> = {
  signout: { title: 'Sign out of every device?', description: 'Ends every signed-in session, so they have to sign in again with their password. Use after a suspected account takeover.', confirm: 'Sign out everywhere', destructive: true },
  twostep: { title: 'Reset two-step sign-in?', description: 'Turns two-step off and clears backup codes, so they can set it up again. Only after you’ve confirmed who they are (ID check or a call from their registered number).', confirm: 'Reset two-step', destructive: true },
  lock: { title: 'Lock this account?', description: 'They can’t sign in to any of their workspaces until it’s unlocked. Their pages stay live — suspend a workspace to take pages down.', confirm: 'Lock account', destructive: true },
  unlock: { title: 'Unlock this account?', description: 'They can sign in again straight away.', confirm: 'Unlock' },
  verify: { title: 'Send the verification email again?', description: 'They get a fresh link to confirm their email address.', confirm: 'Send email' }
};

/**
 * One customer person: who they are, every workspace they're in, their sign-in security and staff actions (D472).
 * Follows the console language (D489); names, reasons, notes and audit entries stay as recorded.
 */
export function PersonSheet({ person, onClose, onOpenWorkspace }: {person: Person | null;onClose: () => void;onOpenWorkspace: (id: string) => void;}) {
  const { t } = useT();
  const [store, setStore] = useAdminStore();
  const [act, setAct] = useState<Act | null>(null);
  const state: PersonStaffState = person && store.people?.[person.key] || {};
  const locked = !!state.locked;

  const patch = (fn: (s: PersonStaffState) => PersonStaffState, action: string, reason: string) => {
    if (!person) return;
    setStore((s) => audit({ ...s, people: { ...s.people, [person.key]: fn(s.people?.[person.key] ?? {}) } }, { area: 'tenants', action, target: person.name, reason }));
  };

  const confirm = (reason: string) => {
    if (!person || !act) return;
    const now = new Date().toISOString();
    const by = staffActor(store);
    if (act === 'signout') {
      if (person.accountHolder) updateAccount((a) => ({ ...a, sessions: a.sessions.filter((x) => x.current) }));
      patch((s) => ({ ...s, signedOutAt: now }), 'Signed out of every device', reason);
      toast.success(t('Signed out everywhere'));
    } else if (act === 'twostep') {
      if (person.accountHolder) updateAccount((a) => ({ ...a, security: { ...a.security, twoStep: 'none', twoStepSince: null, backupCodes: [] } }));
      patch((s) => ({ ...s, twoStepResetAt: now }), 'Reset two-step sign-in', reason);
      toast.success(t('Two-step sign-in reset'));
    } else if (act === 'lock') {
      patch((s) => ({ ...s, locked: { reason, at: now, by } }), 'Locked account', reason);
      toast.success(t('Account locked'));
    } else if (act === 'unlock') {
      patch((s) => ({ ...s, locked: null }), 'Unlocked account', reason);
      toast.success(t('Account unlocked'));
    } else {
      patch((s) => ({ ...s, verificationSentAt: now }), 'Sent the verification email again', reason);
      toast.success(t('Verification email sent'), { description: t('Test mode — no email is sent.') });
    }
    setAct(null);
  };

  const addNote = (text: string) => {
    if (!person) return;
    const note = { id: uid('note'), text, at: new Date().toISOString(), by: staffActor(store) };
    setStore((s) => audit({ ...s, people: { ...s.people, [person.key]: { ...(s.people?.[person.key] ?? {}), notes: [note, ...(s.people?.[person.key]?.notes ?? [])] } } }, { area: 'tenants', action: 'Added a staff note', target: person.name, reason: text.slice(0, 120) }));
  };

  const twoStepLabel = t(person?.twoStep === 'app' ? 'Authenticator app' : person?.twoStep === 'sms' ? 'Text message' : person?.twoStep === 'none' ? 'Off' : 'Not known');
  const emailState = person?.emailVerified === false ? ` · ${t('not confirmed')}` : person?.emailVerified ? ` · ${t('confirmed')}` : '';

  return (
    <>
      <Sheet open={!!person} onClose={onClose} side="right" size="lg" bodyClassName="px-5 py-6" title={person?.name ?? ''} description={person ? [person.email, person.phone].filter(Boolean).join(' · ') || t('No contact details') : undefined}>
        {person &&
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center gap-2">
              {locked ?
            <Badge tone="danger" dot>
                  {t('Locked')}
                </Badge> :

            <Badge tone="success" dot>
                  {t('Active')}
                </Badge>
            }
              {person.accountHolder && <Badge tone="info">{t('Account holder')}</Badge>}
              {person.sample && <Badge tone="neutral">{t('Sample')}</Badge>}
            </div>
            {locked && state.locked && <p className="-mt-5 text-caption text-fg-muted">{`${t('Locked by {name}', { name: state.locked.by })} · ${formatTimestamp(state.locked.at)} — “${state.locked.reason}”`}</p>}

            <section aria-labelledby="person-ws">
              <h3 id="person-ws" className="text-label font-semibold text-fg">{t('Workspaces: {n}', { n: person.workspaces.length })}</h3>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {person.workspaces.map((w) =>
              <li key={w.id}>
                    <button type="button" onClick={() => onOpenWorkspace(w.id)} className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      <span className="min-w-0">
                        <span className="block truncate text-label font-medium text-fg">{w.name}</span>
                        <span className="block text-caption text-fg-subtle">{w.lastActiveAt ? t('Last active {when}', { when: formatRelative(w.lastActiveAt) }) : t('Not active yet')}</span>
                      </span>
                      <Badge tone={w.role === 'owner' ? 'accent' : 'neutral'}>{t(roleNames[w.role])}</Badge>
                    </button>
                  </li>
              )}
              </ul>
            </section>

            <section aria-labelledby="person-security">
              <h3 id="person-security" className="text-label font-semibold text-fg">
                {t('Account and sign-in')}
              </h3>
              <dl className="mt-2 grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-x-4 gap-y-2 text-label">
                <dt className="text-fg-muted">{t('Email')}</dt>
                <dd className="min-w-0 break-words text-fg">{person.email ? `${person.email}${emailState}` : '—'}</dd>
                <dt className="text-fg-muted">{t('Phone')}</dt>
                <dd className="text-fg">{person.phone || '—'}</dd>
                <dt className="text-fg-muted">{t('Two-step sign-in')}</dt>
                <dd className="text-fg">{twoStepLabel}</dd>
                <dt className="text-fg-muted">{t('Signed-in devices')}</dt>
                <dd className="text-fg">{person.sessions ?? t('Not known')}</dd>
                <dt className="text-fg-muted">{t('Joined')}</dt>
                <dd className="text-fg">{person.joinedAt ? formatTimestamp(person.joinedAt) : '—'}</dd>
                <dt className="text-fg-muted">{t('Last active')}</dt>
                <dd className="text-fg">{person.lastActiveAt ? formatRelative(person.lastActiveAt) : '—'}</dd>
                {state.signedOutAt &&
              <>
                    <dt className="text-fg-muted">{t('Signed out by staff')}</dt>
                    <dd className="text-fg">{formatTimestamp(state.signedOutAt)}</dd>
                  </>
              }
                {state.twoStepResetAt &&
              <>
                    <dt className="text-fg-muted">{t('Two-step reset by staff')}</dt>
                    <dd className="text-fg">{formatTimestamp(state.twoStepResetAt)}</dd>
                  </>
              }
              </dl>
              {!person.accountHolder && <p className="mt-2 text-caption text-fg-subtle">{t('Teammates’ sign-in details live with their own account; the prototype only holds the account signed in on this device.')}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" leadingIcon={LogOutIcon} onClick={() => setAct('signout')}>
                  {t('Sign out everywhere')}
                </Button>
                <Button size="sm" variant="secondary" leadingIcon={KeyRoundIcon} disabled={person.twoStep === 'none'} onClick={() => setAct('twostep')}>
                  {t('Reset two-step')}
                </Button>
                <Button size="sm" variant="secondary" leadingIcon={MailIcon} disabled={!person.email || person.emailVerified === true} onClick={() => setAct('verify')}>
                  {t('Resend verification')}
                </Button>
                {locked ?
              <Button size="sm" variant="secondary" leadingIcon={UnlockIcon} onClick={() => setAct('unlock')}>
                    {t('Unlock account')}
                  </Button> :

              <Button size="sm" variant="destructive" leadingIcon={LockIcon} onClick={() => setAct('lock')}>
                    {t('Lock account')}
                  </Button>
              }
              </div>
            </section>

            <StaffNotes id="person" notes={state.notes ?? []} onAdd={addNote} />
          </div>
        }
      </Sheet>
      <ReasonDialog
        open={!!act}
        onClose={() => setAct(null)}
        onConfirm={confirm}
        destructive={act ? copy[act].destructive : false}
        title={act ? t(copy[act].title) : ''}
        description={act ? t(copy[act].description) : ''}
        confirmLabel={act ? t(copy[act].confirm) : ''} />
      
    </>);

}