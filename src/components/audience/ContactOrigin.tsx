import React, { useState } from 'react';
import { PencilLineIcon } from 'lucide-react';
import type { Contact } from '../../types/ops';
import type { SourceId } from '../../types/analytics';
import { useT } from '../../contexts/LocaleContext';
import { sourceLabels } from '../../utils/analytics/track';
import { intentSources } from '../../utils/intentflow';
import { Button } from '../ui/Button';
import { SelectInput } from '../ui/SelectInput';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';

type Save = (p: Partial<Contact>, activity: {kind: Contact['activity'][number]['kind'];label: string;}) => void;

/**
 * Where a contact came from and what they agreed to (D268). For contacts added before these were recorded,
 * the business can fill them in by hand (D343). Hand-filled records say so, and permission can only be
 * recorded for people already marked as subscribed — it never turns marketing on by itself.
 */
export function ContactOrigin({ contact: c, onSave }: {contact: Contact;onSave: Save;}) {
  const { t: tr } = useT();
  const [editing, setEditing] = useState<'channel' | 'consent' | null>(null);
  const [channel, setChannel] = useState<SourceId>('whatsapp');
  const [wording, setWording] = useState('');
  const [when, setWhen] = useState(c.createdAt.slice(0, 10));
  const canRecordConsent = c.consent === 'subscribed' && !c.consentRecord;
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { dateStyle: 'medium' });

  const saveChannel = () => {
    onSave({ attribution: { channel, campaign: null, page: null, at: c.createdAt, addedBy: 'owner' } }, { kind: 'note', label: 'Where they came from was added by hand' });
    setEditing(null);
  };
  const saveConsent = () => {
    if (!wording.trim()) return;
    const at = new Date(`${when}T12:00:00`).toISOString();
    onSave({ consentRecord: { at, wording: wording.trim(), addedBy: 'owner' } }, { kind: 'consent', label: 'Permission recorded by hand' });
    setEditing(null);
  };

  return (
    <div className="rounded-md bg-sunken p-3 text-caption">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-fg-subtle">{tr('First came from')}</dt>
          <dd className="mt-0.5 text-fg">
            {c.attribution ?
            <>
                {tr(sourceLabels[c.attribution.channel])}
                {c.attribution.campaign ? ` · /s/${c.attribution.campaign}` : ''}
                {c.attribution.page ? ` · kub.icu/${c.attribution.page}` : ''}
                {c.attribution.addedBy === 'owner' && <span className="text-fg-subtle"> · {tr('added by you')}</span>}
              </> :

            <span className="flex flex-wrap items-center gap-x-2">
                <span className="text-fg-muted">{tr('Not recorded — added before channels were tracked')}</span>
                {editing !== 'channel' &&
              <button type="button" onClick={() => setEditing('channel')} className="inline-flex items-center gap-1 font-medium text-action hover:underline">
                    <PencilLineIcon size={12} aria-hidden /> {tr('Add')}
                  </button>
              }
              </span>
            }
          </dd>
        </div>
        <div>
          <dt className="text-fg-subtle">{tr('Permission for marketing')}</dt>
          <dd className="mt-0.5 text-fg">
            {c.consentRecord ?
            <>
                {tr('Agreed {date}', { date: fmt(c.consentRecord.at) })}: “{c.consentRecord.wording}”
                {c.consentRecord.addedBy === 'owner' && <span className="text-fg-subtle"> · {tr('recorded by you')}</span>}
              </> :
            canRecordConsent ?
            <span className="flex flex-wrap items-center gap-x-2">
                <span className="text-fg-muted">{tr('Not recorded')}</span>
                {editing !== 'consent' &&
              <button type="button" onClick={() => setEditing('consent')} className="inline-flex items-center gap-1 font-medium text-action hover:underline">
                    <PencilLineIcon size={12} aria-hidden /> {tr('Record it')}
                  </button>
              }
              </span> :

            <span className="text-fg-muted">{tr('Not subscribed, so nothing to record')}</span>
            }
          </dd>
        </div>
      </dl>

      {editing === 'channel' &&
      <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-end">
          <div className="sm:w-56">
            <SelectInput<SourceId> id={`origin-${c.id}`} label="Where they first found you" value={channel} onChange={setChannel} options={intentSources.map((s) => ({ value: s, label: sourceLabels[s] }))} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveChannel}>Save</Button>
            <Button size="sm" variant="tertiary" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      }
      {editing === 'consent' &&
      <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
          <TextArea id={`consent-${c.id}`} label="What they agreed to" rows={2} hint="Their words or the wording they saw, e.g. a WhatsApp reply or a sign-up sheet. Keep the original as proof." value={wording} onChange={(e) => setWording(e.target.value)} />
          <div className="sm:w-48">
            <TextInput id={`consent-at-${c.id}`} label="When" type="date" value={when} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveConsent} disabled={!wording.trim() || !when}>Save</Button>
            <Button size="sm" variant="tertiary" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      }
    </div>);

}