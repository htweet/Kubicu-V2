import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckCircle2Icon, CircleIcon, CopyIcon, MessageCircleIcon, ShieldCheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useEditor } from '../contexts/EditorContext';
import { useMoney } from '../hooks/useMoney';
import { useProof } from '../hooks/useProof';
import { computePassport, levelLabels, levelTones, passportSummary } from '../utils/trustPassport';
import { publicUrl, whatsappLink } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
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
  const url = `https://${publicUrl(editor.published?.handle ?? editor.site.handle)}`;
  const summary = passportSummary(current.name, url, p);
  const met = p.signals.filter((s) => s.met);
  const todo = p.signals.filter((s) => !s.met);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Passport summary copied');
    } catch {
      toast.error('Couldn’t copy. Select the text and copy it instead.');
    }
  };

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

          <div className="flex flex-col gap-3">
            <h2 className="text-label font-semibold text-fg">Share it</h2>
            <pre className="whitespace-pre-wrap break-words rounded-md border border-line bg-sunken p-4 font-sans text-caption text-fg-muted">{summary}</pre>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={copy}>
                Copy
              </Button>
              <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => window.open(whatsappLink('', summary), '_blank', 'noopener')}>
                Share on WhatsApp
              </Button>
            </div>
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

function SignalRow({ signal: s }: {signal: ReturnType<typeof computePassport>['signals'][number];}) {
  return (
    <li className="flex items-start gap-3 px-4 py-4">
      {s.met ? <CheckCircle2Icon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden /> : <CircleIcon size={18} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />}
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-label font-semibold text-fg">{s.title}</span>
          <Badge tone={s.met ? 'success' : 'neutral'}>{`${s.met ? '+' : ''}${s.points} pts`}</Badge>
        </p>
        <p className="mt-0.5 text-caption text-fg-muted">{s.evidence}</p>
        {!s.met && <p className="mt-1 text-caption text-fg">{s.next}</p>}
      </div>
      {!s.met &&
      <Link to={s.to} className={cn('inline-flex shrink-0 items-center gap-1 self-center text-label font-medium text-fg underline-offset-2 hover:underline')}>
          Open <ArrowRightIcon size={14} aria-hidden />
          <span className="sr-only">{s.title}</span>
        </Link>
      }
    </li>);

}