import React, { useState } from 'react';
import type { UiLang } from '../../../data/translations';
import { messageLangs, platformMessages } from '../../../data/platformMessages';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Segmented } from '../../ui/Segmented';

/** Messages KUBICU sends, previewed in each language (D135). Placeholders are highlighted, never filled with real data. */
export function MessageTemplatesCard() {
  const [lang, setLang] = useState<UiLang>('en');
  return (
    <Card id="templates" title="Platform messages" description="What KUBICU itself sends. Non-English wording is a draft until a native speaker approves it." body="flush">
      <div className="scroll-quiet overflow-x-auto px-5 pt-4 md:px-6">
        <Segmented<UiLang> ariaLabel="Preview language" size="sm" value={lang} onChange={setLang} options={messageLangs} />
      </div>
      <ul className="mt-3 divide-y divide-line border-t border-line" lang={lang === 'pcm' ? 'pcm' : lang}>
        {platformMessages.map((m) => (
          <li key={m.id} className="px-5 py-3.5 md:px-6">
            <p className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
              {m.name}
              <Badge tone="neutral">{m.channel}</Badge>
              {lang !== 'en' && <Badge tone="warning">Draft</Badge>}
            </p>
            <p className="mt-1.5 rounded-md bg-sunken px-3 py-2 text-label text-fg">
              {m.text[lang].split(/(\{\w+\})/).map((part, i) =>
                /^\{\w+\}$/.test(part) ? (
                  <span key={i} className="rounded-sm bg-action-soft px-1 font-mono text-caption text-action">
                    {part}
                  </span>
                ) : (
                  <React.Fragment key={i}>{part}</React.Fragment>
                ),
              )}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
