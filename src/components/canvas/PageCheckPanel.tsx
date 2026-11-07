import React, { useMemo } from 'react';
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, LightbulbIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { useT } from '../../contexts/LocaleContext';
import { blockDefinitions } from '../../data/blockRegistry';
import { a11yFindings, CHECK_KINDS, formatKb, pageWeight } from '../../utils/pageCheck';
import { formatMoney } from '../../utils/currency';
import { Switch } from '../ui/Switch';
import { cn } from '../../utils/cn';
import { CompositionPanel } from './CompositionPanel';

const ratingCopy = {
  light: { label: 'Light', tone: 'text-success', note: 'Opens quickly even on 3G.' },
  ok: { label: 'Fair', tone: 'text-warning', note: 'Fine on 4G; slow on 3G.' },
  heavy: { label: 'Heavy', tone: 'text-danger', note: 'Many visitors on mobile data will wait or give up.' },
} as const;

/** Canvas → Check (D126): accessibility problems and page weight for the page being edited. Translated in D311. */
export function PageCheckPanel() {
  const { t: tr } = useT();
  const { state, actions, issues } = useEditor();
  const blocks = state.draft.blocks;
  const findings = useMemo(() => a11yFindings(blocks, issues), [blocks, issues]);
  const weight = useMemo(() => pageWeight(blocks), [blocks]);
  const fixes = findings.filter((f) => f.level === 'fix').length;
  const r = ratingCopy[weight.rating];
  const lightweight = !!state.draft.branding?.startLightweight;
  // Smallest amount worth showing in each currency: ₦2, or 1 shilling, cedi or rand (D404).
  const minShown = weight.dataCurrency === 'NGN' ? 2 : 1;
  const dataCostLabel = weight.dataCost < minShown ? tr('Under {amount}', { amount: formatMoney(minShown, weight.dataCurrency) }) : `~${formatMoney(Math.round(weight.dataCost), weight.dataCurrency)}`;

  const labelFor = (id: string | null) => {
    const b = id ? blocks.find((x) => x.id === id) : null;
    return tr(b ? blockDefinitions[b.type].name : 'Theme');
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <CompositionPanel />
      <section aria-labelledby="chk-a11y" className="border-t border-line pt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="chk-a11y" className="text-label font-semibold text-fg">
            {tr('Accessibility')}
          </h2>
          <span className="text-caption text-fg-subtle">{tr('Kinds of check: {n}', { n: CHECK_KINDS.length })}</span>
        </div>
        <p className={cn('mt-1 flex items-center gap-1.5 text-caption font-medium', findings.length === 0 ? 'text-success' : fixes ? 'text-danger' : 'text-warning')} role="status">
          {findings.length === 0 ? <CheckCircle2Icon size={14} aria-hidden /> : <AlertCircleIcon size={14} aria-hidden />}
          {findings.length === 0 ? tr('No problems found on this page') : tr('To fix: {fix} · to improve: {improve}', { fix: fixes, improve: findings.length - fixes })}
        </p>

        {findings.length > 0 && (
          <ul className="mt-3 divide-y divide-line rounded-md border border-line">
            {findings.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => f.blockId && actions.select(f.blockId)}
                  disabled={!f.blockId}
                  className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <span className={cn('mt-1 size-2 shrink-0 rounded-full', f.level === 'fix' ? 'bg-danger' : 'bg-warning')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="sr-only">{tr(f.level === 'fix' ? 'Fix:' : 'Improve:')} </span>
                    <span className="block text-label font-medium text-fg">{tr(f.title, f.vars)}</span>
                    <span className="mt-0.5 block text-caption text-fg-muted">{tr(f.advice, f.vars)}</span>
                    <span className="mt-1 block text-caption text-fg-subtle">
                      {labelFor(f.blockId)} · WCAG {f.wcag}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 flex gap-1.5 text-caption text-fg-subtle">
          <InfoIcon size={13} className="mt-px shrink-0" aria-hidden />
          {tr('Automatic checks catch common problems only. Try your page with a screen reader before a big launch.')}
        </p>
      </section>

      <section aria-labelledby="chk-weight" className="border-t border-line pt-6">
        <h2 id="chk-weight" className="text-label font-semibold text-fg">
          {tr('Page weight')}
        </h2>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-title font-semibold tabular-nums text-fg">{formatKb(weight.totalKb)}</span>
          <span className={cn('text-label font-semibold', r.tone)}>{tr(r.label)}</span>
        </div>
        <p className="text-caption text-fg-muted">{tr(r.note)}</p>

        <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line py-3">
          <div>
            <dt className="text-caption text-fg-subtle">{tr('On 3G')}</dt>
            <dd className="text-label font-semibold tabular-nums text-fg">~{weight.seconds3g}s</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-subtle">{tr('On 4G')}</dt>
            <dd className="text-label font-semibold tabular-nums text-fg">~{weight.seconds4g}s</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-subtle">{tr('Data cost')}</dt>
            <dd className="text-label font-semibold tabular-nums text-fg">{dataCostLabel}</dd>
          </div>
        </dl>
        <p className="mt-2 text-caption text-fg-subtle">{tr('Estimates at typical mobile speeds and about {price} per GB of data. Videos aren’t counted until tapped.', { price: formatMoney(weight.dataPerGb, weight.dataCurrency) })}</p>

        {weight.items.length > 0 && (
          <>
            <h3 className="mt-5 text-caption font-semibold text-fg-muted">{tr('Biggest images')}</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {weight.items.slice(0, 5).map((i, n) => (
                <li key={`${i.blockId}-${n}`}>
                  <button
                    type="button"
                    onClick={() => actions.select(i.blockId)}
                    className="flex w-full items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-caption transition-colors duration-150 ease-out hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none"
                  >
                    <span className="min-w-0 truncate text-fg">{tr(i.label)}</span>
                    <span className={cn('shrink-0 tabular-nums', i.kb > 400 ? 'font-semibold text-danger' : 'text-fg-muted')}>
                      {i.guessed ? '~' : ''}
                      {formatKb(i.kb)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {weight.items.some((i) => i.kb > 400) && (
              <p className="mt-2 flex gap-1.5 text-caption text-fg-muted">
                <LightbulbIcon size={13} className="mt-px shrink-0 text-warning" aria-hidden />
                {tr('Images over 400 KB are worth replacing. Re-upload from Media — uploads are shrunk automatically.')}
              </p>
            )}
          </>
        )}

        <div className="mt-5 rounded-md bg-sunken p-3">
          <Switch
            id="chk-lightweight"
            label={tr('Open in data saver for everyone')}
            description={tr('Photos and videos wait until tapped, so first load is about {size}. Visitors can turn it off.', { size: formatKb(Math.max(140, weight.totalKb - weight.deferredKb)) })}
            checked={lightweight}
            onChange={(on) => actions.updateBranding({ startLightweight: on })}
          />
        </div>
      </section>
    </div>
  );
}
