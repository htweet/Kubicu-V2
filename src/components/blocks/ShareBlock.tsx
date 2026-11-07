import React, { useState } from 'react';
import { CheckIcon, LinkIcon, MailIcon, MessageCircleIcon, Share2Icon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { buttonStyle, fontsFor } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

/**
 * Share this page (D169): the device's own share sheet when there is one, plus WhatsApp, X, Facebook, email and copy link.
 * Button wording follows the visitor's language (D503); service names stay as they are.
 */
export function ShareBlock({ block, theme, mode }: BlockProps<'share'>) {
  const { t: tr } = useT();
  const c = block.content;
  const [copied, setCopied] = useState(false);
  const live = mode === 'live';
  const url = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
  const msg = c.text.trim() || (typeof document !== 'undefined' ? document.title : '');
  const enc = encodeURIComponent;
  const canNative = live && typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const targets = [
    { key: 'wa', label: 'WhatsApp', icon: MessageCircleIcon, href: `https://wa.me/?text=${enc(`${msg} ${url}`)}` },
    { key: 'x', label: 'X', icon: null, href: `https://x.com/intent/post?text=${enc(msg)}&url=${enc(url)}` },
    { key: 'fb', label: 'Facebook', icon: null, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { key: 'email', label: tr('Email'), icon: MailIcon, href: `mailto:?subject=${enc(msg)}&body=${enc(url)}` },
  ];
  const copy = async () => {
    if (!live) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the link is still in the address bar */
    }
  };
  const chip = 'inline-flex h-11 items-center justify-center gap-1.5 px-4 text-[14px] font-semibold';
  return (
    <section className="text-center">
      {c.title && <h2 className="mb-3 text-[18px] font-medium" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.title}</h2>}
      <div className="flex flex-wrap justify-center gap-2">
        {canNative && (
          <button type="button" onClick={() => navigator.share({ title: msg, url }).catch(() => undefined)} className={chip} style={buttonStyle(theme, 'featured')}>
            <Share2Icon size={15} aria-hidden /> {tr('Share')}
          </button>
        )}
        {targets.map((t) => {
          const Icon = t.icon;
          const inner = (
            <>
              {Icon && <Icon size={15} aria-hidden />}
              {t.label}
            </>
          );
          return live ? (
            <a key={t.key} href={t.href} target="_blank" rel="noopener noreferrer" aria-label={tr('Share on {service}', { service: t.label })} className={chip} style={buttonStyle(theme, 'default')}>
              {inner}
            </a>
          ) : (
            <span key={t.key} className={chip} style={buttonStyle(theme, 'default')}>
              {inner}
            </span>
          );
        })}
        <button type="button" onClick={copy} className={chip} style={buttonStyle(theme, 'default')} aria-live="polite">
          {copied ? <CheckIcon size={15} aria-hidden /> : <LinkIcon size={15} aria-hidden />}
          {copied ? tr('Link copied') : tr('Copy link')}
        </button>
      </div>
    </section>
  );
}
