import React, { useMemo } from 'react';
import type { CopilotKind, CopilotReply } from '../../types/copilot';
import { TemplateThumb } from '../templates/TemplateThumb';
import { useT } from '../../contexts/LocaleContext';
import { findExampleById } from '../../data/examples';
import { themeForFeel } from '../../utils/assistant/layout';
import { cn } from '../../utils/cn';

const sampleByKind: Record<CopilotKind, string> = {
  business: 'mama-put-kitchen',
  portfolio: 'studio-nnamdi',
  creator: 'tolu-makes',
  shop: 'adaeze-atelier',
  service: 'glow-by-halima',
  event: 'afrobeats-brunch',
  other: 'tolu-makes',
};

interface Props {
  replies: CopilotReply[];
  kind?: CopilotKind;
  exampleId?: string;
  active: boolean;
  onPick: (r: CopilotReply) => void;
}

/** Real Signature themes on a sample page like theirs, so the choice is about how it looks, not a swatch (D262). */
export function CopilotLookOptions({ replies, kind, exampleId, active, onPick }: Props) {
  const { t: tr } = useT();
  const sample = findExampleById(exampleId ?? sampleByKind[kind ?? 'other']) ?? findExampleById('tolu-makes')!;
  const looks = useMemo(
    () =>
      replies
        .filter((r) => r.feel)
        .map((r) => {
          const { theme, name } = themeForFeel(r.feel!, true);
          return { r, name, doc: { ...sample.doc, theme } };
        }),
    [replies, sample],
  );
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
      {looks.map(({ r, name, doc }) => (
        <button
          key={r.value}
          type="button"
          disabled={!active}
          onClick={() => onPick(r)}
          className={cn(
            'group flex flex-col items-start gap-2 rounded-2xl border border-line bg-raised p-2 text-left transition-[border-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            active ? 'hover:border-line-strong active:scale-[0.98]' : 'opacity-60',
          )}
        >
          <span className="block w-full overflow-hidden rounded-xl">
            <TemplateThumb doc={doc} width={156} height={150} />
          </span>
          <span className="px-1 pb-1">
            <span className="block text-label font-semibold text-fg">{tr(r.label)}</span>
            <span className="block text-caption text-fg-subtle">{name}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
