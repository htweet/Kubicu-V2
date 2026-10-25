import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardListIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useFormsStore } from '../../hooks/useFormsStore';
import { formTemplates } from '../../data/formTemplates';
import { createForm } from '../../utils/forms/storage';
import { closedReason } from '../../utils/forms/logic';
import type { FormDef } from '../../types/forms';
import { PageHeader } from '../../components/shell/PageHeader';
import { FormsGate } from '../../components/forms/FormsGate';
import { Button } from '../../components/ui/Button';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { TextInput } from '../../components/ui/TextInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../utils/cn';

const status: Record<FormDef['status'], {label: string;tone: BadgeTone;}> = {
  draft: { label: 'Draft', tone: 'neutral' },
  live: { label: 'Live', tone: 'success' },
  closed: { label: 'Closed', tone: 'warning' }
};

/** Every form in the workspace with its response counts (D79). */
export function FormsList() {
  return (
    <FormsGate>
      <FormsListInner />
    </FormsGate>);

}

function FormsListInner() {
  const { current } = useWorkspace();
  const team = useTeam();
  const canEdit = useCan('contacts.manage');
  const navigate = useNavigate();
  const { data, update } = useFormsStore(current.id);
  const [creating, setCreating] = useState(false);
  const [templateId, setTemplateId] = useState('blank');
  const [name, setName] = useState('');

  const counts = useMemo(() => {
    const m = new Map<string, {total: number;unread: number;last: string | null;}>();
    data?.submissions.forEach((s) => {
      const c = m.get(s.formId) ?? { total: 0, unread: 0, last: null };
      c.total += 1;
      if (s.status === 'new') c.unread += 1;
      if (!c.last || s.createdAt > c.last) c.last = s.createdAt;
      m.set(s.formId, c);
    });
    return m;
  }, [data]);

  const create = () => {
    const tpl = formTemplates.find((t) => t.id === templateId)!;
    const form = createForm(templateId, name.trim() || tpl.name);
    update((d) => ({ ...d, forms: [form, ...d.forms] }));
    team.log('audience', `Created the form “${form.name}”`, `/app/forms/${form.id}`);
    toast.success('Form created', { description: 'It’s a draft — set it live when it’s ready.' });
    setCreating(false);
    navigate(`/app/forms/${form.id}`);
  };

  const forms = data?.forms ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        title="Forms"
        description="Build a form, add it to any page with the Form block, and answer responses here."
        actions={
        <Button leadingIcon={PlusIcon} disabled={!canEdit.allowed} title={canEdit.allowed ? undefined : canEdit.reason} onClick={() => setCreating(true)}>
            New form
          </Button>
        } />
      

      {forms.length === 0 ?
      <EmptyState framed icon={ClipboardListIcon} title="No forms yet" description="Start from a quote request, RSVP, survey, order intake, onboarding or job application — or a blank form." action={<Button onClick={() => setCreating(true)}>New form</Button>} /> :

      <ul className="divide-y divide-line border-y border-line">
          {forms.map((f) => {
          const c = counts.get(f.id) ?? { total: 0, unread: 0, last: null };
          const closed = f.status === 'live' ? closedReason(f, c.total) : null;
          return (
            <li key={f.id}>
                <Link to={`/app/forms/${f.id}`} className="grid gap-2 py-4 transition-colors duration-150 hover:bg-sunken/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:grid-cols-[minmax(0,1fr)_7rem_7rem] sm:items-center sm:gap-6 sm:px-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-label font-semibold text-fg">{f.name}</span>
                      <Badge tone={closed ? 'warning' : status[f.status].tone}>{closed ? 'Closed automatically' : status[f.status].label}</Badge>
                      {f.sample && <Badge>Sample</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-caption text-fg-subtle">
                      {f.fields.filter((x) => x.type !== 'hidden').length} fields · edited {new Date(f.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-caption text-fg-muted sm:text-right">
                    <span className="text-label font-semibold tabular-nums text-fg">{c.total}</span> responses
                  </div>
                  <div className="sm:text-right">{c.unread > 0 ? <Badge tone="action">{c.unread} new</Badge> : <span className="text-caption text-fg-subtle">All read</span>}</div>
                </Link>
              </li>);

        })}
        </ul>
      }

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New form"
        description="Pick a starting point. Everything can be changed afterwards."
        size="lg"
        footer={
        <>
            <Button variant="tertiary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={create}>Create form</Button>
          </>
        }>
        
        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-2 text-label font-medium text-fg">Start from</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {formTemplates.map((t) =>
              <label key={t.id} className={cn('flex cursor-pointer flex-col gap-0.5 rounded-md border p-3 transition-colors duration-150', templateId === t.id ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
                  <span className="flex items-center gap-2 text-label font-semibold text-fg">
                    <input type="radio" name="form-template" value={t.id} checked={templateId === t.id} onChange={() => setTemplateId(t.id)} className="accent-[rgb(var(--action))]" />
                    {t.name}
                  </span>
                  <span className="pl-5 text-caption text-fg-muted">{t.description}</span>
                </label>
              )}
            </div>
          </fieldset>
          <TextInput id="new-form-name" label="Form name" optional placeholder={formTemplates.find((t) => t.id === templateId)?.name} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        </div>
      </Dialog>
    </div>);

}