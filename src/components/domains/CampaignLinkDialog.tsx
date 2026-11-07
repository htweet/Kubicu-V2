import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { PhoneInput } from '../ui/PhoneInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';
import { DestinationSelect } from './DestinationSelect';
import { UtmTagsFields } from './UtmTagsFields';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useMainLink } from '../../hooks/useMainLink';
import type { CampaignLink } from '../../types/domains';
import type { SourceId } from '../../types/analytics';
import { UTM_PATTERN, decodeDestination, destinationOptions, encodeDestination, shortDisplay, slugError, slugify } from '../../utils/domains/links';
import { WA_MESSAGE_MAX, checkLinkHealth, destinationKey, linkCreationCheck, waDisplay, waPhoneError } from '../../utils/domains/linkRules';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { uid } from '../../utils/id';
import { checkDestination } from '../../utils/linkSafety';
import { useT } from '../../contexts/LocaleContext';

type Target = 'page' | 'web' | 'whatsapp';

export const linkSourceOptions: { value: SourceId; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'qr', label: 'Printed QR code' },
  { value: 'campaign', label: 'Something else (flyer, SMS, email…)' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  link?: CampaignLink;
}

const dayStart = (d: string) => new Date(`${d}T00:00:00`);
const dayEnd = (d: string) => new Date(`${d}T23:59:59`);

/** Create or edit a tracked short link. The address can't change after it's shared. */
export function CampaignLinkDialog({ open, onClose, link }: Props) {
  const { t: tr } = useT();
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
  const [utm, setUtm] = useState({ medium: '', campaign: '', content: '' });
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [target, setTarget] = useState<Target>('page');
  const [webUrl, setWebUrl] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(link?.name ?? '');
    setSource(link?.source ?? 'instagram');
    setDest(link ? encodeDestination(link.destination) : (options[0]?.value ?? encodeDestination({ spaceId: MAIN_SPACE_ID, path: '' })));
    setSlug(link?.slug ?? '');
    setSlugTouched(!!link);
    setTried(false);
    setUtm({ medium: link?.utm?.medium ?? '', campaign: link?.utm?.campaign ?? '', content: link?.utm?.content ?? '' });
    setStartsOn(link?.startsAt ? link.startsAt.slice(0, 10) : '');
    setEndsOn(link?.endsAt ? link.endsAt.slice(0, 10) : '');
    setShowMore(!!(link?.utm || link?.endsAt || link?.startsAt));
    setTarget(link?.whatsapp ? 'whatsapp' : link?.externalUrl ? 'web' : 'page');
    setWebUrl(link?.externalUrl ?? '');
    setWaPhone(link?.whatsapp?.phone ?? '');
    setWaMessage(link?.whatsapp?.message ?? '');
    setTags((link?.tags ?? []).join(', '));
  }, [open, link, options]);

  const web = checkDestination(webUrl);
  const tagList = Array.from(new Set(tags.split(',').map((t) => t.trim().toLowerCase().slice(0, 24)).filter(Boolean))).slice(0, 8);
  const limit = link ? null : linkCreationCheck(data);

  const effectiveSlug = slugTouched ? slug : slugify(name);
  const today = new Date().toISOString().slice(0, 10);
  const errors = {
    name: name.trim() ? undefined : 'Give the link a name so you can find it later.',
    slug: link ? undefined : slugError(effectiveSlug, data),
    dest:
      target === 'web'
        ? web.ok
          ? undefined
          : web.message
        : target === 'whatsapp'
          ? waPhoneError(waPhone) ?? (waMessage.length > WA_MESSAGE_MAX ? tr('Keep the message under {n} characters.', { n: WA_MESSAGE_MAX }) : undefined)
          : options.some((o) => o.value === dest)
            ? undefined
            : 'Choose where the link goes.',
    utm: [utm.medium, utm.campaign, utm.content].every((v) => UTM_PATTERN.test(v.trim())) ? undefined : 'Use letters, numbers, dots, dashes or underscores — no spaces.',
    starts: startsOn && startsOn < today && startsOn !== (link?.startsAt?.slice(0, 10) ?? '') ? 'Pick today or a later date.' : undefined,
    ends:
      endsOn && dayEnd(endsOn).getTime() <= Date.now() && endsOn !== (link?.endsAt?.slice(0, 10) ?? '')
        ? 'Pick a date after today.'
        : endsOn && startsOn && endsOn < startsOn
          ? 'End on or after the start date.'
          : undefined,
  };

  const save = () => {
    setTried(true);
    if (limit && !limit.ok) return;
    if (errors.name || errors.slug || errors.dest || errors.utm || errors.starts || errors.ends) return;
    const utmOut = utm.medium.trim() || utm.campaign.trim() || utm.content.trim() ? { medium: utm.medium.trim(), campaign: utm.campaign.trim(), content: utm.content.trim() } : undefined;
    const startsAt = startsOn ? (startsOn === today ? null : dayStart(startsOn).toISOString()) : null;
    const endsAt = endsOn ? dayEnd(endsOn).toISOString() : null;
    const externalUrl = target === 'web' && web.ok ? web.url : null;
    const whatsapp = target === 'whatsapp' ? { phone: waPhone.trim(), message: waMessage.trim() } : null;
    // The page destination stays set even for website and WhatsApp links, so a link switched back has somewhere to go.
    const destination = decodeDestination(target !== 'page' && !options.some((o) => o.value === dest) ? encodeDestination({ spaceId: MAIN_SPACE_ID, path: '' }) : dest);
    const toLabel = whatsapp ? `WhatsApp chat with ${waDisplay(whatsapp.phone)}` : externalUrl ? (web.ok ? web.host : externalUrl) : (options.find((o) => o.value === dest)?.label ?? 'Main page');
    const after = { externalUrl, whatsapp, destination };
    const changed = !link || destinationKey(link) !== destinationKey(after);
    const history = changed ? [{ at: new Date().toISOString(), by: team.me.name, to: toLabel }, ...(link?.history ?? [])].slice(0, 20) : (link?.history ?? []);
    const extra = { externalUrl, whatsapp, tags: tagList, history, startsAt };
    const base: CampaignLink = link
      ? { ...link, name: name.trim(), source, destination, utm: utmOut, endsAt, ...extra }
      : { id: uid('lnk'), slug: effectiveSlug, name: name.trim(), source, destination, createdAt: new Date().toISOString(), archivedAt: null, utm: utmOut, endsAt, pausedAt: null, ...extra };
    const next: CampaignLink = { ...base, health: checkLinkHealth(current, commerce, base) };
    if (!saveLink(next)) return;
    team.log('pages', `${link ? 'updated' : 'created'} the short link ${shortDisplay(mainHandle, next.slug, host)}`, `/app/links/${next.id}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={link ? 'Edit short link' : 'New short link'}
      description="A short link that shows how many clicks, visits and sales come from one place you share it. Make a separate link for each place."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!!limit && !limit.ok}>
            {link ? 'Save' : 'Create link'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {limit && !limit.ok && (
          <p role="alert" className="rounded-md bg-warning-soft px-3 py-2 text-label text-fg">
            {tr(limit.message)}
          </p>
        )}
        <TextInput
          id="cl-name"
          label="Link name"
          placeholder={tr('e.g. Eid sale — {place}', { place: tr(linkSourceOptions.find((o) => o.value === source)?.label ?? 'Instagram').split(' (')[0] })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={tried ? errors.name : undefined}
          hint="Only you see this. It’s how the link appears in your list and in Analytics."
        />
        <SelectInput<SourceId> id="cl-source" label="Where will you share it?" value={source} options={linkSourceOptions} onChange={setSource} hint="Visits from this link are counted under this source in Analytics." />
        <div className="flex flex-col gap-1.5">
          <span className="text-label font-medium text-fg">{tr('Link goes to')}</span>
          <Segmented<Target>
            ariaLabel="Link goes to"
            fullWidth
            value={target}
            onChange={setTarget}
            options={[
              { value: 'page', label: 'My page' },
              { value: 'web', label: 'A website' },
              { value: 'whatsapp', label: 'WhatsApp chat' },
            ]}
          />
        </div>
        {target === 'page' && (
          <DestinationSelect
            id="cl-dest"
            label="Which page, product or section?"
            value={dest}
            options={options}
            onChange={setDest}
            error={tried ? errors.dest : undefined}
          />
        )}
        {target === 'web' && (
          <TextInput
            id="cl-web"
            label="Website address"
            type="url"
            inputMode="url"
            placeholder="https://example.com/page"
            value={webUrl}
            onChange={(e) => setWebUrl(e.target.value)}
            error={(tried || webUrl.length > 8) && !web.ok ? (web as { message: string }).message : undefined}
            hint={web.ok ? tr(web.upgraded ? 'Checked: opens {host} (switched to https). It’s checked again every time someone taps the link, and once a day.' : 'Checked: opens {host}. It’s checked again every time someone taps the link, and once a day.', { host: web.host }) : 'Only https web addresses. Private, unsafe and other short-link addresses are refused.'}
          />
        )}
        {target === 'whatsapp' && (
          <>
            <PhoneInput
              id="cl-wa-phone"
              label="WhatsApp number"
              value={waPhone}
              onChange={setWaPhone}
              error={tried && waPhoneError(waPhone) ? waPhoneError(waPhone) : undefined}
              hint="The chat opens with this number."
            />
            <TextArea
              id="cl-wa-message"
              label="Message they start with"
              optional
              rows={3}
              maxLength={WA_MESSAGE_MAX}
              placeholder="Hi! I saw your flyer and I’d like to order…"
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              hint={`${tr('Already typed in their chat box. They can edit it before sending.')} ${waMessage.length}/${WA_MESSAGE_MAX}`}
            />
          </>
        )}
        <TextInput id="cl-tags" label="Tags" optional value={tags} placeholder="december-sale, ads" onChange={(e) => setTags(e.target.value)} hint="Separate with commas. Use them to filter and export your links." />
        {link ? (
          <div className="flex flex-col gap-1">
            <span className="text-label font-medium text-fg">{tr('Short link')}</span>
            <p className="break-all text-body text-fg">{shortDisplay(mainHandle, link.slug, host)}</p>
            <p className="text-caption text-fg-subtle">{tr('Can’t be changed — it may already be printed or shared. Change where it goes instead.')}</p>
          </div>
        ) : (
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
            hint={tr('People will see {link}. Made from the name; edit if you like. It can’t change once created.', { link: shortDisplay(mainHandle, effectiveSlug || 'your-link', host) })}
          />
        )}
        <button type="button" aria-expanded={showMore} onClick={() => setShowMore((v) => !v)} className="self-start text-label font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {tr(showMore ? 'Hide more options' : 'More options: start and end dates, campaign tags')}
        </button>
        {showMore && (
          <div className="flex flex-col gap-5 border-t border-line pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                id="cl-starts"
                type="date"
                label="Start the link on"
                optional
                min={today}
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
                error={tried ? errors.starts : undefined}
                hint="Before this day, it says “not live yet” and offers your main page. Print it early."
              />
              <TextInput
                id="cl-ends"
                type="date"
                label="Stop the link on"
                optional
                min={startsOn || today}
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
                error={tried ? errors.ends : undefined}
                hint="After this day, the link and any QR code using it say “This link has ended”."
              />
            </div>
            {target !== 'whatsapp' && (
              <UtmTagsFields
                medium={utm.medium}
                campaign={utm.campaign}
                content={utm.content}
                onChange={(patch) => setUtm((u) => ({ ...u, ...patch }))}
                mediumPlaceholder={source === 'qr' ? 'qr' : 'social'}
                campaignPlaceholder={effectiveSlug || 'your-link'}
                error={tried ? errors.utm : undefined}
              />
            )}
          </div>
        )}
        {limit?.ok && limit.left <= 5 && <p className="text-caption text-fg-subtle">{tr('Links you can still make this hour: {n}', { n: limit.left })}</p>}
      </div>
    </Dialog>
  );
}
