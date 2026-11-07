import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CampaignPhase } from '../types/page';
import type { SourceId } from '../types/analytics';

interface CampaignPreviewValue {
  /** Which phase the canvas shows; null until the user picks one (then it follows the live phase). */
  phase: CampaignPhase | null;
  setPhase: (p: CampaignPhase | null) => void;
  /** IntentFlow (D64): preview the page as visitors from this source. Null = edit view (every block). */
  source: SourceId | null;
  setSource: (s: SourceId | null) => void;
}

const CampaignPreviewContext = createContext<CampaignPreviewValue>({ phase: null, setPhase: () => undefined, source: null, setSource: () => undefined });

/** What the canvas previews: a campaign phase (D52) and/or a visitor source (D64). */
export function CampaignPreviewProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<CampaignPhase | null>(null);
  const [source, setSource] = useState<SourceId | null>(null);
  const value = useMemo(() => ({ phase, setPhase, source, setSource }), [phase, source]);
  return <CampaignPreviewContext.Provider value={value}>{children}</CampaignPreviewContext.Provider>;
}

export function useCampaignPreview(): CampaignPreviewValue {
  return useContext(CampaignPreviewContext);
}
