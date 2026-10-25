import React from 'react';
import { ArrowRightIcon, CalendarRangeIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { useNow } from '../../hooks/useNow';
import { buttonStyle, cardStyle, headingStyle, imageFrameStyle } from './pageStyle';

const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/**
 * Campaign spotlight (D170): a featured offer that appears only inside its window. Before the start it's hidden;
 * after the end it shows your "after" line, or disappears. The canvas always shows it, with its schedule.
 */
export function CampaignSpotlightBlock({ block, theme, mode }: BlockProps<'campaignSpotlight'>) {
  const c = block.content;
  const now = useNow(60_000);
  if (!c.title.trim()) return mode === 'edit' ? <BlockPlaceholder icon={CalendarRangeIcon} title="Name your campaign" hint="Then set when it starts and ends" theme={theme} /> : null;
  const start = c.startsAt ? Date.parse(c.startsAt) : null;
  const end = c.endsAt ? Date.parse(c.endsAt) : null;
  const state = start && now < start ? 'before' : end && now >= end ? 'after' : 'live';
  if (mode !== 'edit' && state === 'before') return null;
  if (mode !== 'edit' && state === 'after' && !c.afterText.trim()) return null;
  const ended = state === 'after';
  const span = [c.startsAt && `from ${fmt(c.startsAt)}`, c.endsAt && `until ${fmt(c.endsAt)}`].filter(Boolean).join(' ');
  return (
    <section className="overflow-hidden" style={cardStyle(theme)}>
      {c.imageUrl && !ended &&
      <div className="aspect-[16/7] overflow-hidden" style={imageFrameStyle(theme)}>
          <MediaImage src={c.imageUrl} alt={c.imageAlt} className="h-full w-full object-cover" />
        </div>
      }
      <div className="p-6 md:p-8">
        {mode === 'edit' &&
        <p className="mb-3 text-[12px] font-semibold" style={{ color: theme.mutedText }}>
            {state === 'before' ? 'Not showing yet' : state === 'after' ? 'Ended' : 'Showing now'}
            {span && ` · ${span}`}
          </p>
        }
        <h2 className="text-[clamp(1.5rem,3cqw,2.2rem)] font-medium leading-[1.1] tracking-[-0.02em]" style={{ ...headingStyle(theme), color: theme.text }}>{c.title}</h2>
        {ended ?
        <p className="mt-2 text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>{c.afterText || 'This campaign has ended.'}</p> :

        <>
            {c.text && <p className="mt-2 text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>{c.text}</p>}
            {c.endsAt && <p className="mt-3 text-[13px] font-semibold" style={{ color: theme.text }}>Ends {fmt(c.endsAt)}</p>}
            {c.ctaLabel && c.url &&
          <PageAction mode={mode} href={c.url} className="mt-5 inline-flex h-12 items-center gap-2 px-6 text-[15px] font-semibold" style={buttonStyle(theme, 'featured')}>
                {c.ctaLabel} <ArrowRightIcon size={16} aria-hidden />
              </PageAction>
          }
          </>
        }
      </div>
    </section>);

}