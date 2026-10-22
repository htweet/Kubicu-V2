import React, { useEffect } from 'react';
import { ExternalLinkIcon } from 'lucide-react';

/** Forwards a visitor to another website (custom redirects, D62), with a manual link in case it's blocked. */
export function ExternalRedirect({ url }: {url: string;}) {
  useEffect(() => {
    const t = window.setTimeout(() => window.location.replace(url), 400);
    return () => window.clearTimeout(t);
  }, [url]);
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {

    // Show the raw address.
  }return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F7F4EE] px-6">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <p className="text-[15px] font-semibold text-[#1F1B16]">Taking you to {host}…</p>
        <a href={url} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#1F1B16] underline underline-offset-2">
          Continue <ExternalLinkIcon size={14} aria-hidden />
        </a>
      </div>
    </main>);

}