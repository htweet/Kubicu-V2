import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, BarChart3Icon, CheckIcon, CopyIcon, Link2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useDomains } from '../../contexts/DomainsContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useMainLink } from '../../hooks/useMainLink';
import type { CampaignLink } from '../../types/domains';
import { checkDestination } from '../../utils/linkSafety';
import { linkCreationCheck } from '../../utils/domains/linkRules';
import { shortDisplay, shortUrl, slugError, slugify, encodeDestination, decodeDestination } from '../../utils/domains/links';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { copyToClipboard } from '../../utils/clipboard';
import { uid } from '../../utils/id';
import { Button } from '../ui/Button';
import { useT } from '../../contexts/LocaleContext';

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function randomCode(len = 6): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

/**
 * The one-step shortener at the top of Short links (D270): paste any web address, get a short link copied.
 * Same safety check as the full editor; name, tags and source can be changed afterwards.
 */
export function QuickShortenBar() {
  const { t: tr } = useT();
  const { data, saveLink } = useDomains();
  const can = useCan('pages.edit');
  const team = useTeam();
  const navigate = useNavigate();
  const { mainHandle, host } = useMainLink();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<CampaignLink | null>(null);

  const shorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!can.allowed) return;
    const limit = linkCreationCheck(data);
    if (!limit.ok) {
      setError(limit.message);
      return;
    }
    const check = checkDestination(url);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    let slug = slugify(check.host.replace(/^www\./, '').split('.')[0] ?? '').slice(0, 20);
    if (!slug || slugError(slug, data)) slug = `${slug ? `${slug}-` : ''}${randomCode(4)}`;
    while (slugError(slug, data)) slug = randomCode();
    const now = new Date().toISOString();
    const link: CampaignLink = {
      id: uid('lnk'),
      slug,
      name: check.host.replace(/^www\./, ''),
      source: 'campaign',
      destination: decodeDestination(encodeDestination({ spaceId: MAIN_SPACE_ID, path: '' })),
      createdAt: now,
      archivedAt: null,
      endsAt: null,
      pausedAt: null,
      externalUrl: check.url,
      tags: [],
      history: [{ at: now, by: team.me.name, to: check.host }],
    };
    if (!saveLink(link)) {
      toast.error(tr('Couldn’t save the link'), { description: tr('Your browser storage may be full. Try again.') });
      return;
    }
    team.log('pages', `shortened ${check.host} to ${shortDisplay(mainHandle, slug, host)}`, `/app/links/${link.id}`);
    setMade(link);
    setUrl('');
    setError(null);
    void copyToClipboard(shortUrl(mainHandle, slug, host), tr('Short link copied'));
  };

  return (
    <section aria-labelledby="quick-shorten-heading" className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 md:p-5">
      <h2 id="quick-shorten-heading" className="text-label font-semibold text-fg">
        {tr('Shorten a link')}
      </h2>
      <form onSubmit={shorten} className="flex flex-col gap-2 sm:flex-row" noValidate>
        <label htmlFor="quick-shorten-url" className="sr-only">
          {tr('Web address to shorten')}
        </label>
        <div className="relative min-w-0 flex-1">
          <Link2Icon size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            id="quick-shorten-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder={tr('Paste a long link, e.g. https://docs.google.com/forms/…')}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? 'quick-shorten-error' : 'quick-shorten-hint'}
            disabled={!can.allowed}
            className="h-12 w-full rounded-md border border-line-strong bg-canvas pl-9 pr-3 text-body text-fg placeholder:text-fg-subtle focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60"
          />
        </div>
        <Button type="submit" size="lg" trailingIcon={ArrowRightIcon} disabled={!can.allowed || !url.trim()} className="shrink-0">
          Shorten
        </Button>
      </form>
      {error ? (
        <p id="quick-shorten-error" role="alert" className="text-caption text-danger">
          {tr(error)}
        </p>
      ) : (
        <p id="quick-shorten-hint" className="text-caption text-fg-subtle">
          {can.allowed ? tr('Any https address. It’s checked for safety now and on every tap. For one of your own pages, use New link.') : can.reason}
        </p>
      )}
      {made && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-success-soft px-3 py-2" role="status">
          <CheckIcon size={16} aria-hidden className="text-success" />
          <span className="min-w-0 flex-1 truncate font-mono text-label text-fg">{shortDisplay(mainHandle, made.slug, host)}</span>
          <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={() => void copyToClipboard(shortUrl(mainHandle, made.slug, host), tr('Short link copied'))}>
            Copy
          </Button>
          <Button size="sm" variant="tertiary" leadingIcon={BarChart3Icon} onClick={() => navigate(`/app/links/${made.id}`)}>
            Stats
          </Button>
        </div>
      )}
    </section>
  );
}
