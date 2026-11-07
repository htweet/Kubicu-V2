import React, { createContext, useContext } from 'react';

/** Reviewer-only switches for KUBICU Copilot (D262), set from the Controls panel. Never shown in the product. */
export type CopilotWhatsAppOption = 'available' | 'unavailable';
export type CopilotFailureOption = 'none' | 'generation' | 'previewImage' | 'expiredLink' | 'signIn';

interface CopilotSim {
  whatsapp: CopilotWhatsAppOption;
  failure: CopilotFailureOption;
}

const CopilotSimContext = createContext<CopilotSim>({ whatsapp: 'available', failure: 'none' });

export function CopilotSimProvider({ whatsapp, failure, children }: CopilotSim & { children: React.ReactNode }) {
  return <CopilotSimContext.Provider value={{ whatsapp, failure }}>{children}</CopilotSimContext.Provider>;
}

export function useCopilotSim(): CopilotSim {
  return useContext(CopilotSimContext);
}
