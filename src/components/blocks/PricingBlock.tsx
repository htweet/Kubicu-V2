import React from 'react';
import { CheckIcon, ListChecksIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { BlockTitle, PageChip } from './BlockTitle';
import { PageAction } from './PageAction';
import { buttonStyle, cardRadius, fontsFor, mix } from './pageStyle';
import { formatNgn } from '../../utils/format';
import { usePageOpsContext } from '../../contexts/PageOpsContext';

export function PricingBlock({ block, theme, mode }: BlockProps<'pricing'>) {
  const c = block.content;
  const ops = usePageOpsContext();
  const packages = c.packages.filter((p) => p.name);
  if (packages.length === 0) {
    return mode === 'edit' ? <BlockPlaceholder icon={ListChecksIcon} title="Add packages" hint="Two or three options work best" theme={theme} tall /> : null;
  }

  return (
    <section>
      {c.title && <BlockTitle theme={theme}>{c.title}</BlockTitle>}
      {/* Pages are a single phone-width column, so packages stack and every inclusion stays readable. */}
      <ul className="grid gap-3">
        {packages.map((p) => {
          const features = p.features.split('\n').map((f) => f.trim()).filter(Boolean);
          return (
            <li
              key={p.id}
              className="flex flex-col p-5"
              style={{
                background: theme.surface,
                borderRadius: cardRadius(theme),
                border: p.highlighted ? `2px solid ${theme.accent}` : `1px solid ${mix(theme.text, 10)}`
              }}>
              
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[18px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{p.name}</h3>
                {p.highlighted && <PageChip theme={theme} tone="strong">Most chosen</PageChip>}
              </div>
              <p className="mt-2 text-[24px] font-semibold tabular-nums" style={{ color: theme.text }}>
                {p.priceNgn !== null ? formatNgn(p.priceNgn) : <span className="text-[16px] font-medium" style={{ color: theme.mutedText }}>Price on request</span>}
                {p.priceNgn !== null && p.unit && <span className="ml-1 text-[13px] font-normal" style={{ color: theme.mutedText }}>{p.unit}</span>}
              </p>
              {p.description && <p className="mt-1 text-[13px] leading-relaxed" style={{ color: theme.mutedText }}>{p.description}</p>}
              {features.length > 0 &&
              <ul className="mt-4 flex flex-col gap-2">
                  {features.map((f) =>
                <li key={f} className="flex items-start gap-2 text-[14px] leading-snug" style={{ color: theme.text }}>
                      <CheckIcon size={15} className="mt-0.5 shrink-0" style={{ color: theme.mutedText }} aria-hidden />
                      {f}
                    </li>
                )}
                </ul>
              }
              {p.serviceId && ops.data?.services.some((s) => s.id === p.serviceId && s.active) ?
              mode === 'live' && ops.actions ?
              <button type="button" onClick={() => ops.actions?.openBooking(p.serviceId as string)} className="mt-5 flex h-11 w-full items-center justify-center text-[14px] font-semibold" style={buttonStyle(theme, p.highlighted ? 'featured' : 'default')}>
                    {p.ctaLabel || 'Book'}
                  </button> :

              <span className="mt-5 flex h-11 w-full items-center justify-center text-[14px] font-semibold" style={buttonStyle(theme, p.highlighted ? 'featured' : 'default')}>
                    {p.ctaLabel || 'Book'}
                  </span> :


              <PageAction
                mode={mode}
                href={p.url}
                className="mt-5 flex h-11 w-full items-center justify-center text-[14px] font-semibold"
                style={buttonStyle(theme, p.highlighted ? 'featured' : 'default')}>
                
                  {p.ctaLabel || 'Enquire'}
                </PageAction>
              }
            </li>);

        })}
      </ul>
    </section>);

}