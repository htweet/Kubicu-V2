import React, { useState } from 'react';
import { CheckIcon, SparklesIcon, WandSparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAiUsage } from '../../hooks/useAiUsage';
import { aiCost } from '../../data/aiLimits';
import { categoryLabels, draftKitCopy, kitTones, type KitAiDraft, type KitTone } from '../../utils/domains/printKitAi';
import { kitFonts, kitPapers, kitStyles, type KitDetails, type KitItemSpec } from '../../utils/domains/printKit';
import { AiPreviewTag } from '../ai/AiPreviewTag';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { TextInput } from '../ui/TextInput';
import { UpgradeButton } from '../ui/UpgradeButton';

interface KitAiPanelProps {
  details: KitDetails;
  spec: KitItemSpec;
  disabled?: boolean;
  onApply: (patch: Partial<KitDetails>, what: string) => void;
}

/** Writes print copy and suggests a design from the business type and tone (D118). Rule-based preview. */
export function KitAiPanel({ details, spec, disabled, onApply }: KitAiPanelProps) {
  const ai = useAiUsage();
  const [about, setAbout] = useState(details.line);
  const [tone, setTone] = useState<KitTone>('warm');
  const [draft, setDraft] = useState<KitAiDraft | null>(null);
  const [used, setUsed] = useState<Set<string>>(new Set());

  const run = () => {
    if (!ai.canSpend(aiCost.block)) return;
    setDraft(draftKitCopy(details.name, about, tone, !!details.photo));
    setUsed(new Set());
    ai.spend(aiCost.block);
  };

  const apply = (key: string, patch: Partial<KitDetails>, what: string) => {
    onApply(patch, what);
    setUsed((u) => new Set(u).add(key));
  };

  const wants = (f: string) => (spec.fields as string[]).includes(f);

  return (
    <section aria-labelledby="kit-ai" className="ai-frame rounded-lg">
      <div className="ai-soft flex flex-col gap-4 rounded-[7px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="kit-ai" className="flex items-center gap-2 text-label font-semibold text-fg">
              <WandSparklesIcon size={16} aria-hidden /> Write and design with AI
            </h2>
            <p className="mt-0.5 text-caption text-fg-muted">Short print copy and a matching design. It never makes up prices, offers or promises.</p>
          </div>
          <AiPreviewTag />
        </div>

        <TextInput id="kit-ai-about" label="What do you sell or do?" placeholder="e.g. Bridal makeup and gele in Lekki" value={about} maxLength={80} disabled={disabled} onChange={(e) => setAbout(e.target.value)} />
        <div>
          <p className="mb-2 text-label font-medium text-fg">Tone</p>
          <Segmented<KitTone> ariaLabel="Tone" size="sm" value={tone} onChange={setTone} options={kitTones.map((t) => ({ value: t.id, label: t.label }))} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-caption text-fg-subtle">
            Uses {aiCost.block} AI credit · {ai.remaining} left this month
          </span>
          {ai.canSpend(aiCost.block) ?
          <Button size="sm" variant="ai" leadingIcon={SparklesIcon} disabled={disabled || !details.name.trim()} onClick={run}>
              {draft ? 'Try again' : 'Write it for me'}
            </Button> :

          <UpgradeButton plan="pro" feature="More AI credits" />
          }
        </div>

        {draft &&
        <div className="flex flex-col gap-4 border-t border-line pt-4">
            <p className="text-caption text-fg-muted">
              Reads as <span className="font-semibold text-fg">{categoryLabels[draft.category]}</span>. Edit anything after you use it.
            </p>

            {(wants('line') || spec.id === 'card' || spec.id === 'sticker') &&
          <Group title="Tagline">
                {draft.taglines.map((t) =>
            <Option key={t} text={t} done={used.has(`line:${t}`)} disabled={disabled} onUse={() => apply(`line:${t}`, { line: t }, 'Tagline')} />
            )}
              </Group>
          }
            {wants('message') &&
          <Group title="Message">
                <Option text={draft.message} done={used.has('message')} disabled={disabled} onUse={() => apply('message', { message: draft.message }, 'Message')} />
              </Group>
          }
            {wants('headline') &&
          <Group title="Headline">
                {(() => {
              const h = spec.id === 'counter' ? draft.counterHeadline : spec.id === 'voucher' ? draft.voucherHeadline : draft.headline;
              return <Option text={h} done={used.has('headline')} disabled={disabled} onUse={() => apply('headline', { headline: h }, 'Headline')} />;
            })()}
              </Group>
          }

            <Group title="Suggested design">
              <div className="flex flex-col gap-2 rounded-md border border-line bg-raised p-3">
                <p className="text-label font-semibold text-fg">
                  {kitStyles.find((s) => s.id === draft.design.style)?.label} · {kitFonts.find((f) => f.id === draft.design.font)?.label} type · {kitPapers.find((p) => p.id === draft.design.paper)?.label} paper
                </p>
                <p className="text-caption text-fg-muted">{draft.design.why}</p>
                <Button size="sm" variant="secondary" leadingIcon={used.has('design') ? CheckIcon : undefined} className="self-start" disabled={disabled} onClick={() => apply('design', { style: draft.design.style, font: draft.design.font, paper: draft.design.paper }, 'Design')}>
                  {used.has('design') ? 'Applied' : 'Apply design'}
                </Button>
              </div>
            </Group>
          </div>
        }
      </div>
    </section>);

}

function Group({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption font-semibold text-fg-subtle">{title}</p>
      {children}
    </div>);

}

function Option({ text, done, disabled, onUse }: {text: string;done: boolean;disabled?: boolean;onUse: () => void;}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-line bg-raised px-3 py-2.5">
      <p className="min-w-0 flex-1 text-label text-fg">{text}</p>
      <Button
        size="sm"
        variant="tertiary"
        leadingIcon={done ? CheckIcon : undefined}
        disabled={disabled}
        onClick={() => {
          onUse();
          if (!done) toast.success('Added to your design');
        }}
        className="shrink-0">
        
        {done ? 'Used' : 'Use'}
      </Button>
    </div>);

}