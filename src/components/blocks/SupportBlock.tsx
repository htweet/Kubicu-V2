import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { HandHeartIcon, ShieldCheckIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { buttonRadius, cardStyle, fontsFor, mix } from './pageStyle';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { linkView, readMoney } from '../../utils/money/store';
import { formatNgn } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';

/** English wording; the block translates it for visitors (D503). */
export const supportWordingLabels = {
  support: { cta: 'Support', verb: 'Send support' },
  donate: { cta: 'Donate', verb: 'Donate' },
  tip: { cta: 'Tip', verb: 'Send a tip' }
} as const;

/**
 * Support / pay what you want (D124). Each amount opens the block's payment link with the amount
 * filled in; "Other amount" opens it empty. Payment rules (wallet, escrow) follow Payment links.
 */
export function SupportBlock({ block, theme: t, mode }: BlockProps<'support'>) {
  const { t: tr } = useT();
  const c = block.content;
  const { handle } = useParams();
  const pageOps = usePageOpsContext();
  const { current } = useWorkspace();
  const workspaceId = pageOps.workspaceId ?? current.id;
  const link = useMemo(() => c.linkId ? readMoney(workspaceId).links.find((l) => l.id === c.linkId) : undefined, [c.linkId, workspaceId]);
  const amounts = c.amounts.filter((a) => a >= c.minNgn).slice(0, 4);
  const words = supportWordingLabels[c.wording];

  if (!link || amounts.length === 0 && !c.allowOther) {
    return mode === 'edit' ?
    <BlockPlaceholder icon={HandHeartIcon} title={!link ? 'Setting up the payment link…' : 'Add at least one amount'} hint="Amounts and wording are in the inspector" theme={t} /> :
    null;
  }
  const closed = linkView(link) !== 'active';
  if (closed && mode === 'live') return null;

  const href = (amount?: number) => mode === 'live' && handle ? `/p/${handle}/pay/${link.slug}${amount ? `?amount=${amount}` : ''}` : '';
  const btn = 'flex h-11 items-center justify-center px-3 text-[14px] font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const Action = ({ amount, primary, children }: {amount?: number;primary?: boolean;children: React.ReactNode;}) => {
    const style = primary ?
    { background: t.accent, color: t.accentText, borderRadius: buttonRadius(t) } :
    { background: t.surface, color: t.text, border: `1px solid ${mix(t.text, 18)}`, borderRadius: buttonRadius(t) };
    const url = href(amount);
    const label = amount ? `${tr(words.verb)}: ${formatNgn(amount)}` : `${tr(words.verb)} — ${tr('choose your own amount')}`;
    return url ?
    <a href={url} className={btn} style={style} aria-label={label}>{children}</a> :

    <span className={btn} style={style} aria-label={label}>{children}</span>;

  };

  return (
    <article className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
      <div className="flex flex-col gap-1.5" style={{ textAlign: block.style.align }}>
        <h3 className="text-[19px] font-medium leading-snug" style={{ fontFamily: fontsFor(t).display, color: t.text }}>{c.title || tr(words.verb)}</h3>
        {c.intro && <p className="whitespace-pre-line text-[14px] leading-relaxed" style={{ color: t.mutedText }}>{c.intro}</p>}
      </div>
      {amounts.length > 0 &&
      <div className={`grid gap-2 ${amounts.length === 1 ? 'grid-cols-1' : amounts.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {amounts.map((a, i) =>
        <Action key={a} amount={a} primary={i === Math.floor((amounts.length - 1) / 2)}>
              {formatNgn(a)}
            </Action>
        )}
        </div>
      }
      {c.allowOther && <Action primary={amounts.length === 0}>{amounts.length ? tr('Other amount') : `${tr(words.cta)} · ${tr('any amount')}`}</Action>}
      <p className="flex items-start justify-center gap-1.5 text-center text-[11.5px] leading-snug" style={{ color: t.mutedText }}>
        <ShieldCheckIcon size={12} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          {c.wording === 'donate' ?
          tr('Paid securely by card or transfer, from {min}. This is a payment to this page’s owner, not a tax-deductible donation.', { min: formatNgn(c.minNgn) }) :
          tr('Paid securely by card or transfer, from {min}. This is a payment to the seller, not a tax-deductible donation.', { min: formatNgn(c.minNgn) })}
        </span>
      </p>
      {mode === 'edit' && closed && <p className="text-center text-[12px] font-medium" style={{ color: t.mutedText }}>{tr('The payment link is paused or closed — visitors won’t see this block.')}</p>}
    </article>);

}