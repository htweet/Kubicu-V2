import React, { useState } from 'react';
import { MediaImage } from '../media/MediaImage';
import { ArrowUpRightIcon, BriefcaseIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { BlockTitle } from './BlockTitle';
import { PageAction } from './PageAction';
import { PageOverlay } from './PageOverlay';
import { buttonStyle, cardRadius, fontsFor, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

/** Case studies. Fixed wording follows the visitor's language (D506); project text stays as written. */
export function PortfolioBlock({ block, theme, mode }: BlockProps<'portfolio'>) {
  const { t: tr } = useT();
  const c = block.content;
  const [openId, setOpenId] = useState<string | null>(null);
  const items = c.items.filter((i) => i.title);
  if (items.length === 0) {
    return mode === 'edit' ? <BlockPlaceholder icon={BriefcaseIcon} title="Add a project" hint="Cover image, client, your role and the outcome" theme={theme} tall /> : null;
  }
  const open = items.find((i) => i.id === openId);
  const radius = cardRadius(theme);

  return (
    <section>
      {c.title && <BlockTitle theme={theme}>{c.title}</BlockTitle>}
      <ul className="flex flex-col gap-4">
        {items.map((item) => {
          const inner =
          <>
              {item.coverUrl ?
            <MediaImage src={item.coverUrl} alt={item.coverAlt} loading="lazy" className="aspect-[16/10] w-full object-cover" style={{ borderRadius: radius }} /> :

            <div className="flex aspect-[16/10] w-full items-center justify-center" style={{ borderRadius: radius, background: mix(theme.text, 6), color: theme.mutedText }}>
                  <BriefcaseIcon size={22} aria-hidden />
                </div>
            }
              <div className="mt-3 flex items-start justify-between gap-3 text-left">
                <span className="min-w-0">
                  <span className="block text-[17px] font-medium leading-snug" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{item.title}</span>
                  <span className="block text-[13px]" style={{ color: theme.mutedText }}>{[item.client, item.role].filter(Boolean).join(' · ')}</span>
                </span>
                <ArrowUpRightIcon size={18} className="mt-1 shrink-0" style={{ color: theme.mutedText }} aria-hidden />
              </div>
              {item.outcome && <p className="mt-1 text-left text-[14px] leading-snug" style={{ color: theme.text }}>{item.outcome}</p>}
            </>;

          return (
            <li key={item.id}>
              {mode === 'live' ?
              <button type="button" onClick={() => setOpenId(item.id)} className="block w-full" aria-label={tr('Open case study: {name}', { name: item.title })}>
                  {inner}
                </button> :

              <div>{inner}</div>
              }
            </li>);

        })}
      </ul>

      {mode === 'live' &&
      <PageOverlay open={!!open} onClose={() => setOpenId(null)} theme={theme} label={open ? tr('Case study: {name}', { name: open.title }) : tr('Case study')}>
          {open &&
        <div className="p-5 pt-16">
              {open.coverUrl && <MediaImage src={open.coverUrl} alt={open.coverAlt} className="aspect-[16/10] w-full object-cover" style={{ borderRadius: radius }} />}
              <h2 className="mt-4 text-[24px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display }}>{open.title}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
                {open.client &&
            <div>
                    <dt style={{ color: theme.mutedText }}>{tr('Client')}</dt>
                    <dd className="font-medium">{open.client}</dd>
                  </div>
            }
                {open.role &&
            <div>
                    <dt style={{ color: theme.mutedText }}>{tr('Role')}</dt>
                    <dd className="font-medium">{open.role}</dd>
                  </div>
            }
              </dl>
              {open.summary && <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed">{open.summary}</p>}
              {open.outcome &&
          <p className="mt-4 rounded-lg px-4 py-3 text-[14px]" style={{ background: mix(theme.text, 6) }}>
                  <span className="font-semibold">{tr('Outcome:')} </span>
                  {open.outcome}
                </p>
          }
              {open.url &&
          <PageAction mode="live" href={open.url} className="mt-5 flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold" style={buttonStyle(theme, 'featured')}>
                  {tr('View the project')}
                  <ArrowUpRightIcon size={16} aria-hidden />
                </PageAction>
          }
            </div>
        }
        </PageOverlay>
      }
    </section>);

}