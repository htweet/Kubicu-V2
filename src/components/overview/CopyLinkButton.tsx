import React, { useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { publicUrl } from '../../utils/format';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

/** The page address as a chip; clicking copies it. */
export function CopyLinkButton({ handle, className }: { handle: string; className?: string }) {
  const { t: tr } = useT();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `https://${publicUrl(handle)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast(tr('Couldn’t copy automatically'), { description: url });
    }
  };
  const Icon = copied ? CheckIcon : CopyIcon;
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={tr('Copy link {url}', { url: publicUrl(handle) })}
      className={cn(
        'group inline-flex h-9 max-w-full items-center gap-2 rounded-full border border-line bg-canvas pl-3.5 pr-3 font-mono text-label text-fg transition-colors duration-150 hover:border-line-strong',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        className,
      )}
    >
      <span className="truncate">{publicUrl(handle)}</span>
      <Icon size={14} className={cn('shrink-0', copied ? 'text-success' : 'text-fg-subtle group-hover:text-fg')} aria-hidden />
      <span className="sr-only" aria-live="polite">
        {copied ? tr('Copied') : ''}
      </span>
    </button>
  );
}
