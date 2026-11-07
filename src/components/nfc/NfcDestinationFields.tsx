import React from 'react';
import type { NfcDestination } from '../../types/nfc';
import { useDomains } from '../../contexts/DomainsContext';
import { useT } from '../../contexts/LocaleContext';
import { urlError } from '../../utils/nfc';
import { SelectInput } from '../ui/SelectInput';
import { TextInput } from '../ui/TextInput';

type Kind = NfcDestination['type'];

/** Where a tag sends people: the main page, one of your short links, or another web address (D442). */
export function NfcDestinationFields({ id, value, onChange, tried }: { id: string; value: NfcDestination; onChange: (d: NfcDestination) => void; tried: boolean }) {
  const { t: tr } = useT();
  const links = useDomains().data.links.filter((l) => !l.archivedAt);
  const urlErr = value.type === 'url' && tried ? urlError(value.url) : undefined;
  return (
    <div className="flex flex-col gap-4">
      <SelectInput<Kind>
        id={`${id}-type`}
        label={tr('When someone taps it, open')}
        value={value.type}
        onChange={(type) => onChange(type === 'page' ? { type } : type === 'link' ? { type, linkId: links[0]?.id ?? '' } : { type, url: '' })}
        options={[
          { value: 'page', label: tr('Your main page') },
          { value: 'link', label: tr('One of your short links'), disabled: links.length === 0 },
          { value: 'url', label: tr('Another web address') },
        ]}
        hint={value.type === 'link' ? tr('Short links keep their own campaign and stats too.') : undefined}
      />
      {value.type === 'link' && <SelectInput id={`${id}-link`} label={tr('Short link')} value={value.linkId} onChange={(linkId) => onChange({ type: 'link', linkId })} options={links.map((l) => ({ value: l.id, label: `${l.name} · /s/${l.slug}` }))} />}
      {value.type === 'url' && <TextInput id={`${id}-url`} label={tr('Web address')} placeholder="https://" value={value.url} error={urlErr ? tr(urlErr) : undefined} onChange={(e) => onChange({ type: 'url', url: e.target.value })} />}
    </div>
  );
}

export const destinationValid = (d: NfcDestination) => (d.type === 'url' ? !urlError(d.url) : d.type === 'link' ? !!d.linkId : true);
