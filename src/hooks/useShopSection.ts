import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ShopSettings } from '../types/commerce';
import { useCommerce } from '../contexts/CommerceContext';
import { shopSettingsOf } from '../utils/commerce/shopSettings';

/**
 * One section of Commerce settings with its own draft and Save (D222).
 * Each section saves on its own, so a half-finished section never blocks another.
 */
export function useShopSection<K extends keyof ShopSettings>(key: K, savedLabel: string) {
  const { data, apply } = useCommerce();
  const saved = shopSettingsOf(data)[key];
  const savedJson = JSON.stringify(saved);
  const [draft, setDraft] = useState<ShopSettings[K]>(saved);
  const [justSaved, setJustSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== savedJson;

  // Pick up changes made elsewhere (another tab, sample data) while nothing is being edited here.
  useEffect(() => {
    if (!dirty) setDraft(JSON.parse(savedJson) as ShopSettings[K]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedJson]);

  useEffect(() => {
    if (!justSaved) return;
    const t = window.setTimeout(() => setJustSaved(false), 2400);
    return () => window.clearTimeout(t);
  }, [justSaved]);

  const patch = (p: Partial<ShopSettings[K]>) => {
    setJustSaved(false);
    setDraft((d) => (typeof d === 'object' && d !== null ? ({ ...d, ...p } as ShopSettings[K]) : (p as ShopSettings[K])));
  };

  const save = (value: ShopSettings[K] = draft): boolean => {
    const ok = apply((d) => ({ ...d, shop: { ...d.shop, [key]: value } }));
    if (ok) {
      setDraft(value);
      setJustSaved(true);
      toast(savedLabel, { description: 'Checkout and receipts use it straight away.' });
    }
    return ok;
  };

  const reset = () => setDraft(JSON.parse(savedJson) as ShopSettings[K]);

  return { draft, setDraft, patch, save, reset, dirty, justSaved, data };
}
