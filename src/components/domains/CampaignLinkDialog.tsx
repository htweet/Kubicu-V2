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
import { UTM_PATTERN, decodeDestination, destinationOptions, encodeDestination, shortDisplay, slugError, slugify } from '../../utils/domains/links';
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
  const [medium, setMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [content, setContent] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(link?.name ?? '');
    setSource(link?.source ?? 'instagram');
    setDest(link ? encodeDestination(link.destination) : options[0]?.value ?? encodeDestination({ spaceId: MAIN_SPACE_ID, path: '' }));
    setSlug(link?.slug ?? '');
    setSlugTouched(!!link);
    setTried(false);
    setMedium(link?.utm?.medium ?? '');
    setUtmCampaign(link?.utm?.campaign ?? '');
    setContent(link?.utm?.content ?? '');
    setEndsOn(link?.endsAt ? link.endsAt.slice(0, 10) : '');
    setShowMore(!!(link?.utm || link?.endsAt));
  }, [open, link, options]);

  const effectiveSlug = slugTouched ? slug : slugify(name);
  const errors = {
    name: name.trim() ? undefined : 'Give the link a name so you can find it later.',
    slug: link ? undefined : slugError(effectiveSlug, data),
    dest: options.some((o) => o.value === dest) ? undefined : 'Choose where the link goes.',
    utm: [medium, utmCampaign, content].every((v) => UTM_PATTERN.test(v.trim())) ? undefined : 'Use letters, numbers, dots, dashes or underscores — no spaces.',
    ends: endsOn && Date.parse(`${endsOn}T23:59:59`) <= Date.now() && endsOn !== (link?.endsAt?.slice(0, 10) ?? '') ? 'Pick a date after today.' : undefined
  };

  const save = () => {
    setTried(true);
    if (errors.name || errors.slug || errors.dest || errors.utm || errors.ends) return;
    const utm = medium.trim() || utmCampaign.trim() || content.trim() ? { medium: medium.trim(), campaign: utmCampaign.trim(), content: content.trim() } : undefined;
    const endsAt = endsOn ? new Date(`${endsOn}T23:59:59`).toISOString() : null;
    const next: CampaignLink = link ?
    { ...link, name: name.trim(), source, destination: decodeDestination(dest), utm, endsAt } :
    { id: uid('lnk'), slug: effectiveSlug, name: name.trim(), source, destination: decodeDestination(dest), createdAt: new Date().toISOString(), archivedAt: null, utm, endsAt };
    if (!saveLink(next)) return;
    team.log('pages', `${link ? 'updated' : 'created'} the campaign link ${shortDisplay(mainHandle, next.slug, host)}`, '/app/campaign-links');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={link ? 'Edit campaign link' : 'New campaign link'}
      description="A short link that shows how many visits and sales come from one place you share it. Make a separate link for each place."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{link ? 'Save' : 'Create link'}</Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <TextInput
          id="cl-name"
          label="Link name"
          placeholder={`e.g. Eid sale — ${linkSourceOptions.find((o) => o.value === source)?.label.split(' (')[0] ?? 'Instagram'}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={tried ? errors.name : undefined}
          hint="Only you see this. It’s how the link appears in your list and in Analytics." />
        
        <SelectInput<SourceId> id="cl-source" label="Where will you share it?" value={source} options={linkSourceOptions} onChange={setSource} hint="Visits from this link are counted under this source in Analytics." />
        <DestinationSelect id="cl-dest" label="Where should it take people?" value={dest} options={options} onChange={setDest} error={tried ? errors.dest : undefined} />
        {link ?
        <div className="flex flex-col gap-1">
            <span className="text-label font-medium text-fg">Short link</span>
            <p className="break-all text-body text-fg">{shortDisplay(mainHandle, link.slug, host)}</p>
            <p className="text-caption text-fg-subtle">Can’t be changed — it may already be printed or shared. Change where it goes instead.</p>
          </div> :

        <TextInput
          id="cl-slug"
          label="Short link"
          prefix={`…/s/`}
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.toLowerCase());
          }}
          error={tried ? errors.slug : undefined}
          hint={`People will see ${shortDisplay(mainHandle, effectiveSlug || 'your-link', host)}. Made from the name; edit if you like. It can’t change once created.`} />

        }
        <button type="button" aria-expanded={showMore} onClick={() => setShowMore((v) => !v)} className="self-start text-label font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {showMore ? 'Hide more options' : 'More options: end date, Google Analytics tags'}
        </button>
        {showMore &&
        <div className="flex flex-col gap-5 border-t border-line pt-4">
            <TextInput id="cl-ends" type="date" label="Stop the link on" optional value={endsOn} onChange={(e) => setEndsOn(e.target.value)} error={tried ? errors.ends : undefined} hint="Useful for sales with an end date. After this day, the link and any QR code using it say “This link has ended”." />
            <fieldset className="flex flex-col gap-3">
              <legend className="text-label font-medium text-fg">Tags for Google Analytics and ad tools</legend>
              <p className="-mt-1 text-caption text-fg-subtle">Only needed if you use those tools. KUBICU Analytics works without them. Leave blank to use the grey defaults.</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextInput id="cl-medium" label="Type of channel" optional value={medium} placeholder={source === 'qr' ? 'qr' : 'social'} onChange={(e) => setMedium(e.target.value)} hint="utm_medium" />
                <TextInput id="cl-campaign" label="Campaign" optional value={utmCampaign} placeholder={effectiveSlug || 'your-link'} onChange={(e) => setUtmCampaign(e.target.value)} hint="utm_campaign" />
                <TextInput id="cl-content" label="Post or version" optional value={content} placeholder="e.g. story-1" onChange={(e) => setContent(e.target.value)} hint="utm_content" />
              </div>
              {tried && errors.utm && <p className="text-caption text-danger">{errors.utm}</p>}
            </fieldset>
          </div>
        }
      </div>
    </Dialog>);

}