import React from 'react';
import { useAppearancePolicy } from '../../contexts/AppearancePolicyContext';

/**
 * Public KUBICU surfaces (website, sign-up, onboarding) use the platform's default look,
 * set by super admin — not whichever workspace happens to be open on this device.
 */
export function PlatformLook({ children }: {children: React.ReactNode;}) {
  const { defaultDirection } = useAppearancePolicy();
  return (
    <div data-direction={defaultDirection} className="min-h-screen w-full bg-canvas text-fg">
      {children}
    </div>);

}