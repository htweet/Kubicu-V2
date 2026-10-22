import React from 'react';
import { CheckIcon, RepeatIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { BlockTitle, PageChip } from './BlockTitle';
import { buttonStyle, cardRadius, fontsFor, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { useSubscribeOpener } from '../../contexts/SubscribeContext';
import { intervalWord, planFull } from '../../utils/commerce/subscriptions';
import { formatNgn } from '../../utils/format';

/** Recurring plans side by side; the button opens sign-up on the live page (D69). */
export function SubscriptionBlock({ block, theme, mode }: BlockProps<'subscription'>) {
  const c = block.content;
  const catalog = useCatalog();
  const open = useSubscribeOpener();
  const plans = c.planIds.map((id) => catalog?.subPlans.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p && p.status === 'active');

  if (plans.length === 0) {
    return mode === 'edit' ? <BlockPlaceholder icon={RepeatIcon} title="Choose subscription plans" hint="Set them up in Commerce → Subscriptions" theme={theme} tall /> : null;
  }

  return (
    <section>
      {c.title && <BlockTitle theme={theme}>{c.title}</BlockTitle>}
      {c.intro &&
      <p className="-mt-1 mb-3 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>
          {c.intro}
        </p>
      }
      <ul className="grid gap-3">
        {plans.map((p) => {
          const highlighted = c.highlightPlanId === p.id;
          const full = catalog ? planFull(catalog, p) : false;
          const benefits = p.benefits.split('\n').map((b) => b.trim()).filter(Boolean);
          const label = full ? 'Full right now' : p.trialDays ? `Start ${p.trialDays}-day free trial` : c.ctaLabel || 'Subscribe';
          const btnClass = 'mt-5 flex h-11 w-full items-center justify-center text-[14px] font-semibold';
          const btnStyle = { ...buttonStyle(theme, highlighted ? 'featured' : 'default'), opacity: full ? 0.55 : 1 };
          return (
            <li
              key={p.id}
              className="flex flex-col p-5"
              style={{ background: theme.surface, borderRadius: cardRadius(theme), border: highlighted ? `2px solid ${theme.accent}` : `1px solid ${mix(theme.text, 10)}` }}>
              
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[18px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
                  {p.name}
                </h3>
                {highlighted &&
                <PageChip theme={theme} tone="strong">
                    Most chosen
                  </PageChip>
                }
              </div>
              <p className="mt-2 text-[24px] font-semibold tabular-nums" style={{ color: theme.text }}>
                {formatNgn(p.priceNgn)}
                <span className="ml-1 text-[13px] font-normal" style={{ color: theme.mutedText }}>
                  / {intervalWord[p.interval]}
                </span>
              </p>
              {(p.trialDays > 0 || p.setupFeeNgn > 0 || p.kind === 'box') &&
              <p className="mt-0.5 text-[12.5px]" style={{ color: theme.mutedText }}>
                  {[p.trialDays ? `${p.trialDays} days free` : '', p.setupFeeNgn ? `${formatNgn(p.setupFeeNgn)} one-off setup` : '', p.kind === 'box' ? 'plus delivery' : ''].filter(Boolean).join(' · ')}
                </p>
              }
              {p.description &&
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: theme.mutedText }}>
                  {p.description}
                </p>
              }
              {benefits.length > 0 &&
              <ul className="mt-4 flex flex-col gap-2">
                  {benefits.map((b) =>
                <li key={b} className="flex items-start gap-2 text-[14px] leading-snug" style={{ color: theme.text }}>
                      <CheckIcon size={15} className="mt-0.5 shrink-0" style={{ color: theme.mutedText }} aria-hidden />
                      {b}
                    </li>
                )}
                </ul>
              }
              {mode === 'live' && open && !full ?
              <button type="button" onClick={() => open(p.id)} className={btnClass} style={btnStyle}>
                  {label}
                </button> :

              <span className={btnClass} style={btnStyle} aria-disabled={full || undefined}>
                  {label}
                </span>
              }
            </li>);

        })}
      </ul>
    </section>);

}