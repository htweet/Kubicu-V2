import React from 'react';
import { useOps } from '../../../contexts/OpsContext';
import { opsSettingsOf } from '../../../utils/ops/settings';

/** One tap to use the workspace's standard consent note from Audience settings (D259). Hidden when there isn't one or it's already used. */
export function StandardConsent({ current, onUse }: {current: string;onUse: (text: string) => void;}) {
  const standard = opsSettingsOf(useOps().data).consentText;
  if (!standard || current.trim() === standard) return null;
  return (
    <button type="button" onClick={() => onUse(standard)} className="-mt-1 self-start text-caption font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      {current.trim() ? 'Replace with your standard consent note' : 'Use your standard consent note'}
    </button>);

}