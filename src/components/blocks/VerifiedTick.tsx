import React from 'react';
import { BadgeCheckIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useVerifiedTick } from '../../hooks/useVerifiedTick';
import { contrastRatio } from '../../utils/contrast';

/**
 * The tick after a seller's name (D254). It can't be added or styled by the seller — it appears only while
 * KUBICU has approved their verification and operations haven't hidden it.
 */
export function VerifiedTick({ theme, size = 22 }: { theme: PageTheme; size?: number }) {
  const pageOps = usePageOpsContext();
  const { current } = useWorkspace();
  const tick = useVerifiedTick(pageOps.workspaceId ?? current.id);
  if (!tick.shown) return null;
  // The theme's accent when it's readable on the page, otherwise the text colour.
  const color = contrastRatio(theme.accent, theme.background) >= 3 ? theme.accent : theme.text;
  return (
    <span className="relative inline-flex shrink-0 align-[-0.12em]" title={tick.label}>
      <BadgeCheckIcon size={size} strokeWidth={2.2} style={{ color }} aria-hidden />
      <span className="sr-only">{tick.label}</span>
    </span>
  );
}
