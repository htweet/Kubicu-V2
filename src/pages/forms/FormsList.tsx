import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, ClipboardListIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useFormsStore } from '../../hooks/useFormsStore';
import { formTemplateCategories, formTemplates, type FormTemplateCategory } from '../../data/formTemplates';
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
  const [category, setCategory] = useState<FormTemplateCategory | 'all'>('all');
  const shownTemplates = category === 'all' ? formTemplates : formTemplates.filter((t) => t.category === category);
  const [name, setName] = useState('');
  const selected = formTemplates.find((t) => t.id === templateId) ?? formTemplates[0];
  const selectedCount = useMemo(() => selected.fields().filter((f) => f.type !== 'hidden' && f.type !== 'section').length, [selected]);

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
        size="xl"
        footer={
        <>
            <p className="min-w-0 text-caption text-fg-subtle sm:mr-auto sm:self-center" aria-live="polite">
              <span className="font-medium text-fg">{selected.name}</span> · {selectedCount} question{selectedCount === 1 ? '' : 's'} to start with
            </p>
            <Button variant="tertiary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={create}>Create form</Button>
          </>
        }>
        
        <div className="flex flex-col gap-5 pb-2">
          <div className="sm:max-w-sm">
            <TextInput id="new-form-name" label="Form name" optional placeholder={selected.name} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </div>
          <fieldset>
            <legend className="mb-2 text-label font-medium text-fg">Start from</legend>
            <div role="group" aria-label="Filter starting points" className="scroll-quiet sticky -top-3 z-10 -mx-6 mb-3 flex gap-1.5 overflow-x-auto overflow-y-hidden border-b border-line bg-overlay px-6 py-2.5">
              {[{ id: 'all' as const, label: 'All' }, ...formTemplateCategories].map((c) =>
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  'h-8 shrink-0 whitespace-nowrap rounded-full border px-3 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  category === c.id ? 'border-fg bg-fg text-canvas' : 'border-line text-fg-muted hover:bg-sunken hover:text-fg'
                )}>
                
                  {c.label}
                  <span className={cn('ml-1.5 tabular-nums', category === c.id ? 'opacity-70' : 'text-fg-subtle')}>{c.id === 'all' ? formTemplates.length : formTemplates.filter((t) => t.category === c.id).length}</span>
                </button>
              )}
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {shownTemplates.map((t) => {
                const Icon = t.icon;
                const on = templateId === t.id;
                return (
                  <label
                    key={t.id}
                    className={cn(
                      'relative flex h-full cursor-pointer gap-3 rounded-lg border bg-raised p-4 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus',
                      on ? 'border-action ring-1 ring-action' : 'border-line hover:border-line-strong'
                    )}>
                    
                    <input type="radio" name="form-template" value={t.id} checked={on} onChange={() => setTemplateId(t.id)} className="sr-only" />
                    <span aria-hidden className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors duration-150', on ? 'bg-action text-action-fg' : 'bg-sunken text-fg-muted')}>
                      <Icon size={17} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1 pr-5">
                      <span className="text-label font-semibold leading-snug text-fg">{t.name}</span>
                      <span className="line-clamp-2 text-caption leading-snug text-fg-muted">{t.description}</span>
                      {t.highlights && t.highlights.length > 0 &&
                      <span className="mt-auto flex flex-wrap gap-1 pt-1.5">
                          {t.highlights.map((h) =>
                        <span key={h} className="rounded-sm border border-line px-1.5 py-px text-[11px] font-medium leading-4 text-fg-muted">
                              {h}
                            </span>
                        )}
                        </span>
                      }
                      {t.setupNote && <span className="pt-0.5 text-[11.5px] leading-snug text-fg-subtle">{t.setupNote}</span>}
                    </span>
                    <span
                      aria-hidden
                      className={cn('absolute right-3.5 top-3.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors duration-150', on ? 'border-action bg-action text-action-fg' : 'border-line-strong bg-raised')}>
                      
                      {on && <CheckIcon size={11} strokeWidth={3} />}
                    </span>
                  </label>);

              })}
            </div>
          </fieldset>
        </div>
      </Dialog>
    </div>);

}