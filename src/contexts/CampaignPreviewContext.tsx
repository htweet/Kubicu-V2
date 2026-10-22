import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CampaignPhase } from '../types/page';

interface CampaignPreviewValue {
  /** Which phase the canvas shows; null until the user picks one (then it follows the live phase). */
  phase: CampaignPhase | null;
  setPhase: (p: CampaignPhase | null) => void;
}

const CampaignPreviewContext = createContext<CampaignPreviewValue>({ phase: null, setPhase: () => undefined });

/** The phase previewed in the canvas for a campaign space (D52). */
export function CampaignPreviewProvider({ children }: {children: React.ReactNode;}) {
  const [phase, setPhase] = useState<CampaignPhase | null>(null);
  const value = useMemo(() => ({ phase, setPhase }), [phase]);
  return <CampaignPreviewContext.Provider value={value}>{children}</CampaignPreviewContext.Provider>;
}

export function useCampaignPreview(): CampaignPreviewValue {
  return useContext(CampaignPreviewContext);
}