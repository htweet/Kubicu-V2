import React from 'react';
import { ClockIcon, LockIcon, PuzzleIcon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';

export type BlockStatus = 'available' | 'plan' | 'app' | 'planned';

const copy: Record<Exclude<BlockStatus, 'available'>, { label: string; icon: typeof LockIcon }> = {
  plan: { label: 'Needs plan', icon: LockIcon },
  app: { label: 'Needs app', icon: PuzzleIcon },
  planned: { label: 'Planned', icon: ClockIcon },
};

/** Available · Needs plan · Needs app · Planned (D166). Text and icon, never colour alone. */
export function BlockStatusChip({ status }: { status: BlockStatus }) {
  const { t: tr } = useT();
  if (status === 'available') return null;
  const { label, icon: Icon } = copy[status];
  return (
    <span className="inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-line px-1.5 py-0.5 text-[11px] font-medium leading-none text-fg-muted">
      <Icon size={10} aria-hidden />
      {tr(label)}
    </span>
  );
}
