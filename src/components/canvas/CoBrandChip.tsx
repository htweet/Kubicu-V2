import React, { useState } from 'react';
import { HandshakeIcon } from 'lucide-react';
import { useCoBrand } from '../../hooks/useCoBrand';
import { CoBrandSheet } from './CoBrandSheet';
import { cn } from '../../utils/cn';

/**
 * Top-bar entry to the partner panel on co-branded spaces (D121). Amber dot = waiting on approval.
 * `compact` is the icon-only version for the phone canvas header (D123).
 */
export function CoBrandChip({ compact = false }: {compact?: boolean;}) {
  const { cb, needsApproval, actor } = useCoBrand();
  const [open, setOpen] = useState(false);
  if (!cb) return null;
  const label = `Partner panel — with ${cb.partnerName}${needsApproval ? ', needs approval' : ''}${actor === 'partner' ? `, acting as ${cb.partnerName}` : ''}`;
  return (
    <>
      {compact ?
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors duration-150 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        
          <HandshakeIcon size={19} aria-hidden />
          <span aria-hidden className={cn('absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-[rgb(var(--raised))]', needsApproval ? 'bg-warning' : 'bg-success')} />
        </button> :

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className="relative inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-line bg-sunken px-2.5 text-caption font-medium text-fg transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        
          <HandshakeIcon size={13} aria-hidden />
          <span className="hidden max-w-[9rem] truncate lg:inline">{actor === 'partner' ? `As ${cb.partnerName}` : `With ${cb.partnerName}`}</span>
          <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', needsApproval ? 'bg-warning' : 'bg-success')} />
        </button>
      }
      <CoBrandSheet open={open} onClose={() => setOpen(false)} />
    </>);

}