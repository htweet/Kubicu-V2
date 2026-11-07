import type { AiApproval, AiRun, AiRunLimitTable, AiPerson } from '../types/aiRuns';

/**
 * Illustrative AI runs and approvals for account mode (Batch 2, D549). Sits beside accountModeSamples.ts;
 * engineering replaces both with the API. Names, numbers and actions are examples.
 */

/** How many runs each plan runs at once, and how many wait in the queue (from the server). */
export const aiRunLimits: AiRunLimitTable = {
  free: { atOnce: 1, queue: 5 },
  creator: { atOnce: 2, queue: 10 },
  pro: { atOnce: 3, queue: 20 },
  business: { atOnce: 5, queue: 50 },
  agency: { atOnce: 10, queue: 100 },
  enterprise: { atOnce: 20, queue: 200 },
};
export const AI_RUN_MAX_MINUTES = 15;
export const AI_RUN_MAX_STEPS = 25;
export const AI_APPROVAL_EXPIRY_HOURS = 48;
/** Credits a new sample run reserves. */
export const SAMPLE_RUN_ESTIMATE = 8;

export const me: AiPerson = { id: 'me', name: 'You' };
const tolu: AiPerson = { id: 'm_tolu', name: 'Tolu Bello' };
const amaka: AiPerson = { id: 'm_amaka', name: 'Amaka Obi' };
/** Shown when someone else decided an approval first. */
export const otherApprover = amaka;

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
const ahead = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

/** Fresh copies with times relative to now. */
export function sampleAiRuns(): AiRun[] {
  return [
    {
      id: 'run_live',
      automationId: 'a_weekly',
      automationName: 'Weekly sales summary',
      status: 'running',
      startedBy: me,
      startedAt: ago(2),
      creditsEstimate: 8,
      creditsUsed: 3,
      steps: [
        { id: 's1', at: ago(2), kind: 'tool', summary: 'Read last week’s orders', status: 'done' },
        { id: 's2', at: ago(1), kind: 'step', summary: 'Counted 42 orders and 3 refunds', status: 'done' },
        { id: 's3', at: ago(0), kind: 'step', summary: 'Writing the summary', status: 'running' },
      ],
      script: [
        { id: 's4', at: '', kind: 'step', summary: 'Checked the summary against the order totals', status: 'running' },
        { id: 's5', at: '', kind: 'tool', summary: 'Saved the report to your notifications', status: 'running' },
      ],
      summary: 'Last week: 42 orders, 3 refunds. Best seller: Ankara wrap dress.',
      outputs: ['Report saved to your notifications'],
    },
    { id: 'run_queued', automationId: 'a_leads', automationName: 'Draft replies to new leads', status: 'queued', startedBy: tolu, startedAt: ago(1), creditsEstimate: 6, creditsUsed: 0, queueAhead: 2, steps: [] },
    {
      id: 'run_wait',
      automationId: 'a_refund',
      automationName: 'Refund follow-up',
      status: 'waiting_approval',
      startedBy: tolu,
      startedAt: ago(25),
      creditsEstimate: 6,
      creditsUsed: 4,
      steps: [
        { id: 'w1', at: ago(25), kind: 'tool', summary: 'Read order #1043', status: 'done' },
        { id: 'w2', at: ago(24), kind: 'step', summary: 'Drafted an apology message', status: 'done' },
        { id: 'w3', at: ago(24), kind: 'approval', summary: 'Waiting for approval to send 1 WhatsApp message', status: 'waiting', approvalId: 'ap_pending' },
      ],
    },
    {
      id: 'run_ok',
      automationId: 'a_restock',
      automationName: 'Restock reminder',
      status: 'succeeded',
      startedBy: me,
      startedAt: ago(180),
      endedAt: ago(176),
      creditsEstimate: 6,
      creditsUsed: 5,
      steps: [
        { id: 'o1', at: ago(180), kind: 'tool', summary: 'Read stock levels', status: 'done' },
        { id: 'o2', at: ago(178), kind: 'step', summary: 'Found 2 products below 5 left', status: 'done' },
        { id: 'o3', at: ago(176), kind: 'tool', summary: 'Created a task for you', status: 'done' },
      ],
      summary: '2 products are running low.',
      outputs: ['Task: reorder Ankara wrap dress (size M)', 'Task: reorder Adire scarf'],
    },
    {
      id: 'run_fail',
      automationId: 'a_checkout',
      automationName: 'Unfinished checkout follow-up',
      status: 'failed',
      startedBy: tolu,
      startedAt: ago(300),
      endedAt: ago(299),
      creditsEstimate: 6,
      creditsUsed: 2,
      steps: [{ id: 'f1', at: ago(300), kind: 'tool', summary: 'Read unfinished checkouts', status: 'failed' }],
      reason: 'The checkout list couldn’t be read. Nothing was sent.',
    },
    {
      id: 'run_timeout',
      automationId: 'a_monthly',
      automationName: 'Monthly customer report',
      status: 'timed_out',
      startedBy: me,
      startedAt: ago(1440),
      endedAt: ago(1425),
      creditsEstimate: 12,
      creditsUsed: 12,
      steps: [
        { id: 't1', at: ago(1440), kind: 'tool', summary: 'Read 1,204 contacts', status: 'done' },
        { id: 't2', at: ago(1430), kind: 'step', summary: 'Grouping contacts by last order', status: 'failed' },
      ],
      reason: 'It reached the 15-minute limit before finishing.',
    },
    {
      id: 'run_cancel',
      automationId: 'a_price',
      automationName: 'Price check',
      status: 'cancelled',
      startedBy: me,
      startedAt: ago(2000),
      endedAt: ago(1998),
      endedBy: me,
      creditsEstimate: 6,
      creditsUsed: 2,
      steps: [
        { id: 'c1', at: ago(2000), kind: 'tool', summary: 'Tagged 12 contacts “price-check”', status: 'done' },
        { id: 'c2', at: ago(1999), kind: 'approval', summary: 'Approval withdrawn when the run was cancelled', status: 'skipped', approvalId: 'ap_withdrawn' },
      ],
    },
    {
      id: 'run_rejected',
      automationId: 'a_quiet',
      automationName: 'Discount for quiet customers',
      status: 'rejected',
      startedBy: tolu,
      startedAt: ago(2900),
      endedAt: ago(2800),
      endedBy: amaka,
      comment: 'Not this month — we’re already running a sale.',
      creditsEstimate: 6,
      creditsUsed: 3,
      steps: [
        { id: 'r1', at: ago(2900), kind: 'tool', summary: 'Found 230 contacts with no order in 90 days', status: 'done' },
        { id: 'r2', at: ago(2899), kind: 'approval', summary: 'Approval to email a 10% code was rejected', status: 'failed', approvalId: 'ap_rejected' },
      ],
    },
  ];
}

export function sampleAiApprovals(): AiApproval[] {
  return [
    {
      id: 'ap_pending',
      runId: 'run_wait',
      automationName: 'Refund follow-up',
      action: 'Send 1 WhatsApp message to Chidi Okeke (+234 803 *** 4471): the apology drafted in step 2.',
      requestedBy: tolu,
      requestedAt: ago(24),
      expiresAt: ahead(AI_APPROVAL_EXPIRY_HOURS - 0.4),
      status: 'pending',
    },
    { id: 'ap_rejected', runId: 'run_rejected', automationName: 'Discount for quiet customers', action: 'Email 230 contacts a 10% discount code (QUIET10), valid 7 days.', requestedBy: tolu, requestedAt: ago(2899), expiresAt: ago(2899 - AI_APPROVAL_EXPIRY_HOURS * 60), status: 'rejected', decidedBy: amaka, decidedAt: ago(2800), comment: 'Not this month — we’re already running a sale.' },
    { id: 'ap_withdrawn', runId: 'run_cancel', automationName: 'Price check', action: 'Change the price of 3 products to match the new supplier list.', requestedBy: me, requestedAt: ago(1999), expiresAt: ago(1999 - AI_APPROVAL_EXPIRY_HOURS * 60), status: 'withdrawn' },
  ];
}
