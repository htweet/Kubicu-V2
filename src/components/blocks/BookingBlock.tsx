import React from 'react';
import { CalendarCheckIcon, LinkIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { PageAction } from './PageAction';
import { BlockPlaceholder } from './BlockPlaceholder';
import { buttonStyle, cardStyle, fontsFor } from './pageStyle';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { durationLabel } from '../../utils/ops/slots';
import { formatNgn } from '../../utils/format';

export function BookingBlock({ block, theme, mode }: BlockProps<'booking'>) {
  const c = block.content;
  const { data, actions } = usePageOpsContext();
  const linked = c.source === 'catalog';
  const service = linked ? data?.services.find((s) => s.id === c.serviceId) : undefined;

  if (linked && (!service || !service.active)) {
    return mode === 'edit' ?
    <BlockPlaceholder icon={LinkIcon} title={service ? `“${service.name}” is switched off` : 'Choose a service from Bookings'} hint={service ? 'Visitors won’t see this block until it’s on again.' : 'Pick one in the inspector.'} theme={theme} /> :
    null;
  }

  const title = service ? c.title || service.name : c.title;
  const description = service ? c.description || service.description : c.description;
  const meta = service ?
  [durationLabel(service.durationMin), service.priceNgn !== null ? formatNgn(service.priceNgn) : 'Price on request', service.depositNgn ? `${formatNgn(service.depositNgn)} deposit` : null, service.location === 'online' ? 'Online' : null].filter(Boolean).join(' · ') :
  [c.duration, c.priceNote].filter(Boolean).join(' · ');
  const cls = 'mt-1 flex h-12 w-full items-center justify-center text-[15px] font-semibold';

  return (
    <section className="flex flex-col gap-3 p-5" style={cardStyle(theme)}>
      <div className="flex items-center gap-2 text-[12.5px] font-medium" style={{ color: theme.mutedText }}>
        <CalendarCheckIcon size={14} aria-hidden />
        {meta || 'Appointment'}
      </div>
      <div>
        <h3 className="text-[20px] font-medium leading-tight tracking-[-0.01em]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {title || 'Untitled service'}
        </h3>
        {description &&
        <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>
            {description}
          </p>
        }
      </div>
      {service ?
      mode === 'live' && actions ?
      <button type="button" onClick={() => actions.openBooking(service.id)} className={cls} style={buttonStyle(theme, 'featured')}>
            {c.ctaLabel || 'Pick a time'}
          </button> :

      <span className={cls} style={buttonStyle(theme, 'featured')}>
            {c.ctaLabel || 'Pick a time'}
          </span> :


      <PageAction mode={mode} href={c.url} newTab={block.behaviour.openInNewTab} className={cls} style={buttonStyle(theme, 'default')}>
          {c.ctaLabel || 'Book'}
        </PageAction>
      }
    </section>);

}