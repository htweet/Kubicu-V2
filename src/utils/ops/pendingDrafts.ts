import type { OpsData } from '../../types/ops';

/** AI-drafted messages from live automation runs that are waiting for the owner to approve (D137). */
export function pendingDrafts(automations: OpsData['automations']) {
  return automations.flatMap((a) =>
    a.runs.filter((r) => !r.test).flatMap((r) => r.steps.map((s, i) => ({ a, r, s, i })).filter((x) => x.s.status === 'waiting')),
  );
}
