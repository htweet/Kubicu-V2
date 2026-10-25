import React from 'react';
import { FlaskConicalIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

interface PrototypeNoteProps {
  id: string;
  title: string;
  /** One or two sentences on what the controls simulate. */
  children: React.ReactNode;
  /** The simulation buttons. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Prototype-only controls (skip ahead in time, simulate an outcome). The dashed edge marks them
 * as not part of the real product, so they read differently from every Card (D75, D188).
 */
export function PrototypeNote({ id, title, children, actions, className }: PrototypeNoteProps) {
  const { t } = useT();
  return (
    <section aria-labelledby={`${id}-title`} className={cn('flex flex-col gap-3 rounded-lg border border-dashed border-line-strong px-5 py-4 md:px-6', className)}>
      <h2 id={`${id}-title`} className="flex items-center gap-2 text-label font-semibold text-fg">
        <FlaskConicalIcon size={15} aria-hidden /> {t(title)}
      </h2>
      <div className="text-caption text-fg-muted">{children}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>);

}