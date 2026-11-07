import type { WorkspacePlan } from '../types/plan';
import { figureByKey } from '../data/adjustableFigures';

/**
 * Values KUBICU operations can change without a release (D465): example figures and plan names. Read straight from
 * the staff store and cached; modules register a refresh with `onOpsSettings`, which runs now and after every change.
 */
export interface PlanText {
  name?: string;
  intendedFor?: string;
}

interface OpsValues {
  figures: Record<string, number>;
  planNames: Partial<Record<WorkspacePlan, PlanText>>;
}

let cache: OpsValues | null = null;
const listeners = new Set<() => void>();

function load(): OpsValues {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('kubicu.admin') : null;
    const p = raw ? (JSON.parse(raw) as { figures?: Record<string, number>; planNames?: Partial<Record<WorkspacePlan, PlanText>> }) : {};
    cache = { figures: p.figures ?? {}, planNames: p.planNames ?? {} };
  } catch {
    cache = { figures: {}, planNames: {} };
  }
  return cache;
}

/** The current value of an adjustable figure, or its default. Out-of-range values fall back to the default. */
export function figure(key: string): number {
  const def = figureByKey[key];
  const v = (cache ?? load()).figures[key];
  if (!def) return typeof v === 'number' ? v : 0;
  return typeof v === 'number' && Number.isFinite(v) && v >= def.min && v <= def.max ? v : def.default;
}

/** Staff's name and "intended for" line for a plan, when they've changed them (D465). */
export function planTextOverride(plan: WorkspacePlan): PlanText {
  const t = (cache ?? load()).planNames[plan] ?? {};
  return { name: t.name?.trim() || undefined, intendedFor: t.intendedFor?.trim() || undefined };
}

/** Runs `fn` now and whenever staff change a value. */
export function onOpsSettings(fn: () => void): void {
  listeners.add(fn);
  fn();
}

if (typeof window !== 'undefined') {
  const refresh = () => {
    cache = null;
    listeners.forEach((fn) => fn());
  };
  window.addEventListener('kubicu:admin', refresh);
  window.addEventListener('storage', refresh);
}
