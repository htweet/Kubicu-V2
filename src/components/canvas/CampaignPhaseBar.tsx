import React from 'react';
import { CalendarRangeIcon } from 'lucide-react';
import type { CampaignPhase } from '../../types/page';
import { Segmented } from '../ui/Segmented';
import { phaseOrder } from '../../utils/campaign';
import { cn } from '../../utils/cn';

interface CampaignPhaseBarProps {
  /** The phase visitors see right now. */
  now: CampaignPhase;
  /** "Ends Fri 6pm", "Starts Sat 6pm" … */
  summary: string;
  labels: Record<CampaignPhase, string>;
  descriptions: Record<CampaignPhase, string>;
  phase: CampaignPhase;
  onChange: (p: CampaignPhase) => void;
  hiddenCount: number;
  className?: string;
}

/** Switch which version of a phased space the canvas shows: campaigns (D52) and Event spaces (D178). */
export function CampaignPhaseBar({ now, summary, labels, descriptions, phase, onChange, hiddenCount, className }: CampaignPhaseBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-line bg-raised px-3 py-2', className)} onClick={(e) => e.stopPropagation()}>
      <div className="flex min-w-0 items-center gap-2.5">
        <CalendarRangeIcon size={16} className="shrink-0 text-action" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-label font-medium text-fg">{descriptions[phase]}</p>
          <p className="truncate text-caption text-fg-subtle">
            {phase === now ? 'Visitors see this now' : `Visitors see ${labels[now]} now`} · {summary}
            {hiddenCount > 0 ? ` · ${hiddenCount} block${hiddenCount === 1 ? '' : 's'} not in this phase` : ''}
          </p>
        </div>
      </div>
      {/* Phones: the switcher takes the full width so each phase is a comfortable tap. */}
      <div className="w-full sm:w-auto">
        <Segmented<CampaignPhase>
          ariaLabel="Phase to preview"
          size="sm"
          fullWidth
          value={phase}
          onChange={onChange}
          options={phaseOrder.map((p) => ({ value: p, label: p === now ? `${labels[p]} · now` : labels[p] }))}
        />
      </div>
    </div>
  );
}
