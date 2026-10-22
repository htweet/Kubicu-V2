import React from 'react';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast, plans } from '../../data/plans';
import { BOOKINGS_PLAN } from '../../utils/ops/linkIssues';
import { InlineAlert } from '../ui/InlineAlert';
import { UpgradeButton } from '../ui/UpgradeButton';

export function BookingsPlanNote() {
  const plan = usePlan();
  if (planAtLeast(plan.id, BOOKINGS_PLAN)) return null;
  return (
    <InlineAlert tone="info" title={`Built-in booking is on ${plans[BOOKINGS_PLAN].name}`} className="mt-6" action={<UpgradeButton plan={BOOKINGS_PLAN} feature="Built-in booking on your page" />}>
      Set up services and availability now. Booking blocks can’t be published on {plan.name}; you can still link to an outside booking page.
    </InlineAlert>);

}