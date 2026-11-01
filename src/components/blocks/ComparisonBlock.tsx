import React, { useRef } from 'react';
import { CheckIcon, MinusIcon, TableIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { accentOf, cardStyle, fontsFor, mix } from './pageStyle';
import { useElementWidth } from '../../hooks/useElementWidth';
import { useT } from '../../contexts/LocaleContext';

/** "yes"/"✓" show a tick, "no"/"-" a dash — never colour alone; everything else is shown as written. */
function Cell({ value, theme }: {value: string;theme: BlockProps<'comparison'>['theme'];}) {
  const { t: tr } = useT();
  const v = value.trim().toLowerCase();
  if (['yes', '✓', 'y', 'true', 'included'].includes(v))
  return (
    <span className="inline-flex items-center gap-1" style={{ color: theme.text }}>
        <CheckIcon size={16} aria-hidden /> <span className="sr-only">{tr('Included')}</span>
      </span>);

  if (['no', '-', '—', 'n', 'false', ''].includes(v))
  return (
    <span className="inline-flex items-center" style={{ color: theme.mutedText }}>
        <MinusIcon size={16} aria-hidden /> <span className="sr-only">{tr('Not included')}</span>
      </span>);

  return <span style={{ color: theme.text }}>{value}</span>;
}

/** Comparison table (D169): a real table when there's room; one card per option when narrow. */
export function ComparisonBlock({ block, theme, mode }: BlockProps<'comparison'>) {
  // Fixed labels follow the visitor's language (D509); options, rows and cell text stay as written.
  const { t: tr } = useT();
  const c = block.content;
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref);
  const cols = c.columns.filter((col) => col.name.trim());
  const rows = c.rows.filter((r) => r.label.trim());
  if (cols.length < 2 || rows.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={TableIcon} title="Add at least two options to compare" hint="Then the rows that matter to your buyers" theme={theme} tall /> : null;
  const accent = accentOf(theme);
  const display = fontsFor(theme).display;
  const idx = (colId: string) => c.columns.findIndex((x) => x.id === colId);
  const narrow = width > 0 && width < 140 * (cols.length + 1);

  return (
    <section ref={ref}>
      <SectionHeading theme={theme} title={c.title} intro={c.intro} />
      {narrow ?
      <ul className="flex flex-col gap-4">
          {cols.map((col) =>
        <li key={col.id} className="p-5" style={{ ...cardStyle(theme), ...(col.highlight ? { boxShadow: `0 0 0 2px ${accent}` } : {}) }}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[19px] font-medium" style={{ fontFamily: display, color: theme.text }}>{col.name}</h3>
                {col.price && <span className="text-[15px] font-semibold tabular-nums" style={{ color: theme.text }}>{col.price}</span>}
              </div>
              {col.highlight && <p className="mt-1 text-[12px] font-semibold" style={{ color: accent }}>{tr('Most chosen')}</p>}
              <dl className="mt-3">
                {rows.map((r) =>
            <div key={r.id} className="flex items-center justify-between gap-4 py-2 text-[14px]" style={{ borderTop: `1px solid ${mix(theme.text, 9)}` }}>
                    <dt style={{ color: theme.mutedText }}>{r.label}</dt>
                    <dd className="text-right">
                      <Cell value={r.values[idx(col.id)] ?? ''} theme={theme} />
                    </dd>
                  </div>
            )}
              </dl>
            </li>
        )}
        </ul> :

      <div className="overflow-hidden" style={cardStyle(theme)}>
          <table className="w-full border-collapse text-left text-[14px]">
            <caption className="sr-only">{c.title || tr('Comparison')}</caption>
            <thead>
              <tr>
                <td className="p-4" />
                {cols.map((col) =>
              <th key={col.id} scope="col" className="p-4 align-bottom" style={col.highlight ? { background: mix(accent, 10, theme.surface) } : undefined}>
                    {col.highlight && <span className="mb-1 block text-[12px] font-semibold" style={{ color: accent }}>{tr('Most chosen')}</span>}
                    <span className="block text-[18px] font-medium" style={{ fontFamily: display, color: theme.text }}>{col.name}</span>
                    {col.price && <span className="mt-0.5 block text-[14px] font-semibold tabular-nums" style={{ color: theme.mutedText }}>{col.price}</span>}
                  </th>
              )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) =>
            <tr key={r.id} style={{ borderTop: `1px solid ${mix(theme.text, 9)}` }}>
                  <th scope="row" className="p-4 font-medium" style={{ color: theme.mutedText }}>{r.label}</th>
                  {cols.map((col) =>
              <td key={col.id} className="p-4" style={col.highlight ? { background: mix(accent, 10, theme.surface) } : undefined}>
                      <Cell value={r.values[idx(col.id)] ?? ''} theme={theme} />
                    </td>
              )}
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }
    </section>);

}