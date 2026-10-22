import type { PageDocument } from '../../types/page';
import type { OpsData } from '../../types/ops';
import type { WorkspacePlan } from '../../types/plan';
import type { ValidationIssue } from '../validation';
import { planAtLeast } from '../../data/plans';

/** Built-in booking is a Pro feature (hypothesis). */
export const BOOKINGS_PLAN: WorkspacePlan = 'pro';

export function opsLinkIssues(doc: PageDocument, data: OpsData | null, plan: WorkspacePlan): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const allowed = planAtLeast(plan, BOOKINGS_PLAN);
  doc.blocks.
  filter((b) => !b.visibility.hidden).
  forEach((b) => {
    if (b.type === 'booking' && b.content.source === 'catalog') {
      const s = data?.services.find((x) => x.id === b.content.serviceId);
      if (!allowed) issues.push({ id: `${b.id}:ops:plan`, blockId: b.id, severity: 'error', message: 'Built-in booking is on the Pro plan — switch to a link or upgrade', field: 'source' });
      if (!s) issues.push({ id: `${b.id}:ops:svc`, blockId: b.id, severity: 'error', message: 'Choose a service from Bookings', field: 'serviceId' });else
      if (!s.active) issues.push({ id: `${b.id}:ops:off`, blockId: b.id, severity: 'warning', message: `“${s.name}” is switched off, so this block is hidden`, field: 'serviceId' });
    }
    if (b.type === 'pricing') {
      const missing = b.content.packages.filter((p) => p.serviceId && !data?.services.some((s) => s.id === p.serviceId));
      if (missing.length) issues.push({ id: `${b.id}:ops:pk`, blockId: b.id, severity: 'error', message: 'A package books a service that no longer exists', field: 'packages' });
      if (!allowed && b.content.packages.some((p) => p.serviceId)) issues.push({ id: `${b.id}:ops:pkplan`, blockId: b.id, severity: 'error', message: 'Booking from packages is on the Pro plan', field: 'packages' });
    }
  });
  return issues;
}