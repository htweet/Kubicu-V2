import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { OpsSettings } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { opsSettingsOf } from '../../utils/ops/settings';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { TextInput } from '../ui/TextInput';
import { Segmented } from '../ui/Segmented';
import { Field } from '../ui/Field';

type Draft = Pick<OpsSettings, 'quietHours' | 'defaultChannel'>;

/** Automations → Settings (D259): quiet hours for customer messages, and the channel new message steps start with. */
export function AutomationSettingsSheet({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { data, apply } = useOps();
  const saved = opsSettingsOf(data);
  const [draft, setDraft] = useState<Draft>({ quietHours: saved.quietHours, defaultChannel: saved.defaultChannel });
  useEffect(() => {
    if (open) {
      const s = opsSettingsOf(data);
      setDraft({ quietHours: s.quietHours, defaultChannel: s.defaultChannel });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = draft.quietHours;
  const same = q.on && q.from === q.to;
  const dirty = JSON.stringify(draft) !== JSON.stringify({ quietHours: saved.quietHours, defaultChannel: saved.defaultChannel });
  const save = () => {
    if (same) return;
    if (apply((d) => ({ ...d, settings: { ...d.settings, quietHours: draft.quietHours, defaultChannel: draft.defaultChannel } }))) {
      toast.success('Automation settings saved');
      onClose();
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      title="Automation settings"
      description="For every automation in this workspace."
      footer={
      <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!dirty || same}>
            Save
          </Button>
        </div>
      }>
      
      <div className="flex flex-col gap-8 px-5 py-5 md:px-6">
        <section aria-labelledby="aset-quiet" className="flex flex-col gap-4">
          <h3 id="aset-quiet" className="sr-only">
            Quiet hours
          </h3>
          <Switch
            id="aset-quiet-on"
            label="Quiet hours"
            description={`Customer WhatsApp messages and emails written in these hours wait until they end, in your business time (${data.availability.timeZone.replace('_', ' ')}). Tags, follow-ups and notices to you still happen straight away.`}
            checked={q.on}
            onChange={(on) => setDraft((d) => ({ ...d, quietHours: { ...d.quietHours, on } }))} />
          
          {q.on &&
          <div className="grid grid-cols-2 gap-4">
              <TextInput id="aset-from" label="From" type="time" value={q.from} onChange={(e) => setDraft((d) => ({ ...d, quietHours: { ...d.quietHours, from: e.target.value } }))} />
              <TextInput id="aset-to" label="Until" type="time" value={q.to} error={same ? 'Pick a different time' : undefined} onChange={(e) => setDraft((d) => ({ ...d, quietHours: { ...d.quietHours, to: e.target.value } }))} />
            </div>
          }
        </section>

        <section aria-labelledby="aset-channel" className="flex flex-col gap-3 border-t border-line pt-6">
          <h3 id="aset-channel" className="sr-only">
            Default channel
          </h3>
          <Field id="aset-channel-pick" label="New message steps start as" hint="You can still change each step. Recipes keep the channel they were written for.">
            <Segmented<Draft['defaultChannel']>
              ariaLabel="New message steps start as"
              value={draft.defaultChannel}
              onChange={(defaultChannel) => setDraft((d) => ({ ...d, defaultChannel }))}
              options={[
              { value: 'send_whatsapp', label: 'WhatsApp' },
              { value: 'send_email', label: 'Email' }]
              } />
            
          </Field>
        </section>
        <p className="text-caption text-fg-subtle">Customer messages are written but not sent in this prototype — sending needs a messaging partner. Quiet hours show in each run’s history.</p>
      </div>
    </Sheet>);

}