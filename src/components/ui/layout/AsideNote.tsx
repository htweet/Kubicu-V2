import React from 'react';
import { useT } from '../../../contexts/LocaleContext';

interface AsideNoteProps {
  id: string;
  title: React.ReactNode;
  text: React.ReactNode;
  /** One optional action under the text. */
  children?: React.ReactNode;
}

/**
 * Secondary, chrome-free note for the side column of settings screens (D75).
 * Stack them in a `divide-y divide-line` aside; first one sits flush with the column top.
 * String title and text follow the interface language, like Card and Stat.
 */
export function AsideNote({ id, title, text, children }: AsideNoteProps) {
  const { t } = useT();
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-1 py-5 first:pt-0 last:pb-0">
      <h2 id={`${id}-title`} className="text-label font-semibold text-fg">
        {typeof title === 'string' ? t(title) : title}
      </h2>
      <p className="text-label text-fg-muted">{typeof text === 'string' ? t(text) : text}</p>
      {children && <div className="mt-3">{children}</div>}
    </section>
  );
}
