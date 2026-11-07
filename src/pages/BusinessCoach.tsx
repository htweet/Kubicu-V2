import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, CheckIcon, LockIcon, RefreshCwIcon, SparklesIcon, TrendingDownIcon, TrendingUpIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCommerce } from '../contexts/CommerceContext';
import { usePlan } from '../contexts/PlanContext';
import { useUpgrade } from '../contexts/UpgradeContext';
import { planAtLeast } from '../data/plans';
import { useLocalStore } from '../hooks/useLocalStore';
import { useMoney } from '../hooks/useMoney';
import { useAiUsage } from '../hooks/useAiUsage';
import { COACH_COST, COACH_PLAN, answer, buildBrief, coachKey, coachQuestions, emptyCoach, type CoachQuestionId, type Impact } from '../utils/businessCoach';
import { formatNgn, formatTimestamp } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InlineAlert } from '../components/ui/InlineAlert';
import { AiPreviewTag } from '../components/ai/AiPreviewTag';
import { cn } from '../utils/cn';

const impactLabel: Record<Impact, string> = { high: 'Biggest impact', medium: 'Worth doing', low: 'When you can' };
const impactTone: Record<Impact, 'danger' | 'warning' | 'neutral'> = { high: 'danger', medium: 'warning', low: 'neutral' };

/** AI Business Coach (D104): a weekly brief and answers built only from the seller's own records. */
export function BusinessCoach() {
  const { current } = useWorkspace();
  const commerce = useCommerce();
  const money = useMoney(current.id);
  const plan = usePlan();
  const { openUpgrade } = useUpgrade();
  const ai = useAiUsage();
  const reduce = useReducedMotion();
  const unlocked = planAtLeast(plan.id, COACH_PLAN);
  const { data, update } = useLocalStore(coachKey(current.id), emptyCoach);
  const [asking, setAsking] = useState<CoachQuestionId | null>(null);

  const brief = useMemo(() => buildBrief(commerce.data, money.data), [commerce.data, money.data]);
  const moves = brief.moves.filter((m) => !data.dismissed.includes(m.id));
  const open = moves.filter((m) => !data.done.includes(m.id));
  const done = moves.filter((m) => data.done.includes(m.id));
  const change = brief.revenuePrev7 ? Math.round(((brief.revenue7 - brief.revenuePrev7) / brief.revenuePrev7) * 100) : null;

  const gate = () => {
    if (!unlocked) {
      openUpgrade({ plan: COACH_PLAN, feature: 'AI Business Coach' });
      return false;
    }
    if (!ai.featureOn('coach')) {
      toast('Business Coach is paused by KUBICU', { description: 'This week’s brief still shows. Refreshing and questions are back soon.' });
      return false;
    }
    if (!ai.canSpend(COACH_COST)) {
      toast.error('Out of AI credits this month', { description: `They reset on ${ai.resetsOn}. Upgrade for more.` });
      return false;
    }
    return true;
  };

  const refresh = () => {
    if (!gate()) return;
    ai.spend(COACH_COST, 'Business Coach');
    update((d) => ({ ...d, briefAt: new Date().toISOString(), done: [], dismissed: [] }));
    toast.success('Brief refreshed', { description: `Used ${COACH_COST} AI credit.` });
  };

  const ask = (id: CoachQuestionId) => {
    if (!gate()) return;
    setAsking(id);
    window.setTimeout(() => {
      const a = answer(id, commerce.data, money.data);
      const q = coachQuestions.find((x) => x.id === id)?.label ?? '';
      ai.spend(COACH_COST, 'Business Coach');
      update((d) => ({ ...d, answers: [{ id: `ca_${Date.now()}`, question: q, answer: a.answer, basis: a.basis, at: new Date().toISOString() }, ...d.answers].slice(0, 10) }));
      setAsking(null);
    }, 600);
  };

  const mark = (id: string, list: 'done' | 'dismissed') => update((d) => ({ ...d, [list]: d[list].includes(id) ? d[list].filter((x) => x !== id) : [...d[list], id] }));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title="Business Coach"
        context={current.name}
        description="A short weekly brief and straight answers, worked out only from your own orders, products and wallet. Every suggestion shows the numbers behind it."
        actions={
          <Button variant="ai" leadingIcon={unlocked ? RefreshCwIcon : LockIcon} onClick={refresh}>
            Refresh brief
          </Button>
        }
      />

      {!unlocked && (
        <InlineAlert
          tone="info"
          title="Business Coach is on Creator and above"
          className="mt-6"
          action={
            <Button size="sm" onClick={() => openUpgrade({ plan: COACH_PLAN, feature: 'AI Business Coach' })}>
              Upgrade
            </Button>
          }
        >
          You can read this week’s brief. Refreshing it and asking questions use AI credits on Creator and above.
        </InlineAlert>
      )}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
        {/* Weekly brief */}
        <section aria-labelledby="coach-brief" className="ai-frame flex flex-col gap-6 rounded-xl bg-raised p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 id="coach-brief" className="text-heading font-semibold text-fg">
                This week
              </h2>
              <AiPreviewTag />
            </div>
            <span className="text-caption text-fg-subtle">{data.briefAt ? `Refreshed ${formatTimestamp(data.briefAt)}` : 'Updates as your records change'}</span>
          </div>

          <dl className="grid gap-4 border-b border-line pb-6 sm:grid-cols-2">
            <div>
              <dt className="text-label text-fg-muted">Sales, last 7 days</dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-[2rem] font-semibold leading-tight tabular-nums text-fg">{formatNgn(brief.revenue7)}</span>
                {change !== null && (
                  <span className={cn('inline-flex items-center gap-1 text-label font-medium', change >= 0 ? 'text-success' : 'text-danger')}>
                    {change >= 0 ? <TrendingUpIcon size={15} aria-hidden /> : <TrendingDownIcon size={15} aria-hidden />}
                    {`${change >= 0 ? '+' : ''}${change}%`}
                    <span className="sr-only">compared with the week before</span>
                  </span>
                )}
              </dd>
              <dd className="mt-1 text-caption text-fg-subtle">{change === null ? 'No sales the week before to compare with' : `vs ${formatNgn(brief.revenuePrev7)} the week before`}</dd>
            </div>
            <div className="sm:border-l sm:border-line sm:pl-6">
              <dt className="text-label text-fg-muted">Paid orders</dt>
              <dd className="mt-1 text-heading font-semibold tabular-nums text-fg">{brief.orders7}</dd>
              <dd className="mt-1 text-caption text-fg-subtle">{brief.ordersPrev7} the week before</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3">
            <h3 className="text-label font-semibold text-fg">{open.length ? `${open.length} thing${open.length === 1 ? '' : 's'} to do` : 'All done for now'}</h3>
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {open.map((m) => (
                  <motion.li
                    key={m.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden rounded-lg border border-line bg-canvas"
                  >
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={impactTone[m.impact]}>{impactLabel[m.impact]}</Badge>
                        </div>
                        <p className="mt-2 text-label font-semibold text-fg">{m.title}</p>
                        <p className="mt-1 text-caption text-fg-muted">{m.evidence}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 sm:flex-col sm:items-end">
                        <Link to={m.to} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-label font-medium text-fg underline-offset-2 hover:underline">
                          {m.action} <ArrowRightIcon size={14} aria-hidden />
                        </Link>
                        <div className="flex gap-1">
                          <Button size="sm" variant="tertiary" leadingIcon={CheckIcon} onClick={() => mark(m.id, 'done')}>
                            Done
                          </Button>
                          <Button size="sm" variant="tertiary" leadingIcon={XIcon} aria-label={`Not useful: ${m.title}`} onClick={() => mark(m.id, 'dismissed')}>
                            Skip
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {done.length > 0 && (
              <p className="text-caption text-fg-subtle">
                Done: {done.map((m) => m.title).join(' · ')}{' '}
                <button type="button" className="font-medium text-fg underline-offset-2 hover:underline" onClick={() => update((d) => ({ ...d, done: [] }))}>
                  Undo
                </button>
              </p>
            )}
          </div>

          <p className="border-t border-line pt-4 text-caption text-fg-subtle">
            Based on {brief.basis}
            {brief.usedSample ? ', including labelled sample data' : ''}. Suggestions are patterns in your numbers, not guarantees.
          </p>
        </section>

        {/* Ask */}
        <section aria-labelledby="coach-ask" className="flex flex-col gap-4">
          <div>
            <h2 id="coach-ask" className="text-heading font-semibold text-fg">
              Ask the coach
            </h2>
            <p className="mt-1 text-caption text-fg-muted">
              {COACH_COST} AI credit per answer · {ai.remaining} of {ai.limit} left this month
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {coachQuestions.map((q) => (
              <Button key={q.id} size="sm" variant="secondary" leadingIcon={SparklesIcon} loading={asking === q.id} disabled={!!asking} onClick={() => ask(q.id)}>
                {q.label}
              </Button>
            ))}
          </div>

          {data.answers.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line-strong px-4 py-8 text-center text-caption text-fg-muted">Pick a question. Answers use only your records — if there isn’t enough data, the coach says so.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.answers.map((a) => (
                <li key={a.id} className="ai-frame rounded-lg bg-raised p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-label font-semibold text-fg">{a.question}</p>
                    <AiPreviewTag />
                  </div>
                  <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-label text-fg-muted marker:text-fg-subtle">
                    {a.answer.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-caption text-fg-subtle">
                    Based on {a.basis} · {formatTimestamp(a.at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
