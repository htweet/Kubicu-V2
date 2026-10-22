import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { DestinationSelect } from './DestinationSelect';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useMainLink } from '../../hooks/useMainLink';
import type { CampaignLink } from '../../types/domains';
import type { SourceId } from '../../types/analytics';
import { decodeDestination, destinationOptions, encodeDestination, shortDisplay, slugError, slugify } from '../../utils/domains/links';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { uid } from '../../utils/id';

export const linkSourceOptions: {value: SourceId;label: string;}[] = [
{ value: 'instagram', label: 'Instagram' },
{ value: 'whatsapp', label: 'WhatsApp' },
{ value: 'tiktok', label: 'TikTok' },
{ value: 'facebook', label: 'Facebook' },
{ value: 'x', label: 'X (Twitter)' },
{ value: 'qr', label: 'Printed QR code' },
{ value: 'campaign', label: 'Something else (flyer, SMS, email…)' }];


interface Props {
  open: boolean;
  onClose: () => void;
  link?: CampaignLink;
}

/** Create or edit a tracked short link. The address can't change after it's shared. */
export function CampaignLinkDialog({ open, onClose, link }: Props) {
  const { data, saveLink } = useDomains();
  const { current } = useWorkspace();
  const { data: commerce } = useCommerce();
  const team = useTeam();
  const { mainHandle, host } = useMainLink();
  const options = useMemo(() => destinationOptions(current, commerce), [current, commerce]);
  const [name, setName] = useState('');
  const [source, setSource] = useState<SourceId>('instagram');
  const [dest, setDest] = useState(encodeDestination({ spaceId: MAIN_SPACE_ID, path: '' }));
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(link?.name ?? '');
    setSource(link?.source ?? 'instagram');
    setDest(link ? encodeDestination(link.destination) : options[0]?.value ?? encodeDestination({ spaceId: MAIN_SPACE_ID, path: '' }));
    setSlug(link?.slug ?? '');
    setSlugTouched(!!link);
    setTried(false);
  }, [open, link, options]);

  const effectiveSlug = slugTouched ? slug : slugify(name);
  const errors = {
    name: name.trim() ? undefined : 'Say where you’ll share it, so you can tell links apart.',
    slug: link ? undefined : slugError(effectiveSlug, data),
    dest: options.some((o) => o.value === dest) ? undefined : 'Choose where the link goes.'
  };

  const save = () => {
    setTried(true);
    if (errors.name || errors.slug || errors.dest) return;
    const next: CampaignLink = link ?
    { ...link, name: name.trim(), source, destination: decodeDestination(dest) } :
    { id: uid('lnk'), slug: effectiveSlug, name: name.trim(), source, destination: decodeDestination(dest), createdAt: new Date().toISOString(), archivedAt: null };
    if (!saveLink(next)) return;
    team.log('pages', `${link ? 'updated' : 'created'} the campaign link ${shortDisplay(mainHandle, next.slug, host)}`, '/app/domains/links');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={link ? 'Edit campaign link' : 'New campaign link'}
      description="A short link that tells you where visitors came from. Use a different one for each place you share."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{link ? 'Save' : 'Create link'}</Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <TextInput id="cl-name" label="Where you’ll share it" placeholder="Instagram bio, Market flyer…" value={name} onChange={(e) => setName(e.target.value)} error={tried ? errors.name : undefined} />
        <SelectInput<SourceId> id="cl-source" label="Counted as" value={source} options={linkSourceOptions} onChange={setSource} hint="Shown as the source in Analytics." />
        <DestinationSelect id="cl-dest" label="Goes to" value={dest} options={options} onChange={setDest} error={tried ? errors.dest : undefined} />
        {link ?
        <div className="flex flex-col gap-1">
            <span className="text-label font-medium text-fg">Address</span>
            <p className="break-all text-body text-fg">{shortDisplay(mainHandle, link.slug, host)}</p>
            <p className="text-caption text-fg-subtle">Can’t be changed — it may already be printed or shared. Change where it goes instead.</p>
          </div> :

        <TextInput
          id="cl-slug"
          label="Address"
          prefix={`…/s/`}
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.toLowerCase());
          }}
          error={tried ? errors.slug : undefined}
          hint={`${shortDisplay(mainHandle, effectiveSlug || 'your-link', host)} · can’t be changed after you create it`} />

        }
      </div>
    </Dialog>);

}