import React from 'react';
import { useAppearancePolicy } from '../../contexts/AppearancePolicyContext';

interface PlatformLookProps {
  children: React.ReactNode;
  /** Website, legal and sign-in pages use the Night market look (D77). Onboarding keeps the platform default. */
  night?: boolean;
}

/**
 * Public KUBICU surfaces use the platform's look, set by super admin — not whichever
 * workspace happens to be open on this device.
 */
export function PlatformLook({ children, night = false }: PlatformLookProps) {
  const { defaultDirection } = useAppearancePolicy();
  return (
    <div data-direction={night ? 'nightMarket' : defaultDirection} className="min-h-screen w-full bg-canvas text-fg">
      {children}
    </div>);

}