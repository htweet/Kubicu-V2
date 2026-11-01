import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';
import { KubicuLogo } from './KubicuLogo';

/** Shown instead of the workspace when KUBICU staff have locked the signed-in account (D472). */
export function AccountLocked() {
  const { t: tr } = useT();
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-canvas px-5 py-12 text-fg">
      <div className="w-full max-w-md">
        <KubicuLogo withWordmark />
        <span className="mt-10 flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger">
          <LockIcon size={20} aria-hidden />
        </span>
        <h1 className="mt-4 text-title font-semibold">{tr('Your account is locked')}</h1>
        <p className="mt-2 text-body text-fg-muted">{tr('KUBICU has locked this account while we look into something. Your pages stay live and nothing is deleted. Contact support to get back in.')}</p>
        <Link to="/contact" className="mt-6 inline-flex h-10 items-center rounded-md bg-action px-4 text-label font-semibold text-action-fg transition-colors duration-150 hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {tr('Contact support')}
        </Link>
      </div>
    </main>);

}