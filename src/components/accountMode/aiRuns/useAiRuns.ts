import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AccountFailure, AccountResult } from '../../../types/accountMode';
import type { AiApproval, AiRun, AiRunLimits } from '../../../types/aiRuns';
import { useAccountMode } from '../../../contexts/AccountModeContext';
import { useTeam } from '../../../contexts/TeamContext';
import { usePlan } from '../../../contexts/PlanContext';
import { workflowPermissions, workflowPermissionReasons, type WorkflowPermission } from '../../../data/permissions';
import { aiRunLimits, me, otherApprover, sampleAiApprovals, sampleAiRuns, AI_APPROVAL_EXPIRY_HOURS } from '../../../data/aiRunSamples';
import { simulate } from '../../../utils/accountModeSim';

type LoadStatus = 'loading' | 'loaded' | 'error';
export type DecideOutcome = { ok: true } | { ok: false; failure: AccountFailure };

const now = () => new Date().toISOString();
const ended = (s: AiRun['status']) => s === 'succeeded' || s === 'failed' || s === 'cancelled' || s === 'timed_out' || s === 'rejected';

/**
 * State for AI runs and approvals in account mode (Batch 2, D549). Every change goes through `simulate`;
 * engineering swaps that for the API and replaces `advance` with the server's live step feed.
 */
export function useAiRuns() {
  const { simulation, withStepUp } = useAccountMode();
  const team = useTeam();
  const plan = usePlan();
  const [runs, setRuns] = useState<AiRun[]>([]);
  const [approvals, setApprovals] = useState<AiApproval[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [failure, setFailure] = useState<AccountFailure | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setFailure(null);
    const empty = simulation === 'empty';
    const r = await simulate('runs.load', simulation, { data: { runs: empty ? [] : sampleAiRuns(), approvals: empty ? [] : sampleAiApprovals() } });
    if (!r.ok) {
      setFailure(r);
      setStatus('error');
      return;
    }
    setRuns(r.data.runs);
    setApprovals(r.data.approvals);
    setStatus('loaded');
  }, [simulation]);

  useEffect(() => {
    void load();
  }, [load]);

  // "ownRequest" previews separation of duties: the pending request is shown as yours.
  const shownApprovals = useMemo(() => (simulation === 'ownRequest' ? approvals.map((a) => (a.status === 'pending' ? { ...a, requestedBy: me } : a)) : approvals), [approvals, simulation]);

  const can = useCallback(
    (p: WorkflowPermission): { allowed: boolean; reason: string } => ({ allowed: workflowPermissions[team.role].includes(p), reason: workflowPermissionReasons[p] }),
    [team.role],
  );
  const limits: AiRunLimits = aiRunLimits[plan.id];
  const active = runs.filter((r) => r.status === 'running' || r.status === 'waiting_approval' || r.status === 'cancelling').length;
  const queued = runs.filter((r) => r.status === 'queued').length;

  const start = async (automationId: string, automationName: string, estimate: number): Promise<AccountResult> => {
    const res = await simulate('run.start', simulation);
    if (!res.ok) return res;
    const ahead = Math.max(0, active + queued - limits.atOnce + 1);
    const run: AiRun = {
      id: `run_${Date.now()}`,
      automationId,
      automationName,
      status: ahead > 0 ? 'queued' : 'running',
      startedBy: me,
      startedAt: now(),
      creditsEstimate: estimate,
      creditsUsed: 0,
      queueAhead: ahead > 0 ? ahead : undefined,
      steps: ahead > 0 ? [] : [{ id: 'n1', at: now(), kind: 'step', summary: 'Starting', status: 'running' }],
      script: [{ id: 'n2', at: '', kind: 'step', summary: 'Working through the automation’s steps', status: 'running' }],
      outputs: ['Result saved to your notifications'],
    };
    setRuns((rs) => [run, ...rs]);
    return { ok: true, data: undefined };
  };

  const cancel = async (runId: string): Promise<AccountResult> => {
    const before = runs.find((r) => r.id === runId);
    setRuns((rs) => rs.map((r) => (r.id === runId ? { ...r, status: 'cancelling' } : r)));
    const res = await withStepUp(() => simulate('run.cancel', simulation));
    if (!res.ok) {
      if (before) setRuns((rs) => rs.map((r) => (r.id === runId ? before : r)));
      return res;
    }
    setRuns((rs) =>
      rs.map((r) =>
        r.id === runId
          ? { ...r, status: 'cancelled', endedAt: now(), endedBy: me, script: undefined, steps: r.steps.map((s) => (s.status === 'running' || s.status === 'waiting' ? { ...s, status: 'skipped' } : s)) }
          : r,
      ),
    );
    setApprovals((as) => as.map((a) => (a.runId === runId && a.status === 'pending' ? { ...a, status: 'withdrawn' } : a)));
    return res;
  };

  const decide = async (approvalId: string, decision: 'approve' | 'reject', comment: string): Promise<DecideOutcome> => {
    const approval = approvals.find((a) => a.id === approvalId);
    if (!approval) return { ok: true };
    const res = await withStepUp(() => simulate('approval.decide', simulation));
    if (!res.ok) {
      if (res.code === 'approval_expired') {
        setApprovals((as) => as.map((a) => (a.id === approvalId ? { ...a, status: 'expired' } : a)));
        setRuns((rs) => rs.map((r) => (r.id === approval.runId ? { ...r, status: 'failed', endedAt: now(), reason: `The approval expired after ${AI_APPROVAL_EXPIRY_HOURS} hours, so the run stopped.`, steps: r.steps.map((s) => (s.approvalId === approvalId ? { ...s, status: 'failed' } : s)) } : r)));
      }
      if (res.code === 'already_decided') {
        setApprovals((as) => as.map((a) => (a.id === approvalId ? { ...a, status: 'approved', decidedBy: otherApprover, decidedAt: now() } : a)));
        setRuns((rs) => rs.map((r) => (r.id === approval.runId ? finishApproved(r, approvalId) : r)));
      }
      return { ok: false, failure: res };
    }
    const decidedAt = now();
    const c = comment.trim() || undefined;
    setApprovals((as) => as.map((a) => (a.id === approvalId ? { ...a, status: decision === 'approve' ? 'approved' : 'rejected', decidedBy: me, decidedAt, comment: c } : a)));
    setRuns((rs) =>
      rs.map((r) => {
        if (r.id !== approval.runId) return r;
        if (decision === 'approve') return finishApproved(r, approvalId);
        return { ...r, status: 'rejected', endedAt: decidedAt, endedBy: me, comment: c, steps: r.steps.map((s) => (s.approvalId === approvalId ? { ...s, status: 'failed' } : s)) };
      }),
    );
    return { ok: true };
  };

  /** Prototype only: move a running sample run on by one step. */
  const advance = useCallback(
    (runId: string) => {
      setRuns((rs) =>
        rs.map((r) => {
          if (r.id !== runId || r.status !== 'running') return r;
          const steps = r.steps.map((s) => (s.status === 'running' ? { ...s, status: 'done' as const } : s));
          if (simulation === 'runFailed') {
            return { ...r, status: 'failed', endedAt: now(), script: undefined, reason: 'A step couldn’t finish. Actions already carried out are listed above.', steps: r.steps.map((s) => (s.status === 'running' ? { ...s, status: 'failed' as const } : s)) };
          }
          if (simulation === 'runTimedOut') {
            return { ...r, status: 'timed_out', endedAt: now(), script: undefined, creditsUsed: r.creditsEstimate, reason: 'It reached the 15-minute limit before finishing.', steps: r.steps.map((s) => (s.status === 'running' ? { ...s, status: 'failed' as const } : s)) };
          }
          const [next, ...rest] = r.script ?? [];
          if (!next) return { ...r, steps, status: 'succeeded', endedAt: now(), script: undefined };
          return { ...r, steps: [...steps, { ...next, at: now() }], script: rest, creditsUsed: Math.min(r.creditsEstimate, r.creditsUsed + 1) };
        }),
      );
    },
    [simulation],
  );

  return { runs, approvals: shownApprovals, status, failure, load, can, limits, start, cancel, decide, advance, isEnded: ended };
}

function finishApproved(r: AiRun, approvalId: string): AiRun {
  const at = now();
  return {
    ...r,
    status: 'succeeded',
    endedAt: at,
    creditsUsed: Math.min(r.creditsEstimate, r.creditsUsed + 1),
    steps: [...r.steps.map((s) => (s.approvalId === approvalId ? { ...s, status: 'done' as const, summary: 'Approved' } : s)), { id: `${approvalId}_done`, at, kind: 'tool', summary: 'Sent the approved message', status: 'done' }],
    summary: r.summary ?? 'The approved action was carried out.',
    outputs: r.outputs ?? ['1 WhatsApp message sent'],
  };
}

export type AiRunsState = ReturnType<typeof useAiRuns>;
