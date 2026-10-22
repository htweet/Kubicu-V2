import React from 'react';
import { CalendarRangeIcon } from 'lucide-react';
import type { CampaignPhase, CampaignSettings } from '../../types/page';
import { Segmented } from '../ui/Segmented';
import { campaignPhase, phaseDescriptions, phaseLabels, phaseOrder, phaseSummary } from '../../utils/campaign';
import { cn } from '../../utils/cn';

interface CampaignPhaseBarProps {
  campaign: CampaignSettings;
  phase: CampaignPhase;
  onChange: (p: CampaignPhase) => void;
  hiddenCount: number;
  className?: string;
}

/** Switch which version of a campaign the canvas shows: Before, Live or Ended (D52). */
export function CampaignPhaseBar({ campaign, phase, onChange, hiddenCount, className }: CampaignPhaseBarProps) {
  const now = campaignPhase(campaign);
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-line bg-raised px-3 py-2', className)} onClick={(e) => e.stopPropagation()}>
      <div className="flex min-w-0 items-center gap-2.5">
        <CalendarRangeIcon size={16} className="shrink-0 text-action" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-label font-medium text-fg">{phaseDescriptions[phase]}</p>
          <p className="truncate text-caption text-fg-subtle">
            {phase === now ? 'Visitors see this now' : `Visitors see ${phaseLabels[now]} now`} · {phaseSummary(campaign)}
            {hiddenCount > 0 ? ` · ${hiddenCount} block${hiddenCount === 1 ? '' : 's'} not in this phase` : ''}
          </p>
        </div>
      </div>
      {/* Phones: the switcher takes the full width so each phase is a comfortable tap. */}
      <div className="w-full sm:w-auto">
        <Segmented<CampaignPhase>
          ariaLabel="Campaign phase to preview"
          size="sm"
          fullWidth
          value={phase}
          onChange={onChange}
          options={phaseOrder.map((p) => ({ value: p, label: p === now ? `${phaseLabels[p]} · now` : phaseLabels[p] }))} />
        
      </div>
    </div>);

}