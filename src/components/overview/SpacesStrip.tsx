import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { spaceKinds } from '../../data/spaceKinds';
import { readSpacePage, spaceStatus } from '../../utils/spaces';
import { publicUrl } from '../../utils/format';
import { spaceStatusBadge } from '../spaces/SpacesList';
import { Badge } from '../ui/Badge';
import { useCommerce } from '../../contexts/CommerceContext';
import { roomProgress, roomStateLabel } from '../../utils/dealRoom';
import { campaignPhase, campaignTotals, phaseLabels, phaseSummary } from '../../utils/campaign';
import { useT } from '../../contexts/LocaleContext';

/** Live and scheduled campaigns and DealRooms, under the main page on Overview. */
export function SpacesStrip() {
  const { t: tr } = useT();
  const { current, switchSpace } = useWorkspace();
  const commerce = useCommerce().data;
  const navigate = useNavigate();
  const extras = (current.spaces ?? [])
    .filter((s) => !s.archivedAt)
    .map((s) => {
      const page = readSpacePage(current.id, s.id);
      return { space: s, page, status: spaceStatus(s, page, false) };
    });
  const running = extras.filter((e) => e.status === 'live' || e.status === 'scheduled');
  const drafts = extras.length - running.length;
  if (extras.length === 0) return null;

  return (
    <section aria-labelledby="spaces-strip-heading" className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="spaces-strip-heading" className="text-label font-semibold text-fg">
          {tr('Campaigns & DealRooms')}
        </h2>
        <Link to="/app/spaces" className="inline-flex items-center gap-1 text-caption font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {drafts > 0 ? `${tr('Drafts: {n}', { n: drafts })} · ` : ''}
          {tr('All spaces')} <ArrowRightIcon size={13} aria-hidden />
        </Link>
      </div>
      {running.length === 0 ? (
        <p className="mt-2 text-caption text-fg-subtle">{tr('Nothing live right now. Publish a campaign or DealRoom from My Spaces.')}</p>
      ) : (
        <ul className="scroll-quiet mt-3 flex gap-3 overflow-x-auto pb-1">
          {running.map(({ space, page, status }) => {
            const K = spaceKinds[space.kind];
            return (
              <li key={space.id} className="w-[300px] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    switchSpace(space.id);
                    navigate('/app/canvas');
                  }}
                  className="flex w-full items-center gap-3 rounded-md border border-line bg-raised px-3.5 py-3 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-action-soft text-action">
                    <K.icon size={17} strokeWidth={2.25} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label font-semibold text-fg">{space.name}</span>
                    <span className="block truncate font-mono text-caption text-fg-subtle">{page ? publicUrl(page.draft.handle) : tr(K.label)}</span>
                    {page?.published?.dealRoom &&
                      (() => {
                        const pr = roomProgress(page.published.dealRoom, page.published.handle, commerce);
                        return (
                          <span className="block truncate text-caption text-fg-muted">
                            {tr(roomStateLabel[pr.state])} ·{' '}
                            {page.published.dealRoom.type === 'goal'
                              ? tr('{count} of {target} joined', { count: pr.count, target: pr.target })
                              : tr('{remaining} of {target} left', { remaining: pr.remaining, target: pr.target })}
                          </span>
                        );
                      })()}
                    {page?.published?.campaign && (
                      <span className="block truncate text-caption text-fg-muted">
                        {tr(phaseLabels[campaignPhase(page.published.campaign)])} · {phaseSummary(page.published.campaign)}
                        {(() => {
                          const t = campaignTotals(commerce, page.published.handle);
                          return t.orders ? ` · ${tr('Orders: {n}', { n: t.orders })}` : '';
                        })()}
                      </span>
                    )}
                  </span>
                  <Badge tone={spaceStatusBadge[status].tone} dot>
                    {tr(spaceStatusBadge[status].label)}
                  </Badge>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
