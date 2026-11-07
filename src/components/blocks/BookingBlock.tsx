import React from 'react';
import { CalendarCheckIcon, LinkIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { PageAction } from './PageAction';
import { BlockPlaceholder } from './BlockPlaceholder';
import { buttonStyle, cardStyle, fontsFor } from './pageStyle';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { durationLabel } from '../../utils/ops/slots';
import { formatNgn } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';

/** A bookable service. Fixed wording follows the visitor's language (D504); service names, descriptions and the seller's labels stay as written. */
export function BookingBlock({ block, theme, mode }: BlockProps<'booking'>) {
  const { t: tr } = useT();
  const c = block.content;
  const { data, actions } = usePageOpsContext();
  const linked = c.source === 'catalog';
  const service = linked ? data?.services.find((s) => s.id === c.serviceId) : undefined;

  if (linked && (!service || !service.active)) {
    return mode === 'edit' ? (
      <BlockPlaceholder icon={LinkIcon} title={service ? tr('Switched off: {name}', { name: service.name }) : 'Choose a service from Bookings'} hint={service ? 'Visitors won’t see this block until it’s on again.' : 'Pick one in the inspector.'} theme={theme} />
    ) : null;
  }

  const title = service ? c.title || service.name : c.title;
  const description = service ? c.description || service.description : c.description;
  const meta = service
    ? [
        durationLabel(service.durationMin, tr),
        service.priceNgn !== null ? formatNgn(service.priceNgn) : tr('Price on request'),
        service.depositNgn ? tr('Deposit: {amount}', { amount: formatNgn(service.depositNgn) }) : null,
        service.location === 'online' ? tr('Online') : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : [c.duration, c.priceNote].filter(Boolean).join(' · ');
  const cls = 'mt-1 flex h-12 w-full items-center justify-center text-[15px] font-semibold';

  return (
    <section className="flex flex-col gap-3 p-5" style={cardStyle(theme)}>
      <div className="flex items-center gap-2 text-[12.5px] font-medium" style={{ color: theme.mutedText }}>
        <CalendarCheckIcon size={14} aria-hidden />
        {meta || tr('Appointment')}
      </div>
      <div>
        <h3 className="text-[20px] font-medium leading-tight tracking-[-0.01em]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {title || tr('Untitled service')}
        </h3>
        {description && (
          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>
            {description}
          </p>
        )}
      </div>
      {service ? (
        mode === 'live' && actions ? (
          <button type="button" onClick={() => actions.openBooking(service.id)} className={cls} style={buttonStyle(theme, 'featured')}>
            {c.ctaLabel || tr('Pick a time')}
          </button>
        ) : (
          <span className={cls} style={buttonStyle(theme, 'featured')}>
            {c.ctaLabel || tr('Pick a time')}
          </span>
        )
      ) : (
        <PageAction mode={mode} href={c.url} newTab={block.behaviour.openInNewTab} className={cls} style={buttonStyle(theme, 'default')}>
          {c.ctaLabel || tr('Book')}
        </PageAction>
      )}
    </section>
  );
}
