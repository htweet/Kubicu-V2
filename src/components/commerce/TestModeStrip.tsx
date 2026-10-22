import React from 'react';
import { FlaskConicalIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

/** Calm, persistent reminder that no real money moves in this prototype. */
export function TestModeStrip({ className }: {className?: string;}) {
  return (
    <p className={cn('flex items-center gap-2 rounded-md bg-warning-soft px-3 py-2 text-label text-warning', className)} role="note">
      <FlaskConicalIcon size={15} strokeWidth={2.25} className="shrink-0" aria-hidden />
      <span>
        <span className="font-semibold">Test mode</span> — no real money moves. Payment provider not connected (prototype).
      </span>
    </p>);

}