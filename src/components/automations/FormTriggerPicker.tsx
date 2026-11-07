import React from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useFormsStore } from '../../hooks/useFormsStore';
import { FORMS_EXTENSION_ID } from '../../utils/forms/storage';
import { SelectInput } from '../ui/SelectInput';
import { InlineAlert } from '../ui/InlineAlert';

interface FormTriggerPickerProps {
  value: string | null;
  onChange: (formId: string | null) => void;
}

const ANY = '__any';

/** "A form response arrives" — limit it to one form, or listen to all of them (D195). */
export function FormTriggerPicker({ value, onChange }: FormTriggerPickerProps) {
  const { current } = useWorkspace();
  const market = useMarketplace();
  const { data } = useFormsStore(current.id);
  const forms = (data?.forms ?? []).filter((f) => !f.sample || f.id === value);
  const missing = !!value && !forms.some((f) => f.id === value);

  if (!market.isActive(FORMS_EXTENSION_ID)) {
    return (
      <InlineAlert tone="warning" title="Needs the Forms add-on" className="mt-3">
        Install or resume it in{' '}
        <Link to="/app/extensions" className="font-medium underline underline-offset-2">
          Extensions
        </Link>
        . Until then this automation has nothing to react to.
      </InlineAlert>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <SelectInput
        id="auto-form"
        label="Which form"
        value={missing ? ANY : value ?? ANY}
        options={[{ value: ANY, label: 'Any form' }, ...forms.map((f) => ({ value: f.id, label: f.status === 'live' ? f.name : `${f.name} (${f.status === 'draft' ? 'draft' : 'closed'})` }))]}
        onChange={(v) => onChange(v === ANY ? null : v)}
        hint="Use {name}, {first_name}, {email}, {form} and {total} in messages."
      />
      {missing && (
        <InlineAlert tone="warning" title="That form was deleted">
          This automation now listens to every form until you choose another.
        </InlineAlert>
      )}
    </div>
  );
}
