import React from 'react';

interface DsSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DsSection({ id, title, description, children }: DsSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8 border-t border-line pt-10">
      <h2 id={`${id}-title`} className="text-heading font-semibold text-fg">
        {title}
      </h2>
      {description && <p className="mt-1 max-w-2xl text-label text-fg-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>);

}

export function DsLabel({ children }: {children: React.ReactNode;}) {
  return <p className="mb-3 text-caption font-medium text-fg-subtle">{children}</p>;
}