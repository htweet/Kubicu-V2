import React from 'react';
import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon, CircleDashedIcon } from 'lucide-react';
import type { CheckResult } from '../../types/kyc';
import { checkLabels, checkTones } from '../../utils/money/kyc';
import { Badge } from '../ui/Badge';

const icons = { not_run: CircleDashedIcon, pass: CheckCircle2Icon, review: AlertTriangleIcon, fail: XCircleIcon };

/** Result of a simulated partner check — always a word plus an icon, never colour alone. */
export function CheckBadge({ result, label }: {result: CheckResult;label?: string;}) {
  return (
    <Badge tone={checkTones[result]} icon={icons[result]}>
      {label ? `${label}: ` : ''}
      {checkLabels[result]}
    </Badge>);

}