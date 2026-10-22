import React, { createContext, useContext } from 'react';
import type { CommerceData } from '../types/commerce';
import { useOptionalCommerce } from './CommerceContext';

interface CatalogOverride {
  data: CommerceData | null;
}

const CatalogContext = createContext<CatalogOverride | undefined>(undefined);

/** The catalogue of the page being rendered — another workspace's on public pages, none for examples. */
export function CatalogProvider({ data, children }: {data: CommerceData | null;children: React.ReactNode;}) {
  return <CatalogContext.Provider value={{ data }}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CommerceData | null {
  const override = useContext(CatalogContext);
  const own = useOptionalCommerce();
  return override !== undefined ? override.data : own?.data ?? null;
}