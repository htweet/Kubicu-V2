import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { CommerceData } from '../types/commerce';
import { useCommerce } from '../contexts/CommerceContext';
import { readCommerce, writeCommerce } from '../utils/commerce/storage';
import { setActiveBackorders, shopSettingsOf } from '../utils/commerce/shopSettings';

export interface PageCommerce {
  data: CommerceData | null;
  apply: (fn: (d: CommerceData) => CommerceData) => boolean;
}

/**
 * Commerce for the page being viewed. The current workspace’s page uses the live store;
 * another workspace’s page (on this device) reads and writes that workspace’s saved data.
 */
export function usePageCommerce(workspaceId: string | null, isOwn: boolean): PageCommerce {
  const own = useCommerce();
  const [other, setOther] = useState<CommerceData | null>(() => !isOwn && workspaceId ? readCommerce(workspaceId) : null);

  useEffect(() => {
    if (isOwn || !workspaceId) return;
    setOther(readCommerce(workspaceId));
  }, [isOwn, workspaceId]);

  const applyOther = useCallback(
    (fn: (d: CommerceData) => CommerceData) => {
      if (!workspaceId) return false;
      const current = readCommerce(workspaceId);
      if (!current) return false;
      const next = fn(current);
      try {
        writeCommerce(workspaceId, next);
      } catch {
        toast.error('Couldn’t complete that', { description: 'Browser storage is full.' });
        return false;
      }
      setOther(next);
      return true;
    },
    [workspaceId]
  );

  // Visitors' checkouts aren't limited by the signed-in member's role.
  const data = isOwn ? own.data : other;
  // Stock checks on this page follow the seller's "Allow backorders" setting (D222).
  setActiveBackorders(shopSettingsOf(data).orders.backorders);
  if (isOwn) return { data: own.data, apply: own.applySystem };
  return { data: other, apply: applyOther };
}