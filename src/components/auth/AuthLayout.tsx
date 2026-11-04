import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConicalIcon } from 'lucide-react';
import { KubicuLogo } from '../shell/KubicuLogo';
import { PlatformLook } from '../marketing/PlatformLook';
import { useT } from '../../contexts/LocaleContext';
import { LanguagePicker } from '../ui/LanguagePicker';
import { AuthShowcase, type ShowcaseKind } from './AuthShowcase';
import { realAuthEnabled } from '../../utils/auth/realAuth';

interface AuthLayoutProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Replaces the example page on the lime panel (Copilot shows the person's own draft). */
  aside?: React.ReactNode;
  /** Optional back control shown beside the logo (Copilot claim flow). */
  back?: React.ReactNode;
  /** Which example story the lime panel tells. */
  showcase?: ShowcaseKind;
  /** Content above the title inside the card, e.g. a short progress line. */
  eyebrow?: React.ReactNode;
}

/**
 * Shared frame for sign-up, sign-in, reset and verification (D77, D275): a calm form card on the cream
 * canvas, the language picker within reach before signing in, and a lime panel with a real example page.
 */
export function AuthLayout({ title, description, children, footer, aside, back, showcase = 'signup', eyebrow }: AuthLayoutProps) {
  const { t } = useT();
  return (
    <PlatformLook night>
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="flex min-w-0 flex-col px-5 py-5 md:px-10 md:py-6">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {back &&
              <>
                  <span className="-ml-2.5">{back}</span>
                  <span className="h-5 w-px bg-line" aria-hidden />
                </>
              }
              <Link to="/" aria-label={t('KUBICU home')} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <KubicuLogo />
              </Link>
            </div>
            <LanguagePicker variant="pill" />
          </header>

          <main className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-10 md:py-14">
            <div className="mb-6 rounded-[24px] bg-[rgb(var(--kb-lime))] px-5 py-4 text-[rgb(var(--kb-forest))] lg:hidden" aria-hidden>
              <p className="kb-display text-[24px] leading-none">{t('One link. Your whole business.')}</p>
            </div>
            <div className="rounded-[28px] border border-line bg-raised p-6 shadow-[0_30px_60px_-40px_rgb(0_0_0/0.35)] sm:p-9">
              {eyebrow && <div className="mb-5">{eyebrow}</div>}
              <h1 className="kb-display text-[36px] leading-[1] text-fg sm:text-[42px]">{title}</h1>
              {description && <div className="mt-3 text-body leading-relaxed text-fg-muted">{description}</div>}
              <div className="mt-8">{children}</div>
            </div>
            {footer && <div className="mt-6 text-center text-label text-fg-muted">{footer}</div>}
          </main>

          {/* With real sign-in on, accounts are real, so the prototype note would be untrue (D-UI-1). */}
          {!realAuthEnabled() &&
          <p className="mx-auto flex max-w-[460px] items-start gap-2 text-caption text-fg-subtle">
            <FlaskConicalIcon size={13} className="mt-0.5 shrink-0" aria-hidden />
            {t('Prototype: no account is created and nothing you type here leaves this browser.')}
          </p>
          }
        </div>
        <aside aria-hidden className="hidden p-4 lg:block">
          {aside ?
          <div className="relative flex h-full flex-col items-center justify-center gap-8 overflow-hidden rounded-[36px] bg-[rgb(var(--kb-lime))] px-10 text-[rgb(var(--kb-forest))]">{aside}</div> :

          <AuthShowcase kind={showcase} />
          }
        </aside>
      </div>
    </PlatformLook>);

}