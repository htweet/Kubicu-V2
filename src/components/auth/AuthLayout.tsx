import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConicalIcon } from 'lucide-react';
import { KubicuLogo } from '../shell/KubicuLogo';
import { PlatformLook } from '../marketing/PlatformLook';
import { TemplateThumb } from '../templates/TemplateThumb';
import { findExampleById } from '../../data/examples';

interface AuthLayoutProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const showcase = findExampleById('glow-by-halima')!;

/** Shared frame for sign-up, sign-in, reset and verification — Night market look (D77). */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <PlatformLook night>
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="flex flex-col px-5 py-6 md:px-10">
          <Link to="/" aria-label="KUBICU home" className="self-start rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            <KubicuLogo />
          </Link>
          <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
            <h1 className="font-display text-[32px] font-semibold leading-tight tracking-[-0.025em] text-fg">{title}</h1>
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
          <div className="nm-frame h-full rounded-[28px]">
            <div className="dot-stage flex h-full flex-col items-center justify-center gap-8 rounded-[27px] px-10">
              <p className="max-w-xs text-center font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg">
                One link. <span className="nm-text">Your whole business.</span>
              </p>
              <div className="nm-glow rounded-[24px]">
                <TemplateThumb doc={showcase.doc} width={240} height={480} />
              </div>
              <p className="text-caption text-fg-subtle">Example page · fictional business</p>
            </div>
          </div>
        </aside>
      </div>
    </PlatformLook>);

}