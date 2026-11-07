import { useCallback, useEffect, useState } from 'react';
import type { WhatsAppData } from '../types/whatsapp';
import { readWhatsApp, WHATSAPP_EVENT, writeWhatsApp } from '../utils/whatsapp';

/** WhatsApp Commerce Bridge data for one workspace (D97), synced across screens and tabs. */
export function useWhatsApp(workspaceId: string) {
  const [data, setData] = useState<WhatsAppData>(() => readWhatsApp(workspaceId));

  useEffect(() => {
    const sync = () => setData(readWhatsApp(workspaceId));
    sync();
    window.addEventListener(WHATSAPP_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(WHATSAPP_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [workspaceId]);

  const update = useCallback((fn: (d: WhatsAppData) => WhatsAppData) => writeWhatsApp(workspaceId, fn(readWhatsApp(workspaceId))), [workspaceId]);

  return { data, update };
}
