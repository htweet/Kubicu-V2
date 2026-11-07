import React from 'react';
import { Link } from 'react-router-dom';
import type { FormConfirmation, FormDef } from '../../types/forms';
import { useProviders } from '../../hooks/useProviders';
import { defaultConfirmation } from '../../utils/forms/confirmation';
import { Switch } from '../ui/Switch';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { InlineAlert } from '../ui/InlineAlert';

interface ConfirmationSettingsProps {
  form: FormDef;
  onChange: (c: FormConfirmation) => void;
}

/** Turn on a confirmation email and write it (D195). Sent through Settings → Integrations → Email. */
export function ConfirmationSettings({ form, onChange }: ConfirmationSettingsProps) {
  const providers = useProviders();
  const c = form.settings.confirmation ?? defaultConfirmation();
  const set = (p: Partial<FormConfirmation>) => onChange({ ...c, ...p });
  const provider = providers.active('email');
  const hasEmailField = form.fields.some((f) => f.type === 'email');

  return (
    <>
      <Switch
        id="fs-confirm"
        label="Send a confirmation email"
        checked={c.enabled}
        onChange={(enabled) => set({ enabled })}
        description={provider ? `Sent through ${provider.name}. Simulated in this prototype — nothing leaves the browser.` : 'Needs an email provider. Until one is connected, responses show “Not sent”.'}
      />
      {c.enabled && (
        <>
          {!provider && (
            <InlineAlert tone="warning" title="No email provider connected">
              Connect Resend, SendGrid or Amazon SES in{' '}
              <Link to="/app/settings/integrations" className="font-medium underline underline-offset-2">
                Settings → Integrations
              </Link>{' '}
              to send these.
            </InlineAlert>
          )}
          {!hasEmailField && (
            <InlineAlert tone="warning" title="This form doesn’t ask for an email address">
              Add an Email field, or nobody will receive the confirmation.
            </InlineAlert>
          )}
          <TextInput id="fs-confirm-subject" label="Subject" value={c.subject} maxLength={100} onChange={(e) => set({ subject: e.target.value })} error={c.subject.trim() ? undefined : 'Add a subject'} />
          <TextArea
            id="fs-confirm-body"
            label="Message"
            rows={6}
            value={c.body}
            maxLength={1500}
            onChange={(e) => set({ body: e.target.value })}
            hint="Use {first_name}, {name}, {form} and {answers}. {answers} lists what they sent — bank details, signatures, files and payments are always left out."
            error={c.body.trim() ? undefined : 'Write a message'}
          />
        </>
      )}
    </>
  );
}
