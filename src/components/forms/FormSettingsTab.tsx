import React from 'react';
import type { FormDef, FormSettings } from '../../types/forms';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { DateTimeInput } from '../ui/DateTimeInput';
import { AssigneeSelect } from '../team/AssigneeSelect';
import { ConfirmationSettings } from './ConfirmationSettings';
import { useT } from '../../contexts/LocaleContext';

interface FormSettingsTabProps {
  form: FormDef;
  onChange: (patch: Partial<FormDef>) => void;
  disabled: boolean;
}

/** After sending, limits, spam protection and privacy for one form (D79). */
export function FormSettingsTab({ form, onChange, disabled }: FormSettingsTabProps) {
  const s = form.settings;
  const set = (p: Partial<FormSettings>) => onChange({ settings: { ...s, ...p } });
  const redirectBad = !!s.redirectUrl && !/^https?:\/\/\S+\.\S+/.test(s.redirectUrl);

  return (
    <fieldset disabled={disabled} className="flex max-w-3xl flex-col">
      <legend className="sr-only">Form settings</legend>
      <Group title="Basics" text="What visitors see at the top of the form.">
        <TextInput id="fs-name" label="Form name" value={form.name} maxLength={60} onChange={(e) => onChange({ name: e.target.value })} error={form.name.trim() ? undefined : 'Add a name'} />
        <TextArea id="fs-desc" label="Intro" optional rows={2} value={form.description} maxLength={240} onChange={(e) => onChange({ description: e.target.value })} />
        <TextInput id="fs-submit" label="Send button" value={s.submitLabel} maxLength={24} onChange={(e) => set({ submitLabel: e.target.value })} />
      </Group>

      <Group title="After sending" text="The confirmation visitors see.">
        <TextInput id="fs-st" label="Thank-you heading" value={s.successTitle} maxLength={60} onChange={(e) => set({ successTitle: e.target.value })} />
        <TextArea id="fs-sx" label="Thank-you message" rows={2} value={s.successText} maxLength={240} onChange={(e) => set({ successText: e.target.value })} />
        <TextInput id="fs-rd" label="Continue link" optional placeholder="https://" value={s.redirectUrl} onChange={(e) => set({ redirectUrl: e.target.value.trim() })} error={redirectBad ? 'Enter a full address starting with https://' : undefined} hint="Shown as a Continue button under the message." />
      </Group>

      <Group title="Confirmation email" text="A copy of their answers, sent to the person who filled in the form.">
        <ConfirmationSettings form={form} onChange={(confirmation) => set({ confirmation })} />
      </Group>

      <Group title="Limits" text="The form closes itself when either is reached. Visitors see a clear closed message.">
        <DateTimeInput id="fs-close" label="Close on" optional value={s.closeAt} clearable onChange={(v) => set({ closeAt: v })} />
        <TextInput id="fs-max" label="Maximum responses" optional type="number" inputMode="numeric" min={1} value={s.maxResponses ?? ''} onChange={(e) => set({ maxResponses: e.target.value ? Math.max(1, Math.round(Number(e.target.value))) : null })} />
      </Group>

      <Group title="Responses" text="Who looks after new responses. They get a notification.">
        <AssigneeSelect id="fs-assign" label="Assign new responses to" value={s.assigneeId} onChange={(v) => set({ assigneeId: v })} />
      </Group>

      <Group title="Spam protection" text="A hidden trap catches most bots. These two checks catch the rest.">
        <TextInput id="fs-min" label="Ignore responses sent faster than (seconds)" type="number" inputMode="numeric" min={0} max={30} value={s.minFillSeconds} onChange={(e) => set({ minFillSeconds: Math.max(0, Math.min(30, Number(e.target.value) || 0)) })} />
        <TextInput id="fs-rate" label="Responses allowed per visitor per day" type="number" inputMode="numeric" min={1} max={50} value={s.perVisitorLimit} onChange={(e) => set({ perVisitorLimit: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })} />
      </Group>

      <Group title="Privacy" text="Shown above the Send button. Keep it honest and short." last>
        <TextArea id="fs-privacy" label="Privacy note" rows={2} value={s.privacyNote} maxLength={240} onChange={(e) => set({ privacyNote: e.target.value })} />
      </Group>
    </fieldset>);

}

function Group({ title, text, children, last }: {title: string;text: string;children: React.ReactNode;last?: boolean;}) {
  const { t } = useT();
  title = t(title);
  text = t(text);
  return (
    <section className={last ? 'grid gap-4 py-6 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8' : 'grid gap-4 border-b border-line py-6 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8'}>
      <div>
        <h2 className="text-label font-semibold text-fg">{title}</h2>
        <p className="mt-1 text-caption text-fg-muted">{text}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>);

}