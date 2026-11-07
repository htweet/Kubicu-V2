import React from 'react';
import type { SubStatus } from '../../types/subscriptions';
import { subStatusLabels } from '../../utils/commerce/subscriptions';
import { Badge, type BadgeTone } from '../ui/Badge';

const tone: Record<SubStatus, BadgeTone> = {
  trialing: 'info',
  active: 'success',
  paused: 'neutral',
  past_due: 'danger',
  cancelling: 'warning',
  ended: 'neutral',
};

export function SubStatusBadge({ status }: { status: SubStatus }) {
  return (
    <Badge tone={tone[status]} dot>
      {subStatusLabels[status]}
    </Badge>
  );
}
