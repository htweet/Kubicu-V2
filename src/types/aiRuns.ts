import type { WorkspacePlan } from './plan';

/**
 * AI runs and approvals (Batch 2, D549). FIELD NAMES ARE PROVISIONAL: the run store (M3.1) is still being
 * built. Engineering renames fields here and in data/aiRunSamples.ts; the screens read only these shapes.
 */

export type AiRunStatus = 'queued' | 'running' | 'waiting_approval' | 'cancelling' | 'succeeded' | 'failed' | 'cancelled' | 'timed_out' | 'rejected';

export type AiRunStepStatus = 'done' | 'running' | 'waiting' | 'failed' | 'skipped';

export interface AiPerson {
  /** 'me' stands for the signed-in person; 'system' for Kubicu. */
  id: string;
  name: string;
}

export interface AiRunStep {
  id: string;
  at: string;
  /** 'tool' = an action carried out in the workspace (these are listed when a run is cancelled). */
  kind: 'step' | 'tool' | 'approval';
  /** Plain summary written by Kubicu from the real action, never AI-written text. */
  summary: string;
  status: AiRunStepStatus;
  approvalId?: string;
}

export interface AiRun {
  id: string;
  automationId: string;
  automationName: string;
  status: AiRunStatus;
  startedBy: AiPerson;
  startedAt: string;
  endedAt?: string;
  creditsEstimate: number;
  creditsUsed: number;
  /** Queued only: runs ahead of this one. */
  queueAhead?: number;
  steps: AiRunStep[];
  /** Succeeded: what the run produced. */
  outputs?: string[];
  summary?: string;
  /** Failed / timed out: the reason shown to the person. */
  reason?: string;
  /** Cancelled or rejected: who did it. */
  endedBy?: AiPerson;
  comment?: string;
  /** Prototype only: the steps still to come, so the live timeline can move. Not a server field. */
  script?: AiRunStep[];
}

export type AiApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'withdrawn';

export interface AiApproval {
  id: string;
  runId: string;
  automationName: string;
  /** Exactly what will happen, as a fixed summary of the real action. */
  action: string;
  requestedBy: AiPerson;
  requestedAt: string;
  expiresAt: string;
  status: AiApprovalStatus;
  decidedBy?: AiPerson;
  decidedAt?: string;
  comment?: string;
}

export interface AiRunLimits {
  atOnce: number;
  queue: number;
}

export type AiRunLimitTable = Record<WorkspacePlan, AiRunLimits>;
