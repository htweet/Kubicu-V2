import React, { useEffect, useMemo } from 'react';
import { ClipboardPenIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { cardStyle } from './pageStyle';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useFormsStore } from '../../hooks/useFormsStore';
import { FormRunner } from '../forms/FormRunner';
import { skinFromTheme } from '../forms/formSkin';
import { closedReason } from '../../utils/forms/logic';
import { formsAddOnActive } from '../../utils/forms/storage';

/** Renders a saved form from the Forms add-on (D79). */
export function FormBlock({ block, theme, mode }: BlockProps<'form'>) {
  const pageOps = usePageOpsContext();
  const { current } = useWorkspace();
  const workspaceId = pageOps.workspaceId ?? current.id;
  const { data } = useFormsStore(workspaceId);
  const form = data?.forms.find((f) => f.id === block.content.formId);
  const skin = useMemo(() => skinFromTheme(theme), [theme]);
  const live = mode === 'live' && !!pageOps.actions?.submitForm;
  const count = form ? data?.submissions.filter((s) => s.formId === form.id).length ?? 0 : 0;

  useEffect(() => {
    if (live && form) pageOps.actions?.trackForm?.(form.id, 'view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, form?.id]);

  if (!form) {
    return (
      <section className="flex flex-col items-center gap-2 p-6 text-center" style={cardStyle(theme)}>
        <ClipboardPenIcon size={22} style={{ color: theme.mutedText }} aria-hidden />
        <p className="text-[14px]" style={{ color: theme.mutedText }}>
          {mode === 'edit' ? 'Choose a form in the inspector.' : 'This form isn’t available.'}
        </p>
      </section>);

  }

  const addOnOff = mode === 'live' && pageOps.workspaceId ? !formsAddOnActive(pageOps.workspaceId) : false;
  const closed = addOnOff ? 'This form isn’t accepting responses.' : closedReason(form, count);

  return (
    <section className="p-5" style={cardStyle(theme)}>
      <FormRunner
        form={form}
        skin={skin}
        mode={mode === 'edit' ? 'inert' : live ? 'live' : 'preview'}
        closed={mode === 'edit' ? null : closed}
        showTitle={block.content.showTitle}
        onStart={() => live && pageOps.actions?.trackForm?.(form.id, 'start')}
        onSubmit={({ answers, paymentNgn }) => live ? pageOps.actions!.submitForm!(form, answers, paymentNgn) : true} />
      
    </section>);

}