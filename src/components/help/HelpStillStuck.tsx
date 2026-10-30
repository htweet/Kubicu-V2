import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareIcon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';

/** The way out of the guide: a person replies. Translated in D332. */
export function HelpStillStuck() {
  const { t: tr } = useT();
  return (
    <div className="nm-frame mt-16 rounded-2xl">
      <div className="flex flex-col gap-4 rounded-[15px] bg-raised p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MessageSquareIcon size={20} className="mt-0.5 shrink-0 text-[rgb(var(--nm-3))]" aria-hidden />
          <div>
            <h2 className="text-heading font-semibold text-fg">{tr('Still stuck?')}</h2>
            <p className="mt-1 text-label text-fg-muted">{tr('Signed in? Use Help → Contact support in your workspace for the fastest reply.')}</p>
          </div>
        </div>
        <Link to="/about/contact" className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-line-strong px-4 text-label font-medium text-fg hover:bg-sunken">
          {tr('Contact us')}
        </Link>
      </div>
    </div>);

}