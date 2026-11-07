import React, { useState } from 'react';
import { FeatherIcon, FlagIcon } from 'lucide-react';
import { useDataSaver } from '../../contexts/DataSaverContext';
import { useT } from '../../contexts/LocaleContext';
import { VisitorLanguageMenu } from './VisitorLanguageMenu';
import type { PageTheme } from '../../types/page';
import { MadeWithKubicu } from './MadeWithKubicu';
import { ReportPageDialog } from './ReportPageDialog';

/** Bottom of every live page: the KUBICU badge (plan permitting), “Report this page” (D75b) and the visitor's language (D133). */
export function PublicFooter({ theme, badge, handle, workspaceId }: { theme: PageTheme; badge: boolean; handle: string; workspaceId: string | null }) {
  const [open, setOpen] = useState(false);
  const dataSaver = useDataSaver();
  const { t, lang, setLang } = useT();
  return (
    <div className="flex flex-col items-center gap-3 pb-10">
      {badge && (
        <div className="-mb-10">
          <MadeWithKubicu theme={theme} mode="live" />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px]" style={{ color: theme.mutedText }}>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded px-1 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2">
          <FlagIcon size={12} aria-hidden />
          {t('Report this page')}
        </button>
        <span aria-hidden>·</span>
        <a href="/about/safety" className="rounded px-1 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2">
          {t('Buyer safety')}
        </a>
        <span aria-hidden>·</span>
        <button
          type="button"
          onClick={() => dataSaver.setOn(!dataSaver.on)}
          aria-pressed={dataSaver.on}
          className="inline-flex items-center gap-1.5 rounded px-1 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2"
        >
          <FeatherIcon size={12} aria-hidden />
          {t(dataSaver.on ? 'Data saver: on' : 'Data saver: off')}
        </button>
        <span aria-hidden>·</span>
        <a href="/about/privacy" className="rounded px-1 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2">
          {t('Privacy')}
        </a>
        {setLang && (
          <>
            <span aria-hidden>·</span>
            <VisitorLanguageMenu theme={theme} variant="inline" side="top" />
          </>
        )}
      </div>
      {lang !== 'en' && (
        <p className="px-4 text-center text-[11px]" style={{ color: theme.mutedText }}>
          {t('Draft translation')} · {t('the seller’s own words stay as they wrote them.')}
        </p>
      )}
      <ReportPageDialog open={open} onClose={() => setOpen(false)} handle={handle} workspaceId={workspaceId} />
    </div>
  );
}
