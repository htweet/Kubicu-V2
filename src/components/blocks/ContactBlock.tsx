import React from "react";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, BoxIcon } from "lucide-react";
import { BlockProps } from "./blockProps";
import { BlockPlaceholder } from "./BlockPlaceholder";
import { PageAction } from "./PageAction";
import { cardStyle, mix } from "./pageStyle";
interface Row {
  icon: BoxIcon;
  label: string;
  value: string;
  href: string;
}
export function ContactBlock({
  block,
  theme,
  mode
}: BlockProps<'contact'>) {
  const {
    phone,
    email,
    address,
    hours
  } = block.content;
  const rows: Row[] = [phone && {
    icon: PhoneIcon,
    label: 'Call',
    value: phone,
    href: `tel:${phone.replace(/\s/g, '')}`
  }, email && {
    icon: MailIcon,
    label: 'Email',
    value: email,
    href: `mailto:${email}`
  }, address && {
    icon: MapPinIcon,
    label: 'Visit',
    value: address,
    href: `https://maps.google.com/?q=${encodeURIComponent(address)}`
  }, hours && {
    icon: ClockIcon,
    label: 'Hours',
    value: hours,
    href: ''
  }].filter((r): r is Row => Boolean(r));
  if (rows.length === 0) {
    return mode === 'edit' ? <BlockPlaceholder icon={PhoneIcon} title="No contact details" hint="Add a phone, email, address or hours" theme={theme} /> : null;
  }
  return <ul className="overflow-hidden" style={cardStyle(theme)}>
      {rows.map((row, i) => {
      const Icon = row.icon;
      return <li key={row.label} style={i > 0 ? {
        borderTop: `1px solid ${mix(theme.text, 8)}`
      } : undefined}>
            <PageAction mode={mode} href={row.href} newTab={row.label === 'Visit'} className="flex min-h-[52px] items-center gap-3 px-4 py-3" style={{
          color: theme.text
        }}>
              <Icon size={16} className="shrink-0" style={{
            color: theme.mutedText
          }} aria-hidden />
              <span className="flex min-w-0 flex-col">
                <span className="text-[11.5px]" style={{
              color: theme.mutedText
            }}>
                  {row.label}
                </span>
                <span className="text-[14px] leading-snug">{row.value}</span>
              </span>
            </PageAction>
          </li>;
    })}
    </ul>;
}