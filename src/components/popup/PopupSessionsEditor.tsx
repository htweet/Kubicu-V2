import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { PopupSession } from '../../types/page';
import { MAX_POPUP_SESSIONS } from '../../utils/popup';
import { uid } from '../../utils/id';
import { Button } from '../ui/Button';
import { useT } from '../../contexts/LocaleContext';
import { TextInput } from '../ui/TextInput';

interface PopupSessionsEditorProps {
  sessions: PopupSession[];
  onChange: (sessions: PopupSession[]) => void;
  idPrefix: string;
  /** Sessions with orders can't be removed (their buyers chose them). */
  locked?: Set<string>;
}

/** Next Saturday, 10:00–18:00 — a sensible first market day. */
export function defaultSession(after?: PopupSession): PopupSession {
  const d = after ? new Date(`${after.date}T12:00`) : new Date();
  if (after) d.setDate(d.getDate() + 1);else
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { id: uid('ses'), date, from: after?.from ?? '10:00', to: after?.to ?? '18:00' };
}

/** 1–5 opening sessions for a pop-up shop (D183). */
export function PopupSessionsEditor({ sessions, onChange, idPrefix, locked }: PopupSessionsEditorProps) {
  const { t: tr } = useT();
  const update = (id: string, patch: Partial<PopupSession>) => onChange(sessions.map((s) => s.id === id ? { ...s, ...patch } : s));
  return (
    <fieldset className="flex min-w-0 flex-col gap-2.5">
      <legend className="mb-1 text-label font-medium text-fg">
        {tr('Opening sessions')} <span className="font-normal text-fg-subtle">· {tr('up to {n}', { n: MAX_POPUP_SESSIONS })}</span>
      </legend>
      {sessions.map((s, i) =>
      <div key={s.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2">
          <TextInput id={`${idPrefix}-${s.id}-date`} label={i === 0 ? tr('Date') : tr('Date {n}', { n: i + 1 })} type="date" value={s.date} onChange={(e) => update(s.id, { date: e.target.value })} />
          <TextInput id={`${idPrefix}-${s.id}-from`} label={tr('From')} type="time" value={s.from} onChange={(e) => update(s.id, { from: e.target.value })} />
          <TextInput id={`${idPrefix}-${s.id}-to`} label={tr('To')} type="time" value={s.to} onChange={(e) => update(s.id, { to: e.target.value })} />
          <button
          type="button"
          aria-label={tr('Remove session {n}', { n: i + 1 })}
          title={locked?.has(s.id) ? tr('Buyers chose this session, so it can’t be removed') : undefined}
          disabled={sessions.length === 1 || locked?.has(s.id)}
          onClick={() => onChange(sessions.filter((x) => x.id !== s.id))}
          className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-sm text-fg-subtle hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-40">
          
            <Trash2Icon size={15} aria-hidden />
          </button>
        </div>
      )}
      {sessions.length < MAX_POPUP_SESSIONS &&
      <Button size="sm" variant="tertiary" className="self-start" leadingIcon={PlusIcon} onClick={() => onChange([...sessions, defaultSession(sessions[sessions.length - 1])])}>
          {tr('Add a session')}
        </Button>
      }
    </fieldset>);

}