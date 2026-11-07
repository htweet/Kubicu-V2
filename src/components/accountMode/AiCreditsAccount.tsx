import React from 'react';
import type { AiCreditFigures } from '../../types/accountMode';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { usePlan } from '../../contexts/PlanContext';
import { useT } from '../../contexts/LocaleContext';
import { accountAiCredits, sampleAiCredits, sampleUnsettled } from '../../data/accountModeSamples';
import { planOrder } from '../../data/plans';
import { UpgradeButton } from '../ui/UpgradeButton';
import { cn } from '../../utils/cn';

/** Account-mode credit figures (D540). Sample values scaled to the plan's server allowance. */
export function useAccountCredits(): AiCreditFigures {
  const plan = usePlan();
  const { simulation } = useAccountMode();
  const allowance = accountAiCredits[plan.id];
  const scale = allowance / sampleAiCredits.allowance;
  const committed = Math.round(sampleAiCredits.committed * scale);
  const held = Math.round(sampleAiCredits.held * scale);
  const unsettled = simulation === 'unsettledCharges' ? sampleUnsettled : { unsettledCharges: 0, unsettledCredits: 0 };
  return { allowance, committed, held, available: Math.max(0, allowance - committed - held), ...unsettled };
}

/** Help text for "On hold" and the quiet unsettled-charges note. Shared by both meters. */
export function AiCreditsNotes({ figures }: { figures: AiCreditFigures }) {
  const { t: tr } = useT();
  return (
    <>
      <p className="text-caption text-fg-subtle">{tr('On hold: held while AI work is running. Anything unused comes back when it finishes.')}</p>
      {figures.unsettledCharges > 0 && (
        <p className="text-caption text-fg-muted">{tr('{n} AI tasks stopped before reporting usage, so they were charged in full ({credits} credits).', { n: figures.unsettledCharges, credits: figures.unsettledCredits })}</p>
      )}
    </>
  );
}

/** AI credits meter in account mode: used, on hold and left (D540). */
export function AiCreditMeterAccount({ cost, className }: { cost?: number; className?: string }) {
  const { t: tr } = useT();
  const plan = usePlan();
  const f = useAccountCredits();
  const pctUsed = Math.min(100, (f.committed / Math.max(1, f.allowance)) * 100);
  const pctHeld = Math.min(100 - pctUsed, (f.held / Math.max(1, f.allowance)) * 100);
  const next = planOrder[planOrder.indexOf(plan.id) + 1];
  const out = cost !== undefined && cost > f.available;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-caption">
        <span className="text-fg-muted">
          {tr('Used: {used} · On hold: {held} · Left: {left}', { used: f.committed, held: f.held, left: f.available })}
          {cost ? ` · ${tr('This uses up to {n}', { n: cost })}` : ''}
        </span>
        <span className="text-fg-subtle">{tr('Monthly credits: {n}', { n: f.allowance })}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-sunken" role="meter" aria-label={tr('AI credits used')} aria-valuemin={0} aria-valuemax={f.allowance} aria-valuenow={f.committed + f.held} aria-valuetext={tr('Used: {used} · On hold: {held} · Left: {left}', { used: f.committed, held: f.held, left: f.available })}>
        <div className={cn('h-full', pctUsed + pctHeld >= 90 ? 'bg-warning' : 'ai-fill')} style={{ width: `${pctUsed}%` }} />
        <div className="h-full bg-line-strong" style={{ width: `${pctHeld}%` }} />
      </div>
      <AiCreditsNotes figures={f} />
      {out && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-caption text-fg">{tr('This needs up to {n} credits; {m} are left this month.', { n: cost ?? 0, m: f.available })}</p>
          {next && <UpgradeButton plan={next} feature="More AI credits" />}
        </div>
      )}
    </div>
  );
}
