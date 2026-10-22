import React, { createContext, useContext } from 'react';
import type { OpsData } from '../types/ops';
import { useOptionalOps } from './OpsContext';

export interface PageOpsActions {
  submitLead: (input: {name: string;email: string;phone: string;message: string;}, formTitle: string, consent: boolean) => boolean;
  subscribe: (input: {email: string;}, listTitle: string) => boolean;
  openBooking: (serviceId: string) => void;
}

interface PageOpsValue {
  data: OpsData | null;
  actions: PageOpsActions | null;
}

const PageOpsContext = createContext<PageOpsValue | undefined>(undefined);

/** Services and form handling for the page being rendered. Absent in the editor (inert). */
export function PageOpsProvider({ value, children }: {value: PageOpsValue;children: React.ReactNode;}) {
  return <PageOpsContext.Provider value={value}>{children}</PageOpsContext.Provider>;
}

export function usePageOpsContext(): PageOpsValue {
  const override = useContext(PageOpsContext);
  const own = useOptionalOps();
  return override ?? { data: own?.data ?? null, actions: null };
}