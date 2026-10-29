import React, { useEffect, useState } from 'react';
import { PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { ContactField, ContactFieldType, OpsSettings } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { MAX_CONTACT_FIELDS, MAX_SAVED_TAGS, cleanTag, opsSettingsOf } from '../../utils/ops/settings';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { fieldControlClass } from '../ui/Field';
import { cn } from '../../utils/cn';

type Draft = Pick<OpsSettings, 'contactFields' | 'savedTags' | 'consentText'>;

const fieldTypes: {value: ContactFieldType;label: string;}[] = [
{ value: 'text', label: 'Text' },
{ value: 'number', label: 'Number' },
{ value: 'date', label: 'Date' },
{ value: 'choice', label: 'Pick one' }];


const fieldError = (f: ContactField) => !f.label.trim() ? 'Name the field' : f.type === 'choice' && f.options.filter((o) => o.trim()).length < 2 ? 'Give at least two options, one per line' : '';

/** Audience → Settings (D259): your own contact fields, saved tags, and the standard consent note. */
export function AudienceSettingsSheet({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { data, apply } = useOps();
  const saved = opsSettingsOf(data);
  const [draft, setDraft] = useState<Draft>({ contactFields: saved.contactFields, savedTags: saved.savedTags, consentText: saved.consentText });
  const [tag, setTag] = useState('');
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (!open) return;
    const s = opsSettingsOf(data);
    setDraft({ contactFields: s.contactFields, savedTags: s.savedTags, consentText: s.consentText });
    setTried(false);
    setTag('');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (id: string, p: Partial<ContactField>) => setDraft((d) => ({ ...d, contactFields: d.contactFields.map((f) => f.id === id ? { ...f, ...p } : f) }));
  const usedTags = Array.from(new Set(data.contacts.flatMap((c) => c.tags))).filter((t) => !draft.savedTags.includes(t)).sort();
  const addTag = (raw: string) => {
    const t = cleanTag(raw);
    if (!t || draft.savedTags.some((x) => x.toLowerCase() === t.toLowerCase()) || draft.savedTags.length >= MAX_SAVED_TAGS) return;
    setDraft((d) => ({ ...d, savedTags: [...d.savedTags, t] }));
  };
  const hasError = draft.contactFields.some((f) => fieldError(f));
  const dirty = JSON.stringify(draft) !== JSON.stringify({ contactFields: saved.contactFields, savedTags: saved.savedTags, consentText: saved.consentText });

  const save = () => {
    setTried(true);
    if (hasError) return;
    const contactFields = draft.contactFields.map((f) => ({ ...f, label: f.label.trim(), options: f.type === 'choice' ? f.options.map((o) => o.trim()).filter(Boolean) : [] }));
    if (apply((d) => ({ ...d, settings: { ...d.settings, contactFields, savedTags: draft.savedTags, consentText: draft.consentText.trim() } }))) {
      toast.success('Audience settings saved');
      onClose();
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      title="Audience settings"
      description="Shared by everyone in this workspace."
      footer={
      <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!dirty}>
            Save
          </Button>
        </div>
      }>
      
      <div className="flex flex-col gap-8 px-5 py-5 md:px-6">
        <section aria-labelledby="as-fields" className="flex flex-col gap-3">
          <div>
            <h3 id="as-fields" className="text-label font-semibold text-fg">
              Your contact fields
            </h3>
            <p className="text-caption text-fg-muted">Things worth remembering about each person — “Dress size”, “Birthday”, “Preferred stylist”. They show on every contact and in the export.</p>
          </div>
          {draft.contactFields.length > 0 &&
          <ol className="flex flex-col divide-y divide-line rounded-md border border-line">
              {draft.contactFields.map((f, i) => {
              const err = tried ? fieldError(f) : '';
              return (
                <li key={f.id} className="flex flex-col gap-3 p-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_8.5rem_auto]">
                      <TextInput id={`cf-${f.id}`} label={`Field ${i + 1}`} value={f.label} maxLength={40} placeholder="e.g. Dress size" error={err === 'Name the field' ? err : undefined} onChange={(e) => setField(f.id, { label: e.target.value })} />
                      <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                        <SelectInput<ContactFieldType> id={`cf-t-${f.id}`} label="Type" value={f.type} options={fieldTypes} onChange={(type) => setField(f.id, { type })} />
                      </div>
                      <IconButton icon={Trash2Icon} label={`Remove field ${i + 1}`} onClick={() => setDraft((d) => ({ ...d, contactFields: d.contactFields.filter((x) => x.id !== f.id) }))} />
                    </div>
                    {f.type === 'choice' &&
                  <TextArea id={`cf-o-${f.id}`} label="Options" rows={3} hint="One per line." value={f.options.join('\n')} error={err && err !== 'Name the field' ? err : undefined} onChange={(e) => setField(f.id, { options: e.target.value.split('\n').slice(0, 12) })} />
                  }
                  </li>);

            })}
            </ol>
          }
          {draft.contactFields.length < MAX_CONTACT_FIELDS ?
          <Button variant="secondary" size="sm" leadingIcon={PlusIcon} className="self-start" onClick={() => setDraft((d) => ({ ...d, contactFields: [...d.contactFields, { id: uid('cf'), label: '', type: 'text', options: [] }] }))}>
              Add a field
            </Button> :

          <p className="text-caption text-fg-subtle">Up to {MAX_CONTACT_FIELDS} fields.</p>
          }
          {saved.contactFields.some((f) => !draft.contactFields.some((x) => x.id === f.id)) &&
          <p className="rounded-md bg-warning-soft px-3 py-2 text-caption text-fg">Removing a field hides it from every contact. What was saved in it is kept, so adding a field with the same name later won’t bring it back.</p>
          }
        </section>

        <section aria-labelledby="as-tags" className="flex flex-col gap-3 border-t border-line pt-6">
          <div>
            <h3 id="as-tags" className="text-label font-semibold text-fg">
              Saved tags
            </h3>
            <p className="text-caption text-fg-muted">Offered first when you tag someone, and in the Tag filter — so “VIP” never becomes “vip” and “V.I.P”.</p>
          </div>
          {draft.savedTags.length > 0 &&
          <ul className="flex flex-wrap gap-1.5">
              {draft.savedTags.map((t) =>
            <li key={t} className="inline-flex h-8 items-center gap-1 rounded-full bg-sunken pl-3 pr-1 text-caption font-medium text-fg">
                  {t}
                  <button type="button" aria-label={`Remove tag ${t}`} onClick={() => setDraft((d) => ({ ...d, savedTags: d.savedTags.filter((x) => x !== t) }))} className="flex h-6 w-6 items-center justify-center rounded-full text-fg-subtle hover:bg-raised hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    <XIcon size={12} aria-hidden />
                  </button>
                </li>
            )}
            </ul>
          }
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addTag(tag);
              setTag('');
            }}>
            
            <label htmlFor="as-tag" className="sr-only">
              New tag
            </label>
            <input id="as-tag" value={tag} maxLength={24} placeholder="e.g. Wholesale" onChange={(e) => setTag(e.target.value)} className={cn(fieldControlClass, 'flex-1')} disabled={draft.savedTags.length >= MAX_SAVED_TAGS} />
            <Button type="submit" variant="secondary" disabled={!cleanTag(tag) || draft.savedTags.length >= MAX_SAVED_TAGS}>
              Add
            </Button>
          </form>
          {usedTags.length > 0 && draft.savedTags.length < MAX_SAVED_TAGS &&
          <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-caption text-fg-subtle">Already used:</span>
              {usedTags.slice(0, 12).map((t) =>
            <button key={t} type="button" onClick={() => addTag(t)} className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-line-strong px-2.5 text-caption text-fg-muted hover:border-action hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <PlusIcon size={11} aria-hidden /> {t}
                </button>
            )}
            </div>
          }
        </section>

        <section aria-labelledby="as-consent" className="flex flex-col gap-3 border-t border-line pt-6">
          <h3 id="as-consent" className="sr-only">
            Consent note
          </h3>
          <TextArea
            id="as-consent-text"
            label="Your standard consent note"
            optional
            rows={3}
            maxLength={240}
            value={draft.consentText}
            placeholder="e.g. We use your details only to reply to you and send updates you ask for. Unsubscribe anytime."
            hint="Offered with one tap on every enquiry form and newsletter sign-up in the canvas. Pages already published keep their own wording."
            onChange={(e) => setDraft((d) => ({ ...d, consentText: e.target.value }))} />
          
        </section>
      </div>
    </Sheet>);

}