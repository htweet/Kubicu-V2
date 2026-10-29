import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConicalIcon } from 'lucide-react';
import { KubicuLogo } from '../shell/KubicuLogo';
import { PlatformLook } from '../marketing/PlatformLook';
import { TemplateThumb } from '../templates/TemplateThumb';
import { KbShape } from '../marketing/home/KbShape';
import { findExampleById } from '../../data/examples';

interface AuthLayoutProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Replaces the example page on the lime panel (Copilot shows the person's own draft). */
  aside?: React.ReactNode;
  /** Optional back control shown beside the logo (Copilot claim flow). */
  back?: React.ReactNode;
}

const showcase = findExampleById('glow-by-halima')!;

/** Shared frame for sign-up, sign-in, reset and verification — Night market look (D77). */
export function AuthLayout({ title, description, children, footer, aside, back }: AuthLayoutProps) {
  return (
    <PlatformLook night>
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="flex flex-col px-5 py-6 md:px-10">
          <div className="flex items-center gap-2 self-start">
            {back &&
            <>
                <span className="-ml-2.5">{back}</span>
                <span className="h-5 w-px bg-line" aria-hidden />
              </>
            }
            <Link to="/" aria-label="KUBICU home" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <KubicuLogo />
            </Link>
          </div>
          <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
            <h1 className="kb-display text-[38px] leading-[1] text-fg">{title}</h1>
            {description && <div className="mt-2 text-label text-fg-muted">{description}</div>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-label text-fg-muted">{footer}</div>}
          </main>
          <p className="mx-auto flex max-w-sm items-start gap-2 text-caption text-fg-subtle">
            <FlaskConicalIcon size={13} className="mt-0.5 shrink-0" aria-hidden />
            Prototype: no account is created and nothing you type here leaves this browser.
          </p>
        </div>
        <aside aria-hidden className="hidden p-4 lg:block">
          <div className="relative flex h-full flex-col items-center justify-center gap-8 overflow-hidden rounded-[36px] bg-[rgb(var(--kb-lime))] px-10 text-[rgb(var(--kb-forest))]">
            <KbShape kind="kube" color="rgb(var(--kb-pink))" size={96} motion="spin" className="absolute -right-4 top-10" />
            <KbShape kind="circle" color="rgb(var(--kb-cobalt))" size={80} motion="bob" className="absolute -left-6 bottom-24" />
            {aside ??
            <>
                <p className="kb-display relative max-w-sm text-center text-[40px] leading-[0.98]">One link. Your whole business.</p>
                <div className="relative overflow-hidden rounded-[26px] border-[5px] border-[rgb(var(--kb-forest))] bg-[rgb(var(--kb-forest))] shadow-3">
                  <TemplateThumb doc={showcase.doc} width={240} height={480} />
                </div>
                <p className="relative text-caption font-semibold">Example page · fictional business</p>
              </>
            }
          </div>
        </aside>
      </div>
    </PlatformLook>);

}