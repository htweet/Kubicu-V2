import React from 'react';
import { KeyRoundIcon } from 'lucide-react';
import type { MembersAreaSettings, PageTheme } from '../../types/page';
import { MembersProvider, type MembersValue } from '../../contexts/MembersContext';
import { MembersLocked } from '../members/MembersGate';
import { cn } from '../../utils/cn';

export type MemberView = 'member' | 'visitor';

/** Canvas switch (D185): see the Members area as a signed-in member (editable) or as everyone else. */
export function MembersAreaPreviewBar({ view, onChange, className }: { view: MemberView; onChange: (v: MemberView) => void; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-raised px-3 py-2', className)} onClick={(e) => e.stopPropagation()}>
      <span className="inline-flex min-w-0 items-center gap-2 text-caption text-fg-muted">
        <KeyRoundIcon size={14} className="shrink-0 text-action" aria-hidden />
        {view === 'member' ? 'Members see this page. Edit it as usual.' : 'Everyone else sees only this welcome card.'}
      </span>
      <div role="group" aria-label="Preview the members area as" className="flex items-center gap-0.5 rounded-md border border-line p-0.5">
        {(['member', 'visitor'] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => onChange(v)}
            className={cn('min-h-[32px] whitespace-nowrap rounded-sm px-2.5 text-caption font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', view === v ? 'bg-sunken text-fg' : 'text-fg-muted hover:text-fg')}
          >
            {v === 'member' ? 'Member' : 'Not a member'}
          </button>
        ))}
      </div>
    </div>
  );
}

const inert: MembersValue = {
  handle: '',
  session: null,
  preview: 'visitor',
  check: () => ({ ok: false, reason: 'signed_out' }),
  openSignIn: () => undefined,
  signOut: () => undefined,
  join: () => undefined,
};

/** The welcome card exactly as non-members see it, with its buttons inert. */
export function MembersAreaWelcomePreview({ area, theme, handle }: { area: MembersAreaSettings; theme: PageTheme; handle: string }) {
  return (
    <MembersProvider value={{ ...inert, handle }}>
      <MembersLocked theme={theme} rule={area.rule} id={`area-preview-${handle}`} kind="page" title={area.title} teaser={area.teaser} joinLabel={area.joinLabel} hiddenCount={0} access={{ ok: false, reason: 'signed_out' }} />
    </MembersProvider>
  );
}
