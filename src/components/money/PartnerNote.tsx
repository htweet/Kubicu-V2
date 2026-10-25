import React from 'react';
import { LandmarkIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

/**
 * Regulatory framing on every money screen (D92): KUBICU never holds funds itself.
 * Balances sit with a licensed payment partner that is still to be chosen.
 */
export function PartnerNote({ className, children }: {className?: string;children?: React.ReactNode;}) {
  const { t } = useT();
  const body = typeof children === 'string' ? t(children) : children ?? t('No real money moves. KUBICU shows and instructs balances; it doesn’t hold them. Going live needs regulatory sign-off.');
  return (
    <p className={cn('flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2 text-label text-warning', className)} role="note">
      <LandmarkIcon size={15} strokeWidth={2.25} className="mt-0.5 shrink-0" aria-hidden />
      <span>
        <span className="font-semibold">{t('Held by our licensed payment partner · Test mode.')}</span> {body}
      </span>
    </p>);

}