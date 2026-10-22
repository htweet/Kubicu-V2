import React from 'react';

export function Kbd({ children }: {children: React.ReactNode;}) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-line-strong bg-sunken px-1 font-sans text-meta font-medium text-fg-muted">
      {children}
    </kbd>);

}