import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, CopyIcon, EyeIcon, LockIcon, PlayIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { FormDef, FormField, FormSubmission } from '../../types/forms';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useFormsStore } from '../../hooks/useFormsStore';
import { formIssues } from '../../utils/forms/logic';
import { uid } from '../../utils/id';
import { FormsGate } from '../../components/forms/FormsGate';
import { FormBuilder } from '../../components/forms/FormBuilder';
import { ResponsesInbox } from '../../components/forms/ResponsesInbox';
import { FormSettingsTab } from '../../components/forms/FormSettingsTab';
import { FormRunner } from '../../components/forms/FormRunner';
import { appSkin } from '../../components/forms/formSkin';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Sheet } from '../../components/ui/Sheet';
import { Dialog } from '../../components/ui/Dialog';
import { NotFoundInline } from '../../components/forms/NotFoundInline';
import { useT } from '../../contexts/LocaleContext';

type Tab = 'build' | 'responses' | 'settings';
const tabs: Tab[] = ['build', 'responses', 'settings'];

/** Build, answer and configure one form (D79). */
export function FormEditor() {
  return (
    <FormsGate>
      <FormEditorInner />
    </FormsGate>);

}

function FormEditorInner() {
  const { t: tr } = useT();
  const { formId } = useParams();
  const { current } = useWorkspace();
  const team = useTeam();
  const can = useCan('contacts.manage');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { data, update } = useFormsStore(current.id);
  const [previewing, setPreviewing] = useState(false);
  const [run, setRun] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const tab: Tab = tabs.includes(params.get('tab') as Tab) ? params.get('tab') as Tab : 'build';
  const form = data?.forms.find((f) => f.id === formId);

  if (!data) return null;
  if (!form) return <NotFoundInline />;

  const subs = data.submissions.filter((s) => s.formId === form.id);
  const unread = subs.filter((s) => s.status === 'new').length;
  const issues = formIssues(form);
  const disabled = !can.allowed;

  const save = (patch: Partial<FormDef>) => update((d) => ({ ...d, forms: d.forms.map((f) => f.id === form.id ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f) }));
  const setFields = (fields: FormField[]) => save({ fields });
  const updateSub = (id: string, patch: Partial<FormSubmission>) => update((d) => ({ ...d, submissions: d.submissions.map((s) => s.id === id ? { ...s, ...patch } : s) }));

  const setStatus = (status: FormDef['status']) => {
    if (status === 'live' && issues.length) {
      toast.error(tr('Fix the form first'), { description: tr(issues[0]) });
      return;
    }
    save({ status });
    team.log('audience', `${status === 'live' ? 'Set live' : status === 'closed' ? 'Closed' : 'Moved to draft'} the form “${form.name}”`, `/app/forms/${form.id}`);
    toast.success(tr(status === 'live' ? 'Form is live' : status === 'closed' ? 'Form closed' : 'Back to draft'), {
      description: tr(status === 'live' ? 'Add it to a page with the Form block in the canvas.' : 'Form blocks show a “not accepting responses” message.')
    });
  };

  const duplicate = () => {
    const now = new Date().toISOString();
    const copy: FormDef = { ...form, id: uid('form'), name: `${form.name} (copy)`, status: 'draft', sample: undefined, createdAt: now, updatedAt: now };
    update((d) => ({ ...d, forms: [copy, ...d.forms] }));
    toast.success(tr('Form duplicated'));
    navigate(`/app/forms/${copy.id}`);
  };

  const remove = () => {
    update((d) => ({ forms: d.forms.filter((f) => f.id !== form.id), submissions: d.submissions.filter((s) => s.formId !== form.id) }));
    team.log('audience', `Deleted the form “${form.name}”`);
    toast.success(tr('Form deleted'));
    navigate('/app/forms');
  };

  const statusBadge = form.status === 'live' ? <Badge tone="success">Live</Badge> : form.status === 'closed' ? <Badge tone="warning">Closed</Badge> : <Badge>Draft</Badge>;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 md:px-8">
      <div className="flex flex-col gap-4">
        <Link to="/app/forms" className="inline-flex w-fit items-center gap-1.5 text-label text-fg-muted hover:text-fg">
          <ArrowLeftIcon size={15} aria-hidden /> {tr('All forms')}
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-title font-semibold text-fg">{form.name || tr('Untitled form')}</h1>
              {statusBadge}
              {form.sample && <Badge>Sample</Badge>}
            </div>
            <p className="mt-1 text-caption text-fg-muted">
              {tr('{n} responses', { n: subs.length })} · {tr('{n} fields', { n: form.fields.filter((f) => f.type !== 'hidden').length })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" leadingIcon={EyeIcon} onClick={() => setPreviewing(true)}>
              Preview
            </Button>
            {form.status === 'live' ?
            <Button variant="secondary" leadingIcon={LockIcon} disabled={disabled} onClick={() => setStatus('closed')}>
                Close form
              </Button> :

            <Button leadingIcon={PlayIcon} disabled={disabled} onClick={() => setStatus('live')} title={issues[0]}>
                {form.status === 'closed' ? 'Reopen' : 'Set live'}
              </Button>
            }
          </div>
        </div>
      </div>

      <Tabs<Tab>
        items={[
        { id: 'build', label: 'Build' },
        { id: 'responses', label: 'Responses', badge: unread || undefined },
        { id: 'settings', label: 'Settings' }]
        }
        value={tab}
        onChange={(t) => {
          const next = new URLSearchParams(params);
          next.set('tab', t);
          if (t !== 'responses') next.delete('response');
          setParams(next, { replace: true });
        }}
        ariaLabel="Form sections"
        idPrefix="form-tab" />
      

      <div role="tabpanel" id={`form-tab-panel-${tab}`} aria-labelledby={`form-tab-tab-${tab}`}>
        {tab === 'build' && <FormBuilder form={form} onChange={setFields} disabled={disabled} />}
        {tab === 'responses' && <ResponsesInbox form={form} submissions={data.submissions} onUpdate={updateSub} disabled={disabled} />}
        {tab === 'settings' &&
        <>
            <FormSettingsTab form={form} onChange={save} disabled={disabled} />
            <section className="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-6">
              <Button variant="secondary" leadingIcon={CopyIcon} disabled={disabled} onClick={duplicate}>
                Duplicate form
              </Button>
              {form.status !== 'draft' &&
            <Button variant="tertiary" disabled={disabled} onClick={() => setStatus('draft')}>
                  Move back to draft
                </Button>
            }
              <Button variant="destructive" leadingIcon={Trash2Icon} disabled={disabled} onClick={() => setDeleting(true)} className="sm:ml-auto">
                Delete form
              </Button>
            </section>
          </>
        }
      </div>

      {disabled && <p className="text-caption text-fg-subtle">{can.reason}</p>}

      <Sheet
        open={previewing}
        onClose={() => setPreviewing(false)}
        title="Preview"
        description="Try steps, rules and validation. Nothing is saved."
        side="right"
        bodyClassName="bg-sunken"
        footer={
        <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-caption text-fg-subtle">
              <EyeIcon size={14} aria-hidden /> {tr(form.status === 'live' ? 'Live' : form.status === 'closed' ? 'Closed' : 'Draft')} · {tr('{n} questions', { n: form.fields.length })}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="tertiary" leadingIcon={RotateCcwIcon} onClick={() => setRun((n) => n + 1)}>
                Start over
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPreviewing(false)}>
                Close
              </Button>
            </div>
          </div>
        }>
        
        <div className="flex min-h-full flex-col gap-3 p-4 md:p-5">
          <div className="rounded-lg border border-line bg-overlay p-5 shadow-1 md:p-6">
            {form.fields.length === 0 ?
            <p className="py-6 text-center text-label text-fg-muted">{tr('Add a question in Build to preview the form.')}</p> :

            <FormRunner key={`${form.id}-${form.updatedAt}-${run}`} form={form} skin={appSkin} mode="preview" headingLevel="h3" />
            }
          </div>
          <p className="px-1 text-caption text-fg-subtle">{tr('On your page, the form uses the page’s own colours and fonts.')}</p>
        </div>
      </Sheet>

      <Dialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title={tr('Delete “{name}”?', { name: form.name })}
        description={tr('Its {n} responses are deleted too. Contacts already added to Audience stay. Form blocks using it will ask you to choose another form before you can publish.', { n: subs.length })}
        size="sm"
        footer={
        <>
            <Button variant="tertiary" onClick={() => setDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove}>
              Delete form
            </Button>
          </>
        } />
      
    </div>);

}