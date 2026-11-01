import React from 'react';
import { ArrowRightIcon, UsersRoundIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { accentOf, buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

const platformLabels = { whatsapp: 'WhatsApp group', telegram: 'Telegram', discord: 'Discord', facebook: 'Facebook group', slack: 'Slack', other: 'Community' } as const;

/**
 * Community join (D170): what the group is, the house rules in your words, and one join button. No member counts are invented.
 * Fixed wording follows the visitor's language (D508).
 */
export function CommunityBlock({ block, theme, mode }: BlockProps<'community'>) {
  const { t: tr } = useT();
  const c = block.content;
  if (!c.url.trim()) return mode === 'edit' ? <BlockPlaceholder icon={UsersRoundIcon} title="Add your invite link" hint="WhatsApp group, Telegram, Discord or any community" theme={theme} /> : null;
  return (
    <section className="p-6 md:p-8" style={cardStyle(theme)}>
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: mix(accentOf(theme), 14, theme.surface), color: theme.text }}>
        <UsersRoundIcon size={13} aria-hidden /> {tr(platformLabels[c.platform])}
      </span>
      <h2 className="mt-4 text-[22px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.name || tr('Join our community')}</h2>
      {c.description && <p className="mt-2 text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>{c.description}</p>}
      {c.rules &&
      <details className="mt-4">
          <summary className="min-h-[40px] cursor-pointer py-2 text-[14px] font-semibold" style={{ color: theme.text }}>{tr('House rules')}</summary>
          <p className="whitespace-pre-line pb-2 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>{c.rules}</p>
        </details>
      }
      <PageAction mode={mode} href={c.url} className="mt-5 inline-flex h-12 items-center gap-2 px-6 text-[15px] font-semibold" style={buttonStyle(theme, 'featured')}>
        {c.ctaLabel || tr('Join')} <ArrowRightIcon size={16} aria-hidden />
      </PageAction>
    </section>);

}