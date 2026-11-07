import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, CopyIcon, Link2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useEditor } from '../../contexts/EditorContext';
import { useMainLink } from '../../hooks/useMainLink';
import { linkSourceOptions } from '../domains/CampaignLinkDialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import type { CampaignLink } from '../../types/domains';
import type { SourceId } from '../../types/analytics';
import { linkEnded, shortDisplay, shortUrl, slugError, slugify } from '../../utils/domains/links';
import { linkCreationCheck } from '../../utils/domains/linkRules';
import { findPage, pageTitle } from '../../utils/sitePages';
import { copyToClipboard } from '../../utils/clipboard';
import { uid } from '../../utils/id';

interface Props {
  /** Shown in the publish dialog: tighter copy, no heading (the dialog has its own). */
  compact?: boolean;
}

/**
 * Make a tracked short link for the page being edited, without leaving the canvas (D269).
 * Uses the same Campaign links as Domains & QR, so it shows in Analytics and can be managed there.
 */
export function ShortLinkQuick({ compact = false }: Props) {
  const { data, saveLink } = useDomains();
  const { currentSpace } = useWorkspace();
  const { state } = useEditor();
  const team = useTeam();
  const can = useCan('pages.edit');
  const { mainHandle, host } = useMainLink();

  const path = findPage(state.site, state.activePageId)?.path ?? '';
  const pageLabel = state.activePageId ? pageTitle(state.site, state.activePageId) : currentSpace.kind === 'main' ? 'Main page' : currentSpace.name;
  const existing = useMemo(
    () => data.links.filter((l) => !l.externalUrl && !l.whatsapp && !linkEnded(l) && l.destination.spaceId === currentSpace.id && l.destination.path === path),
    [data.links, currentSpace.id, path],
  );

  const [source, setSource] = useState<SourceId>('whatsapp');
  const base = slugify(`${currentSpace.kind === 'main' ? state.draft.handle || 'page' : currentSpace.name}${path ? `-${path}` : ''}`) || 'page';
  const suggested = useMemo(() => {
    const first = slugify(`${base}-${source === 'campaign' ? 'link' : source}`);
    if (!slugError(first, data)) return first;
    for (let n = 2; n < 50; n++) {
      const s = slugify(`${first.slice(0, 36)}-${n}`);
      if (!slugError(s, data)) return s;
    }
    return '';
  }, [base, source, data]);
  const [slug, setSlug] = useState('');
  const [touched, setTouched] = useState(false);
  const [tried, setTried] = useState(false);
  const [justMade, setJustMade] = useState<string | null>(null);
  const effective = touched ? slug : suggested;
  const error = slugError(effective, data);

  const create = () => {
    setTried(true);
    if (error || !can.allowed) return;
    const limit = linkCreationCheck(data);
    if (!limit.ok) {
      toast.error('Too many new links', { description: limit.message });
      return;
    }
    const sourceLabel = linkSourceOptions.find((o) => o.value === source)?.label.split(' (')[0] ?? 'Link';
    const link: CampaignLink = {
      id: uid('lnk'),
      slug: effective,
      name: `${pageLabel} · ${sourceLabel}`,
      source,
      destination: { spaceId: currentSpace.id, path },
      createdAt: new Date().toISOString(),
      archivedAt: null,
      endsAt: null,
      pausedAt: null,
      externalUrl: null,
      tags: [],
      history: [{ at: new Date().toISOString(), by: team.me.name, to: pageLabel }],
    };
    if (!saveLink(link)) {
      toast.error('Couldn’t save the link', { description: 'Your browser storage may be full. Try again.' });
      return;
    }
    team.log('pages', `created the short link ${shortDisplay(mainHandle, effective, host)}`, `/app/links/${link.id}`);
    setJustMade(link.id);
    setTouched(false);
    setSlug('');
    setTried(false);
    void copyToClipboard(shortUrl(mainHandle, effective, host), 'Short link created and copied');
  };

  return (
    <div className="flex flex-col gap-3">
      {!compact && (
        <div>
          <h3 id="shortlink-heading" className="text-label font-medium text-fg">
            Short link
          </h3>
          <p className="text-caption text-fg-subtle">
            A short, tracked address for <span className="font-medium text-fg-muted">{pageLabel}</span> — easy to type, print or paste in a bio. Each link shows up in Analytics by where you shared it.
          </p>
        </div>
      )}

      {existing.length > 0 && (
        <ul className="flex flex-col gap-1.5" aria-label="Short links for this page">
          {existing.slice(0, 4).map((l) => (
            <li key={l.id} className="flex items-center gap-2 rounded-md border border-line bg-canvas py-1.5 pl-3 pr-1.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-caption text-fg">{shortDisplay(mainHandle, l.slug, host)}</span>
                <span className="block truncate text-caption text-fg-subtle">
                  {linkSourceOptions.find((o) => o.value === l.source)?.label ?? 'Link'}
                  {l.pausedAt ? ' · paused' : ''}
                  {l.id === justMade ? ' · just made' : ''}
                </span>
              </span>
              <Button
                variant="tertiary"
                size="sm"
                leadingIcon={l.id === justMade ? CheckIcon : CopyIcon}
                onClick={() => void copyToClipboard(shortUrl(mainHandle, l.slug, host), 'Short link copied')}
                aria-label={`Copy ${shortDisplay(mainHandle, l.slug, host)}`}
              >
                Copy
              </Button>
            </li>
          ))}
          {existing.length > 4 && <li className="text-caption text-fg-subtle">+{existing.length - 4} more in Campaign links</li>}
        </ul>
      )}

      <div className="flex flex-col gap-3 rounded-md bg-sunken p-3">
        <SelectInput
          id={`sl-source-${compact ? 'pub' : 'set'}`}
          label="Where will you share it?"
          value={source}
          onChange={(e) => setSource(e.target.value as SourceId)}
          options={linkSourceOptions}
        />
        <TextInput
          id={`sl-slug-${compact ? 'pub' : 'set'}`}
          label="Short name"
          value={effective}
          onChange={(e) => {
            setTouched(true);
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40));
          }}
          error={(tried || touched) && error ? error : undefined}
          hint={!error ? `Becomes ${shortDisplay(mainHandle, effective, host)}. Can’t be changed once shared.` : undefined}
        />
        <Button leadingIcon={Link2Icon} onClick={create} disabled={!can.allowed} className="self-start">
          Create and copy
        </Button>
        {!can.allowed && <p className="text-caption text-fg-subtle">{can.reason}</p>}
      </div>

      <p className="text-caption text-fg-subtle">
        {state.publishedAt || compact ? '' : 'It works once this page is published. '}
        Pause, tag or point it somewhere else in{' '}
        <Link to="/app/links" className="font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          Short links
        </Link>
        , where each link has full click stats
        .
      </p>
    </div>
  );
}
