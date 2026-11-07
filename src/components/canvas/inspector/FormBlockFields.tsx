import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, PuzzleIcon } from 'lucide-react';
import type { BlockOf } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { useT } from '../../../contexts/LocaleContext';
import { useFormsStore } from '../../../hooks/useFormsStore';
import { FORMS_EXTENSION_ID } from '../../../utils/forms/storage';
import { SelectInput } from '../../ui/SelectInput';
import { Switch } from '../../ui/Switch';
import { InlineAlert } from '../../ui/InlineAlert';

const statusLabel = { draft: 'Draft', live: 'Live', closed: 'Closed' } as const;

/** Inspector for the Form block: pick a saved form (D79). Translated in D299. */
export function FormBlockFields({ block, issues }: { block: BlockOf<'form'>; issues: ValidationIssue[] }) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const { current } = useWorkspace();
  const market = useMarketplace();
  const { data } = useFormsStore(current.id);
  const active = market.isActive(FORMS_EXTENSION_ID);
  const c = block.content;
  const rawErr = issues.find((i) => i.field === 'formId' && i.severity === 'error')?.message;
  const err = rawErr ? tr(rawErr) : undefined;
  const forms = data?.forms ?? [];
  const chosen = forms.find((f) => f.id === c.formId);

  return (
    <div className="flex flex-col gap-4">
      {!active && (
        <InlineAlert
          tone="info"
          title={tr('Forms is a premium add-on')}
          action={
            <Link to={`/app/extensions?ext=${FORMS_EXTENSION_ID}`} className="inline-flex items-center gap-1 text-label font-semibold text-fg hover:underline">
              <PuzzleIcon size={14} aria-hidden /> {tr('Get Forms')}
            </Link>
          }
        >
          {tr('Build the block now; it publishes once Forms is installed.')}
        </InlineAlert>
      )}
      <SelectInput
        id={`${block.id}-formId`}
        label={tr('Form')}
        value={c.formId ?? ''}
        error={err}
        options={[{ value: '', label: forms.length ? tr('Choose a form…') : tr('No forms yet') }, ...forms.map((f) => ({ value: f.id, label: `${f.name} · ${tr(statusLabel[f.status])}` }))]}
        onChange={(v) => actions.updateContent(block.id, 'form', { formId: v || null }, 'formId')}
      />
      <Switch id={`${block.id}-showTitle`} label={tr('Show the form’s name as a heading')} checked={c.showTitle} onChange={(v) => actions.updateContent(block.id, 'form', { showTitle: v }, 'showTitle')} />
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-label">
        {chosen && (
          <Link to={`/app/forms/${chosen.id}`} className="inline-flex items-center gap-1 font-semibold text-fg hover:underline">
            {tr('Edit this form')} <ArrowUpRightIcon size={14} aria-hidden />
          </Link>
        )}
        <Link to="/app/forms" className="inline-flex items-center gap-1 text-fg-muted hover:text-fg hover:underline">
          {tr('All forms')} <ArrowUpRightIcon size={14} aria-hidden />
        </Link>
      </div>
      <p className="text-caption text-fg-subtle">{tr('Fields, steps and rules are edited in Forms; changes show here straight away. Submissions go to the form’s inbox and to Audience.')}</p>
    </div>
  );
}
