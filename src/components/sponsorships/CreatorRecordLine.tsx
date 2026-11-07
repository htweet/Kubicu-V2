import React from 'react';
import { BadgeCheckIcon } from 'lucide-react';
import type { SponsorBrief } from '../../types/sponsorship';
import { useT } from '../../contexts/LocaleContext';
import { creatorRecord } from '../../utils/sponsorships';
import { Badge } from '../ui/Badge';

/** What a brand can check about a creator before accepting them (D461): identity check and their deal record on KUBICU. */
export function CreatorRecordLine({ briefs, creatorWorkspaceId }: { briefs: SponsorBrief[]; creatorWorkspaceId: string }) {
  const { t: tr } = useT();
  const r = creatorRecord(briefs, creatorWorkspaceId);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption text-fg-muted">
      {r.verified ? (
        <Badge tone="success" icon={BadgeCheckIcon}>
          {tr('Identity checked')}
        </Badge>
      ) : (
        <Badge tone="neutral">{tr('Identity not checked yet')}</Badge>
      )}
      <span>{tr('Deals finished on KUBICU: {n}', { n: r.completed })}</span>
      {r.lostProblems > 0 && <span className="text-warning">{tr('Problems decided for the brand: {n}', { n: r.lostProblems })}</span>}
    </div>
  );
}
