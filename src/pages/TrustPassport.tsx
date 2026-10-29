import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVerifiedTick } from '../hooks/useVerifiedTick';
import { AlertCircleIcon, ArrowRightIcon, BadgeCheckIcon, CheckCircle2Icon, CircleIcon, ClockIcon, ShieldCheckIcon, XCircleIcon } from 'lucide-react';
import { TrustCardShare } from '../components/trust/TrustCardShare';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useEditor } from '../contexts/EditorContext';
import { useMoney } from '../hooks/useMoney';
import { useProof } from '../hooks/useProof';
import { computePassport, lapsingSoon, levelLabels, passportSummary, publicSignals } from '../utils/trustPassport';
import { formatDate, formatRelative, publicUrl } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Badge } from '../components/ui/Badge';
import { InlineAlert } from '../components/ui/InlineAlert';
import { cn } from '../utils/cn';

/** Trust Passport (D99): what buyers can rely on, built only from checked records. */
export function TrustPassport() {
  const { current } = useWorkspace();
  const commerce = useCommerce();
  const { state: editor } = useEditor();
  const money = useMoney(current.id);
  const proof = useProof(current.id);
  const p = useMemo(() => computePassport(commerce.data.orders, money.data, proof.data), [commerce.data.orders, money.data, proof.data]);
  // D253: shared text, link and QR all point at the live public passport so buyers can check it.
  const url = `https://${publicUrl(editor.published?.handle ?? editor.site.handle)}/trust`;
  const summary = passportSummary(current.name, url, p);
  const met = p.signals.filter((s) => s.met);
  const todo = p.signals.filter((s) => !s.met);
  const cardSignals = useMemo(() => publicSignals(p).map((s) => s.evidence), [p]);
  const tick = useVerifiedTick(current.id);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title="Trust Passport"
        context={current.name}
        description="What buyers can rely on, built only from records KUBICU can check — verification, real orders, escrow and verified reviews. You can’t add or edit signals yourself." />
      

      <InlineAlert tone="info" title="Independent partner checks are simulated" className="mt-6">
        Scores use your real KUBICU records. Checks with credit bureaus and trade associations wait for a chosen partner.
      </InlineAlert>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-10">
        <section aria-labelledby="tp-score" className="flex flex-col gap-5 lg:sticky lg:top-6">
          <div className="rounded-lg border border-line bg-raised p-6">
            <div className="flex items-center gap-3">
              <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-sunken text-fg">
                <ShieldCheckIcon size={22} />
              </span>
              <div>
                <h2 id="tp-score" className="text-label text-fg-muted">
                  Your level
                </h2>
                <p className="text-heading font-semibold text-fg">{levelLabels[p.level]}</p>
              </div>
            </div>
            <p className="mt-6 font-display text-[2.75rem] font-semibold leading-none tabular-nums text-fg">
              {p.score}
              <span className="text-heading font-medium text-fg-subtle">/100</span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-sunken" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.score} aria-label="Trust score">
              <div className="h-full rounded-full bg-action transition-[width] duration-300 ease-out" style={{ width: `${p.score}%` }} />
            </div>
            <p className="mt-3 text-caption text-fg-subtle">
              {met.length} of {p.signals.length} signals met. Levels: Building from 25, Established from 55, Trusted from 85.
            </p>
          </div>

          {tick.shown ?
          <p className="flex items-start gap-2 text-caption text-fg-muted">
              <BadgeCheckIcon size={16} className="mt-px shrink-0 text-action" aria-hidden />
              <span>
                <span className="font-semibold text-fg">Verified tick is on.</span> It shows after your name on Profile and Brand header blocks. Add a Trust Passport badge set to “Verified” to show the seal on its own.
              </span>
            </p> :
          tick.hiddenByKubicu ?
          <InlineAlert tone="warning" title="KUBICU has hidden your verified tick">
              Your verification, payouts and score aren’t affected. Contact support if you think this is a mistake.
            </InlineAlert> :
          null}

          <div className="flex flex-col gap-3">
            <h2 className="text-label font-semibold text-fg">Share it</h2>
            <TrustCardShare business={current.name} level={p.level} score={p.score} signals={cardSignals} url={url} summary={summary} unpublished={!editor.published} />
          </div>
        </section>

        <div className="flex flex-col gap-8">
          {todo.length > 0 &&
          <section aria-labelledby="tp-next" className="flex flex-col gap-3">
              <h2 id="tp-next" className="text-heading font-semibold text-fg">
                To raise your level
              </h2>
              <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
                {todo.map((s) =>
              <SignalRow key={s.id} signal={s} />
              )}
              </ul>
            </section>
          }
          <section aria-labelledby="tp-met" className="flex flex-col gap-3">
            <h2 id="tp-met" className="text-heading font-semibold text-fg">
              Already met
            </h2>
            {met.length === 0 ?
            <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-body text-fg-muted">Nothing yet. Verification is the quickest first step.</p> :

            <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
                {met.map((s) =>
              <SignalRow key={s.id} signal={s} />
              )}
              </ul>
            }
          </section>
          <p className="text-caption text-fg-subtle">Sample data never counts. Thresholds and points are example figures (D99).</p>
        </div>
      </div>
    </div>);

}

const progressIcon = { info: ClockIcon, warning: AlertCircleIcon, danger: XCircleIcon } as const;
const progressColor = { info: 'text-info', warning: 'text-warning', danger: 'text-danger' } as const;

function SignalRow({ signal: s }: {signal: ReturnType<typeof computePassport>['signals'][number];}) {
  const soon = lapsingSoon(s);
  const pr = !s.met ? s.progress : undefined;
  const PrIcon = pr ? progressIcon[pr.tone] : null;
  return (
    <li className={cn('flex items-start gap-3 px-4 py-4', pr && 'bg-sunken')}>
      {s.met ?
      <CheckCircle2Icon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden /> :
      PrIcon && pr ?
      <PrIcon size={18} className={cn('mt-0.5 shrink-0', progressColor[pr.tone])} aria-hidden /> :

      <CircleIcon size={18} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
      }
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-label font-semibold text-fg">{s.title}</span>
          {pr &&
          <Badge tone={pr.tone} dot>
              {pr.label}
            </Badge>
          }
          <Badge tone={s.met ? 'success' : 'neutral'}>{`${s.met ? '+' : ''}${s.points} pts`}</Badge>
        </p>
        <p className="mt-0.5 text-caption text-fg-muted">
          {s.evidence}
          {pr?.at && ` · ${pr.tone === 'info' ? 'submitted' : 'updated'} ${formatRelative(pr.at)}`}
        </p>
        {s.met && s.validUntil &&
        <p className={cn('mt-1 text-caption', soon ? 'font-medium text-warning' : 'text-fg-subtle')}>
            {soon ? 'Lapses' : 'Valid until'} {formatDate(s.validUntil)}
            {soon && (s.id === 'verified' ? ' — renew verification to keep these points.' : ' — ask recent customers for reviews to keep these points.')}
          </p>
        }
        {!s.met && <p className="mt-1 text-caption text-fg">{s.next}</p>}
      </div>
      {(!s.met || soon) &&
      <Link to={s.to} className={cn('inline-flex shrink-0 items-center gap-1 self-center text-label font-medium text-fg underline-offset-2 hover:underline')}>
          {pr?.tone === 'info' ? 'View' : pr ? 'Fix' : 'Open'} <ArrowRightIcon size={14} aria-hidden />
          <span className="sr-only">{s.title}</span>
        </Link>
      }
    </li>);

}