import React from 'react';
import { MessageCircleIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { PageAction } from './PageAction';
import { buttonStyle } from './pageStyle';
import { whatsappLink } from '../../utils/format';
import { isValidPhone } from '../../utils/validation';
import { waNumber } from '../../utils/businessWhatsApp';
import { useT } from '../../contexts/LocaleContext';

export function WhatsAppBlock({ block, theme, mode }: BlockProps<'whatsapp'>) {
  const { t: tr } = useT();
  const { label, message } = block.content;
  const phone = waNumber(block.content.phone);
  const href = isValidPhone(phone) ? whatsappLink(phone, message) : '';
  return (
    <PageAction
      mode={mode}
      href={href}
      newTab
      ariaLabel={block.accessibility.label || undefined}
      className="flex min-h-[56px] w-full items-center justify-center gap-2.5 px-5 py-3 text-[15px] font-semibold"
      style={buttonStyle(theme, block.style.emphasis)}>
      
      <MessageCircleIcon size={18} aria-hidden />
      {label || tr('Chat on WhatsApp')}
    </PageAction>);

}