import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * Lightweight mode for visitors on public pages (D85). When on: photos and videos wait until the
 * visitor asks for them and every animation is calmed. Turns on by itself when the browser
 * reports Data Saver or a 2G connection; the visitor's own choice is remembered on their device.
 */
const KEY = 'kubicu.dataSaver';

interface DataSaverValue {
  on: boolean;
  /** True when it turned on because of the connection rather than the visitor's choice. */
  auto: boolean;
  /** Why it's on when the visitor didn't choose it (D88). */
  reason: 'network' | 'seller' | null;
  /** Images revealed for this visit while staying in data saver. */
  imagesShown: boolean;
  setOn: (on: boolean) => void;
  showImages: () => void;
}

const DataSaverContext = createContext<DataSaverValue>({ on: false, auto: false, reason: null, imagesShown: true, setOn: () => {}, showImages: () => {} });

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

function connectionIsSlow(): boolean {
  const c = (navigator as Navigator & {connection?: NetworkInformationLike;}).connection;
  return !!c && (c.saveData === true || c.effectiveType === '2g' || c.effectiveType === 'slow-2g');
}

function readChoice(): 'on' | 'off' | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'on' || v === 'off' ? v : null;
  } catch {
    return null;
  }
}

export function DataSaverProvider({ children, disabled = false, sellerDefault = false }: {children: React.ReactNode;disabled?: boolean;sellerDefault?: boolean;}) {
  const [choice, setChoice] = useState<'on' | 'off' | null>(() => readChoice());
  const [slow] = useState(() => connectionIsSlow());
  const [imagesShown, setImagesShown] = useState(false);

  // The visitor's own choice always wins; otherwise the connection, then the seller's default.
  const on = !disabled && (choice ? choice === 'on' : slow || sellerDefault);
  const reason: DataSaverValue['reason'] = on && !choice ? slow ? 'network' : 'seller' : null;
  const setOn = useCallback((next: boolean) => {
    setChoice(next ? 'on' : 'off');
    setImagesShown(false);
    try {
      window.localStorage.setItem(KEY, next ? 'on' : 'off');
    } catch {

      // Choice lasts for this visit only.
    }}, []);
  const showImages = useCallback(() => setImagesShown(true), []);

  const value = useMemo(() => ({ on, auto: reason === 'network', reason, imagesShown: !on || imagesShown, setOn, showImages }), [on, reason, imagesShown, setOn, showImages]);
  return (
    <DataSaverContext.Provider value={value}>
      {on ? <MotionConfig reducedMotion="always">{children}</MotionConfig> : children}
    </DataSaverContext.Provider>);

}

export function useDataSaver(): DataSaverValue {
  return useContext(DataSaverContext);
}