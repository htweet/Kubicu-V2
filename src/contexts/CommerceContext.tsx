import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { CommerceData } from '../types/commerce';
import { useWorkspace } from './WorkspaceContext';
import { DEMO_WORKSPACE_ID } from '../utils/workspaceStorage';
import { commerceKey, emptyCommerce, readCommerce, writeCommerce } from '../utils/commerce/storage';
import { withSampleData } from '../data/commerceSeed';
import { clearSample } from '../utils/commerce/ops';

interface CommerceValue {
  data: CommerceData;
  /** Applies a pure update and saves it. Returns false if saving failed. */
  apply: (fn: (data: CommerceData) => CommerceData) => boolean;
  loadSample: () => void;
  clearSampleData: () => void;
  hasSample: boolean;
}

const CommerceContext = createContext<CommerceValue | null>(null);

function initial(workspaceId: string): CommerceData {
  const stored = readCommerce(workspaceId);
  if (stored) return stored;
  // The demo workspace starts with labelled sample data so every screen has something to show.
  return workspaceId === DEMO_WORKSPACE_ID ? withSampleData(emptyCommerce()) : emptyCommerce();
}

/** The current workspace's products, stock and orders, saved in this browser. */
export function CommerceProvider({ children }: {children: React.ReactNode;}) {
  const workspaceId = useWorkspace().current.id;
  const [data, setData] = useState<CommerceData>(() => initial(workspaceId));
  const dataRef = useRef(data);
  dataRef.current = data;

  // First save for freshly seeded data.
  useEffect(() => {
    if (readCommerce(workspaceId)) return;
    try {
      writeCommerce(workspaceId, dataRef.current);
    } catch {

      // Storage unavailable — data lasts for this visit.
    }}, [workspaceId]);

  // Orders placed from the public page in another tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== commerceKey(workspaceId)) return;
      const next = readCommerce(workspaceId);
      if (next) setData(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [workspaceId]);

  const apply = useCallback(
    (fn: (d: CommerceData) => CommerceData) => {
      const next = fn(dataRef.current);
      try {
        writeCommerce(workspaceId, next);
      } catch {
        toast.error('Couldn’t save', { description: 'Your browser storage is full. Remove some product photos and try again.' });
        return false;
      }
      dataRef.current = next;
      setData(next);
      return true;
    },
    [workspaceId]
  );

  const loadSample = useCallback(() => {
    if (apply((d) => withSampleData(clearSample(d)))) toast('Sample data added', { description: 'Everything sample is labelled. Clear it any time from Commerce settings.' });
  }, [apply]);

  const clearSampleData = useCallback(() => {
    if (apply((d) => ({ ...clearSample(d), sampleSeeded: true }))) toast('Sample data cleared');
  }, [apply]);

  const hasSample = useMemo(() => data.products.some((p) => p.sample) || data.orders.some((o) => o.sample), [data]);

  const value = useMemo(() => ({ data, apply, loadSample, clearSampleData, hasSample }), [data, apply, loadSample, clearSampleData, hasSample]);
  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce(): CommerceValue {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error('useCommerce must be used inside CommerceProvider');
  return ctx;
}

/** For renderers that may sit outside the workspace (e.g. template previews). */
export function useOptionalCommerce(): CommerceValue | null {
  return useContext(CommerceContext);
}