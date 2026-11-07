import React, { createContext, useContext } from 'react';
import type { OpsData } from '../types/ops';
import type { FormDef } from '../types/forms';
import type { Answers } from '../utils/forms/logic';
import { useOptionalOps } from './OpsContext';

export interface PageOpsActions {
  submitLead: (input: { name: string; email: string; phone: string; message: string }, formTitle: string, consent: boolean) => boolean;
  subscribe: (input: { email: string }, listTitle: string) => boolean;
  openBooking: (serviceId: string) => void;
  /** Forms add-on (D79): save a submission, update Audience, record analytics. */
  submitForm?: (form: FormDef, answers: Answers, paymentNgn: number | null) => boolean;
  trackForm?: (formId: string, stage: 'view' | 'start') => void;
}

interface PageOpsValue {
  data: OpsData | null;
  actions: PageOpsActions | null;
  /** Workspace that owns the page being rendered (live pages only). */
  workspaceId?: string | null;
}

const PageOpsContext = createContext<PageOpsValue | undefined>(undefined);

/** Services and form handling for the page being rendered. Absent in the editor (inert). */
export function PageOpsProvider({ value, children }: { value: PageOpsValue; children: React.ReactNode }) {
  return <PageOpsContext.Provider value={value}>{children}</PageOpsContext.Provider>;
}

export function usePageOpsContext(): PageOpsValue {
  const override = useContext(PageOpsContext);
  const own = useOptionalOps();
  return override ?? { data: own?.data ?? null, actions: null };
}
