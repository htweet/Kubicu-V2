import React from 'react';
import { AwardIcon, DownloadIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { PageAction } from './PageAction';
import { buttonStyle, fontsFor, mix } from './pageStyle';

/**
 * Credentials & experience (D169). Credentials: a ruled list of qualifications with issuer and year.
 * Résumé: a short summary, roles with years in a side column, and an optional CV download.
 */
export function CredentialsBlock({ block, theme, mode }: BlockProps<'credentials'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.title.trim());
  if (items.length === 0 && !c.summary.trim()) return mode === 'edit' ? <BlockPlaceholder icon={AwardIcon} title="Add qualifications or roles" hint="Only what you can show if asked" theme={theme} /> : null;
  const display = fontsFor(theme).display;
  const resume = c.variant === 'resume';
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} intro={resume ? c.summary : undefined} />
      <ul className="flex flex-col">
        {items.map((i) =>
        <li key={i.id} className={resume ? 'grid gap-1 py-5 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-8' : 'flex items-start justify-between gap-4 py-4'} style={{ borderTop: `1px solid ${mix(theme.text, 10)}` }}>
            {resume && <span className="text-[13px] font-semibold tabular-nums md:pt-1" style={{ color: theme.mutedText }}>{i.year}</span>}
            <div className="min-w-0">
              <h3 className="text-[17px] font-medium leading-snug" style={{ fontFamily: display, color: theme.text }}>{i.title}</h3>
              {i.org && <p className="mt-0.5 text-[14px]" style={{ color: theme.mutedText }}>{i.org}</p>}
              {i.text && <p className="mt-2 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>{i.text}</p>}
            </div>
            {!resume && i.year && <span className="shrink-0 pt-0.5 text-[13px] font-semibold tabular-nums" style={{ color: theme.mutedText }}>{i.year}</span>}
          </li>
        )}
      </ul>
      {resume && c.cvUrl &&
      <PageAction mode={mode} href={c.cvUrl} className="mt-6 inline-flex h-11 items-center gap-2 px-5 text-[14px] font-semibold" style={buttonStyle(theme, 'default')}>
          <DownloadIcon size={15} aria-hidden /> Download CV
        </PageAction>
      }
    </section>);

}