import React from 'react';
import { GlobeIcon, MailIcon, MessageCircleIcon, PhoneCallIcon, PhoneIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { buttonStyle, fontsFor } from './pageStyle';
import { cn } from '../../utils/cn';
import { waNumber } from '../../utils/businessWhatsApp';
import { useT } from '../../contexts/LocaleContext';

const digits = (s: string) => s.replace(/[^\d+]/g, '');

/** Contact buttons (D169): only the ways you filled in, each opening the right app. */
export function ContactActionsBlock({ block, theme, mode }: BlockProps<'contactActions'>) {
  // Button wording follows the visitor's language (D508).
  const { t: tr } = useT();
  const c = block.content;
  const wa = c.useBusinessWhatsApp === false ? c.whatsapp.trim() : waNumber(c.whatsapp);
  const actions = [
  c.phone.trim() && { key: 'call', label: tr('Call'), icon: PhoneIcon, href: `tel:${digits(c.phone)}`, aria: `${tr('Call')}: ${c.phone}`, newTab: false },
  wa && { key: 'wa', label: 'WhatsApp', icon: MessageCircleIcon, href: `https://wa.me/${digits(wa).replace(/^\+/, '')}`, aria: tr('Message on WhatsApp'), newTab: true },
  c.email.trim() && { key: 'email', label: tr('Email'), icon: MailIcon, href: `mailto:${c.email.trim()}`, aria: `${tr('Email')}: ${c.email}`, newTab: false },
  c.website.trim() && { key: 'web', label: tr('Website'), icon: GlobeIcon, href: c.website.trim(), aria: tr('Visit website'), newTab: true }].
  filter(Boolean) as {key: string;label: string;icon: typeof PhoneIcon;href: string;aria: string;newTab: boolean;}[];
  if (actions.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={PhoneCallIcon} title="Add a phone, email, WhatsApp or website" hint="Only the ones you fill in show" theme={theme} /> : null;
  const stack = c.layout === 'stack';
  return (
    <section>
      {c.title && <h2 className="mb-3 text-center text-[18px] font-medium" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.title}</h2>}
      <div className={cn(stack ? 'flex flex-col gap-2.5' : 'grid gap-2.5')} style={stack ? undefined : { gridTemplateColumns: `repeat(${Math.min(actions.length, 4)}, minmax(0, 1fr))` }}>
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <PageAction key={a.key} mode={mode} href={a.href} newTab={a.newTab} ariaLabel={a.aria} className={cn('flex items-center justify-center gap-2 text-[14px] font-semibold', stack ? 'h-12' : 'h-14 flex-col gap-1 text-[12.5px]')} style={buttonStyle(theme, i === 0 ? 'featured' : 'default')}>
              <Icon size={stack ? 16 : 18} aria-hidden />
              {a.label}
            </PageAction>);

        })}
      </div>
    </section>);

}