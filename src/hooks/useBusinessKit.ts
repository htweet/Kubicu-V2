import { useCallback, useEffect, useState } from 'react';
import type { AppliedKit, BusinessKit, KitPart, KitPolicies } from '../types/kit';
import type { Product } from '../types/commerce';
import type { Service } from '../types/ops';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useOps } from '../contexts/OpsContext';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useTeam } from '../contexts/TeamContext';
import { useApplyTemplate } from './useApplyTemplate';
import { findExampleById } from '../data/examples';
import { blankProduct } from '../components/commerce/ProductEditor';
import { newAutomation } from '../components/automations/AutomationBuilder';
import { KIT_EVENT, readAppliedKit, writeAppliedKit } from '../utils/kits';
import { uid } from '../utils/id';

export interface RemoveResult {
  removed: number;
  kept: number;
}

/** Applies a Business-in-a-Box kit across page, Commerce, Bookings, Automations and Extensions (D90). */
export function useBusinessKit() {
  const { current } = useWorkspace();
  const commerce = useCommerce();
  const ops = useOps();
  const market = useMarketplace();
  const team = useTeam();
  const applyTemplate = useApplyTemplate();
  const [applied, setApplied] = useState<AppliedKit | null>(() => readAppliedKit(current.id));

  useEffect(() => {
    const load = () => setApplied(readAppliedKit(current.id));
    load();
    window.addEventListener(KIT_EVENT, load);
    return () => window.removeEventListener(KIT_EVENT, load);
  }, [current.id]);

  const apply = useCallback(
    (kit: BusinessKit, parts: KitPart[]) => {
      const has = (p: KitPart) => parts.includes(p);
      const record: AppliedKit = { kitId: kit.id, appliedAt: new Date().toISOString(), parts, productIds: [], serviceIds: [], automationIds: [], installedApps: [], policies: null };

      if (has('page')) {
        const ex = findExampleById(kit.templateId);
        if (ex) applyTemplate(kit.name, ex.doc);
      }
      if (has('products') && kit.products.length) {
        const products: Product[] = kit.products.map((p) => ({ ...blankProduct(p.kind ?? 'physical'), name: p.name, description: p.description }));
        commerce.apply((d) => ({ ...d, products: [...products, ...d.products] }));
        record.productIds = products.map((p) => p.id);
      }
      if (has('services') && kit.services.length) {
        const services: Service[] = kit.services.map((s) => ({ id: uid('svc'), name: s.name, description: s.description, durationMin: s.durationMin, priceNgn: null, depositNgn: null, location: s.location, locationNote: '', bufferMin: 15, active: false }));
        ops.apply((d) => ({ ...d, services: [...d.services, ...services] }));
        record.serviceIds = services.map((s) => s.id);
      }
      if (has('policies')) {
        record.policies = { ...kit.policies };
        // Only fill the Bookings policy when it's empty — never overwrite the seller's own words.
        if (kit.services.length) {
          ops.apply((d) => d.availability.policy.trim() ? d : { ...d, availability: { ...d.availability, policy: kit.policies.cancellation, cancelHours: kit.policies.cancelHours ?? d.availability.cancelHours } });
        }
      }
      if (has('automations') && kit.recipes.length) {
        const autos = kit.recipes.map((r) => ({ ...newAutomation(r), status: 'draft' as const }));
        ops.apply((d) => ({ ...d, automations: [...d.automations, ...autos] }));
        record.automationIds = autos.map((a) => a.id);
      }
      if (has('apps')) {
        kit.apps.forEach((id) => {
          if (!market.data.installed[id]) {
            market.install(id, {});
            record.installedApps.push(id);
          }
        });
      }

      writeAppliedKit(current.id, record);
      team.log('settings', `applied the ${kit.name} kit`, '/app/templates?tab=kits');
      return record;
    },
    [applyTemplate, commerce, ops, market, team, current.id]
  );

  /** Takes out only what's still untouched; anything the seller has edited or switched on stays. */
  const removeAdded = useCallback((): RemoveResult => {
    if (!applied) return { removed: 0, kept: 0 };
    const pIds = new Set(applied.productIds);
    const sIds = new Set(applied.serviceIds);
    const aIds = new Set(applied.automationIds);
    let removed = 0;

    // Untouched = still a draft with no price and no photos.
    const untouchedProduct = (p: Product) => pIds.has(p.id) && p.status === 'draft' && p.priceNgn === null && p.images.length === 0;
    removed += commerce.data.products.filter(untouchedProduct).length;
    commerce.apply((d) => ({ ...d, products: d.products.filter((p) => !untouchedProduct(p)) }));

    const untouchedService = (s: Service) => sIds.has(s.id) && !s.active && s.priceNgn === null;
    const untouchedAuto = (a: {id: string;status: string;runs: unknown[];}) => aIds.has(a.id) && a.status === 'draft' && a.runs.length === 0;
    removed += ops.data.services.filter(untouchedService).length + ops.data.automations.filter(untouchedAuto).length;
    ops.apply((d) => ({ ...d, services: d.services.filter((s) => !untouchedService(s)), automations: d.automations.filter((a) => !untouchedAuto(a)) }));

    // Items deleted by the seller since don't count as kept.
    const stillThere = commerce.data.products.filter((p) => pIds.has(p.id)).length + ops.data.services.filter((s) => sIds.has(s.id)).length + ops.data.automations.filter((a) => aIds.has(a.id)).length;
    const total = stillThere;
    writeAppliedKit(current.id, { ...applied, removedAt: new Date().toISOString() });
    team.log('settings', 'removed the untouched items a kit added', '/app/templates?tab=kits');
    return { removed, kept: Math.max(0, total - removed) };
  }, [applied, commerce, ops, team, current.id]);

  const savePolicies = useCallback(
    (policies: KitPolicies) => {
      if (!applied) return;
      writeAppliedKit(current.id, { ...applied, policies });
    },
    [applied, current.id]
  );

  return { applied, apply, removeAdded, savePolicies };
}