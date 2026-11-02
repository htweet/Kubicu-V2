import React from 'react';
import type { DeliverableStatus } from '../../types/sponsorship';
import { Badge, type BadgeTone } from '../ui/Badge';

// Badge translates its string label (D446).
const labels: Record<DeliverableStatus, [string, BadgeTone]> = {
  todo: ['To do', 'neutral'],
  submitted: ['Waiting for approval', 'info'],
  changes: ['Changes asked', 'warning'],
  approved: ['Approved · paid', 'success']
};

export function DeliverableStatusBadge({ status }: {status: DeliverableStatus;}) {
  const [label, tone] = labels[status];
  return <Badge tone={tone}>{label}</Badge>;
}