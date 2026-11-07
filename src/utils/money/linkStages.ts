import type { LinkStage, PaymentLink } from '../../types/money';
import { builtInTemplates } from '../milestones';
import { uid } from '../id';

/** Staged payment links (D95): one payer pays a fixed amount in stages, in order. */
export const MAX_LINK_STAGES = 6;

export function isStaged(l: PaymentLink): boolean {
  return l.kind === 'fixed' && !!l.stages && l.stages.length > 1;
}

/** Amount per stage; the last stage takes any rounding so the stages add up exactly. */
export function linkStageAmounts(l: PaymentLink): Record<string, number> {
  const out: Record<string, number> = {};
  const stages = l.stages ?? [];
  let used = 0;
  stages.forEach((s, i) => {
    const amt = i === stages.length - 1 ? l.amountNgn - used : Math.round((l.amountNgn * s.pct) / 100);
    out[s.id] = amt;
    used += amt;
  });
  return out;
}

export function stagePaidOn(l: PaymentLink, stageId: string) {
  return l.payments.find((p) => p.stageId === stageId);
}

export function nextLinkStage(l: PaymentLink): LinkStage | null {
  return (l.stages ?? []).find((s) => !stagePaidOn(l, s.id)) ?? null;
}

export function linkStageProblems(stages: LinkStage[]): string | undefined {
  if (stages.length < 2) return 'Add at least two stages, or turn stages off.';
  if (stages.some((s) => !s.label.trim())) return 'Give every stage a name.';
  if (stages.some((s) => s.pct < 5)) return 'Each stage needs at least 5%.';
  const sum = stages.reduce((t, s) => t + s.pct, 0);
  if (sum !== 100) return `Stages add up to ${sum}% — they need to make 100%.`;
  return undefined;
}

export function defaultLinkStages(): LinkStage[] {
  return [
    { id: uid('pls'), label: 'Deposit', pct: 50 },
    { id: uid('pls'), label: 'Balance', pct: 50 },
  ];
}

/** Built-in milestone templates, reused as quick starts. */
export const linkStageTemplates = builtInTemplates.map((t) => ({ id: t.id, name: t.name, stages: t.stages.map((s) => ({ label: s.label, pct: s.pct })) }));

export function stagesFromLinkTemplate(id: string): LinkStage[] | null {
  const t = linkStageTemplates.find((x) => x.id === id);
  return t ? t.stages.map((s) => ({ id: uid('pls'), label: s.label, pct: s.pct })) : null;
}
