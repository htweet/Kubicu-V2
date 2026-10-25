import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, WandSparklesIcon } from 'lucide-react';
import type { SourceId } from '../../types/analytics';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { useCampaignPreview } from '../../contexts/CampaignPreviewContext';
import { useRenderPlan } from '../../contexts/RenderPlanContext';
import { planAtLeast } from '../../data/plans';
import { intentSources } from '../../utils/intentflow';
import { sourceLabels, visitSource } from '../../utils/analytics/track';
import { buttonStyle } from './pageStyle';

/**
 * Smart button (D170): rule-based, not AI. The visit's source (the same one IntentFlow and Analytics use)
 * picks the words and link; anyone else — and the Free plan — sees the default. The canvas follows "Preview as".
 */
export function SmartButtonBlock({ block, theme, mode }: BlockProps<'smartButton'>) {
  const c = block.content;
  const [params] = useSearchParams();
  const preview = useCampaignPreview();
  const plan = useRenderPlan();
  const asParam = params.get('as') as SourceId | null;
  const source: SourceId | null = mode === 'edit' ? preview.source : asParam && intentSources.includes(asParam) ? asParam : visitSource(params).source;
  const rule = planAtLeast(plan.id, 'creator') && source ? c.rules.find((r) => r.source === source && r.label.trim() && r.url.trim()) : undefined;
  const label = rule?.label || c.label;
  const url = rule?.url || c.url;
  if (!label.trim() || !url.trim()) return mode === 'edit' ? <BlockPlaceholder icon={WandSparklesIcon} title="Set the default words and link" hint="Then add versions for TikTok, WhatsApp, QR visitors…" theme={theme} /> : null;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <PageAction mode={mode} href={url} className="flex h-14 w-full items-center justify-center gap-2 px-6 text-[16px] font-semibold" style={buttonStyle(theme, 'featured')}>
        {label} <ArrowRightIcon size={16} aria-hidden />
      </PageAction>
      {mode === 'edit' &&
      <p className="text-[11.5px]" style={{ color: theme.mutedText }}>
          {c.rules.length === 0 ? 'Everyone sees this. Add versions by source in the inspector.' : rule ? `Showing the ${sourceLabels[rule.source]} version` : `Default · ${c.rules.length} version${c.rules.length === 1 ? '' : 's'} by source — use “Preview as” to check`}
        </p>
      }
    </div>);

}