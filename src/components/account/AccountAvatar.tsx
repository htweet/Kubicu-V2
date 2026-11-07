import React from 'react';
import { initialsOf } from '../../utils/account/store';
import { cn } from '../../utils/cn';

const sizes = { sm: 'h-8 w-8 text-caption', md: 'h-10 w-10 text-label', lg: 'h-20 w-20 text-title' } as const;

/** The signed-in person: their photo, or initials on the action colour. */
export function AccountAvatar({ name, photo, size = 'sm', className }: { name: string; photo: string | null; size?: keyof typeof sizes; className?: string }) {
  if (photo) return <img src={photo} alt="" className={cn('shrink-0 rounded-full object-cover', sizes[size], className)} />;
  return (
    <span aria-hidden className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-action font-semibold text-action-fg', sizes[size], className)}>
      {initialsOf(name)}
    </span>
  );
}
