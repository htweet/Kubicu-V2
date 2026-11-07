import React from 'react';
import { ArrowUpCircleIcon } from 'lucide-react';
import type { WorkspacePlan } from '../../types/plan';
import { plans } from '../../data/plans';
import { useUpgrade } from '../../contexts/UpgradeContext';
import { Button, type ButtonVariant } from './Button';

interface UpgradeButtonProps {
  plan: WorkspacePlan;
  feature: string;
  variant?: ButtonVariant;
  className?: string;
}

/** The one way to upgrade from anywhere a plan limit applies. */
export function UpgradeButton({ plan, feature, variant = 'secondary', className }: UpgradeButtonProps) {
  const { openUpgrade } = useUpgrade();
  return (
    <Button size="sm" variant={variant} leadingIcon={ArrowUpCircleIcon} className={className} onClick={() => openUpgrade({ plan, feature })}>
      Upgrade to {plans[plan].name}
    </Button>
  );
}
