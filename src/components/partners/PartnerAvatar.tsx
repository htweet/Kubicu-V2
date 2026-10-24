import React from 'react';
import { BadgeCheckIcon } from 'lucide-react';
import type { PartnerBusiness } from '../../types/partnership';
import { cn } from '../../utils/cn';

const initials = (name: string) => {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return (p.length > 1 ? `${p[0][0]}${p[1][0]}` : (p[0] ?? '?').slice(0, 2)).toUpperCase();
};

/** Logo or initials for a partner business, with a verified tick when KUBICU has verified them. */
export function PartnerAvatar({ partner, size = 'md' }: {partner: Pick<PartnerBusiness, 'name' | 'logo' | 'verified'>;size?: 'sm' | 'md' | 'lg';}) {
  const dim = size === 'lg' ? 'h-14 w-14 text-heading' : size === 'sm' ? 'h-8 w-8 text-caption' : 'h-10 w-10 text-label';
  return (
    <span className="relative inline-flex shrink-0">
      {partner.logo ?
      <img src={partner.logo} alt="" className={cn('rounded-full border border-line object-cover', dim)} /> :

      <span aria-hidden className={cn('flex items-center justify-center rounded-full bg-sunken font-semibold text-fg-muted', dim)}>
          {initials(partner.name)}
        </span>
      }
      {partner.verified &&
      <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-raised">
          <BadgeCheckIcon size={size === 'lg' ? 18 : 14} className="text-info" aria-label="Verified business" />
        </span>
      }
    </span>);

}