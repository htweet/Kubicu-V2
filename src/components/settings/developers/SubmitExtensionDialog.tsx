import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTeam } from '../../../contexts/TeamContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { extensionCategories } from '../../../data/extensions';
import { scopeInfo, webhookEvents } from '../../../data/developerApi';
import { plans } from '../../../data/plans';
import type { ApiScope, WebhookEvent } from '../../../types/developers';
import type { ExtensionSubmission } from '../../../types/extensionSubmission';
import type { WorkspacePlan } from '../../../types/plan';
import { DEV_SHARE, priceCapFor, subEvent, updateSubmissions } from '../../../utils/extensionSubmissions';
import { usePlan } from '../../../contexts/PlanContext';
import { isValidEndpoint } from '../../../utils/developers';
import { uid } from '../../../utils/id';
import { formatNgn } from '../../../utils/format';
import { Dialog } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { SelectInput } from '../../ui/SelectInput';
import { Badge } from '../../ui/Badge';

type Category = ExtensionSubmission['category'];
const categories = (Object.keys(extensionCategories) as (keyof typeof extensionCategories)[]).filter((c): c is Category => c !== 'apps');
const planChoices: WorkspacePlan[] = ['free', 'creator', 'pro', 'business'];
const versionOk = (v: string) => /^\d+\.\d+\.\d+$/.test(v.trim());
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

interface Props {
  open: boolean;
  onClose: () => void;
  /** Present when resubmitting or releasing an update. */
  editing: ExtensionSubmission | null;
}

/** Submit (or resubmit) an extension for KUBICU review (D132). */
export function SubmitExtensionDialog({ open, onClose, editing }: Props) {
  const team = useTeam();
  const { current } = useWorkspace();
  const plan = usePlan();
  const cap = priceCapFor(plan.id);
  const [f, setF] = useState(() => blank(current.name));
  const [tried, setTried] = useState(false);
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  useEffect(() => {
    if (!open) return;
    setTried(false);
    setF(
      editing ?
      {
        name: editing.name,
        summary: editing.summary,
        description: editing.description,
        category: editing.category,
        adds: editing.adds.join('\n'),
        scopes: new Set(editing.scopes),
        events: new Set(editing.events),
        appUrl: editing.appUrl,
        supportEmail: editing.supportEmail,
        privacyUrl: editing.privacyUrl,
        price: String(editing.priceNgn),
        minPlan: editing.minPlan,
        version: editing.status === 'listed' ? bump(editing.version) : editing.version,
        releaseNotes: '',
        agree: false
      } :
      blank(current.name)
    );
  }, [open, editing, current.name]);

  const price = Number(f.price || 0);
  const errors = {
    name: f.name.trim().length < 3 ? 'Give it a name of at least 3 characters.' : undefined,
    summary: f.summary.trim().length < 20 ? 'Write one clear sentence (at least 20 characters).' : f.summary.length > 120 ? 'Keep it under 120 characters.' : undefined,
    description: f.description.trim().length < 40 ? 'Explain what it does and for whom (at least 40 characters).' : undefined,
    adds: f.adds.trim() ? undefined : 'List at least one thing it adds.',
    scopes: f.scopes.size === 0 ? 'Pick the smallest set of permissions it needs.' : undefined,
    appUrl: isValidEndpoint(f.appUrl) ?? undefined,
    supportEmail: emailOk(f.supportEmail) ? undefined : 'Enter an email buyers can reach.',
    privacyUrl: isValidEndpoint(f.privacyUrl) ? 'Link to your privacy policy (https://).' : undefined,
    price: Number.isNaN(price) || price < 0 || price > cap ? `On ${plan.name} you can charge up to ${formatNgn(cap)} a month. Higher plans allow more.` : undefined,
    version: versionOk(f.version) ? undefined : 'Use a version like 1.0.0.',
    agree: f.agree ? undefined : 'Tick to confirm.'
  };
  const invalid = Object.values(errors).some(Boolean);

  const submit = () => {
    setTried(true);
    if (invalid) return;
    const now = new Date().toISOString();
    const fields = {
      name: f.name.trim(),
      summary: f.summary.trim(),
      description: f.description.trim(),
      category: f.category,
      adds: f.adds.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6),
      scopes: [...f.scopes],
      events: [...f.events],
      appUrl: f.appUrl.trim(),
      supportEmail: f.supportEmail.trim(),
      privacyUrl: f.privacyUrl.trim(),
      priceNgn: Math.round(price),
      minPlan: f.minPlan,
      version: f.version.trim(),
      releaseNotes: f.releaseNotes.trim()
    };
    const ok = updateSubmissions((s) => {
      if (editing?.status === 'listed')
      return {
        ...s,
        submissions: s.submissions.map((x) => x.id === editing.id ? { ...x, pending: fields, reviewNote: null, history: [subEvent(`Update v${fields.version} submitted`, 'developer'), ...x.history] } : x)
      };
      if (editing)
      return {
        ...s,
        submissions: s.submissions.map((x) =>
        x.id === editing.id ? { ...x, ...fields, status: 'in_review' as const, reviewNote: null, submittedAt: now, history: [subEvent(editing.status === 'listed' ? `Update v${fields.version} submitted` : 'Resubmitted for review', 'developer'), ...x.history] } : x
        )
      };
      const sub: ExtensionSubmission = { id: uid('cx'), workspaceId: current.id, developerName: current.name, ...fields, status: 'in_review', reviewNote: null, submittedAt: now, listedAt: null, history: [subEvent('Submitted for review', 'developer')] };
      return { ...s, submissions: [sub, ...s.submissions] };
    });
    if (!ok) {
      toast.error('Couldn’t save your submission', { description: 'Nothing was sent. Try again.' });
      return;
    }
    team.log('settings', `submitted the extension “${fields.name}” for review`, '/app/settings/developers');
    toast.success('Sent for review', { description: 'KUBICU usually replies within 3 working days. You’ll see the outcome here.' });
    onClose();
  };

  const err = (k: keyof typeof errors) => tried ? errors[k] : undefined;
  const toggle = <T,>(key: 'scopes' | 'events', v: T) =>
  setF((x) => {
    const n = new Set(x[key] as Set<T>);
    if (n.has(v)) n.delete(v);else
    n.add(v);
    return { ...x, [key]: n };
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? editing.status === 'listed' ? `Release an update to ${editing.name}` : `Fix and resubmit ${editing.name}` : 'Submit an extension'}
      description="Our team checks every extension before any workspace can install it. While an update is reviewed, the listed version stays on sale."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? 'Send for review' : 'Submit for review'}</Button>
        </>
      }>
      
      <div className="flex flex-col gap-8">
        {editing?.reviewNote &&
        <div className="rounded-md border border-warning/40 bg-warning-soft px-3 py-2.5">
            <p className="text-label font-semibold text-fg">What KUBICU asked for</p>
            <p className="mt-0.5 text-caption text-fg-muted">“{editing.reviewNote}”</p>
          </div>
        }

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-label font-semibold text-fg">The listing</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput id="sx-name" label="Name" value={f.name} onChange={(e) => set({ name: e.target.value })} error={err('name')} />
            <SelectInput<Category> id="sx-cat" label="Category" value={f.category} onChange={(v) => set({ category: v })} options={categories.map((c) => ({ value: c, label: extensionCategories[c] }))} />
          </div>
          <TextInput id="sx-summary" label="One-line summary" value={f.summary} onChange={(e) => set({ summary: e.target.value })} error={err('summary')} hint={`${f.summary.length}/120 · shown in the catalogue list`} />
          <TextArea id="sx-desc" label="Description" rows={3} value={f.description} onChange={(e) => set({ description: e.target.value })} error={err('description')} />
          <TextArea id="sx-adds" label="What it adds" rows={3} value={f.adds} onChange={(e) => set({ adds: e.target.value })} error={err('adds')} hint="One per line, up to 6. Only things it really does — reviewers check." />
        </fieldset>

        <fieldset>
          <legend className="text-label font-semibold text-fg">Permissions it asks for</legend>
          <p className="mt-0.5 text-caption text-fg-muted">Owners see exactly these before installing. Asking for more than it needs is the most common reason we send extensions back.</p>
          <ul className="mt-3 grid gap-x-4 sm:grid-cols-2">
            {scopeInfo.map((s) =>
            <li key={s.id}>
                <label className="flex cursor-pointer items-start gap-2.5 py-1.5">
                  <input type="checkbox" className="mt-0.5 size-4 accent-[rgb(var(--action))]" checked={f.scopes.has(s.id)} onChange={() => toggle<ApiScope>('scopes', s.id)} />
                  <span className="min-w-0 text-label text-fg">
                    {s.label} {s.risky && <Badge tone="warning">Changes data</Badge>}
                  </span>
                </label>
              </li>
            )}
          </ul>
          {err('scopes') && <p className="mt-1 text-caption text-danger">{err('scopes')}</p>}
          <p className="mt-4 text-label font-medium text-fg">Events it receives (optional)</p>
          <ul className="mt-2 grid gap-x-4 sm:grid-cols-2">
            {webhookEvents.map((e) =>
            <li key={e.id}>
                <label className="flex cursor-pointer items-start gap-2.5 py-1.5">
                  <input type="checkbox" className="mt-0.5 size-4 accent-[rgb(var(--action))]" checked={f.events.has(e.id)} onChange={() => toggle<WebhookEvent>('events', e.id)} />
                  <span className="text-label text-fg">{e.label}</span>
                </label>
              </li>
            )}
          </ul>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-label font-semibold text-fg">Links and support</legend>
          <TextInput id="sx-app" label="Setup address" placeholder="https://yourapp.com/kubicu/connect" value={f.appUrl} onChange={(e) => set({ appUrl: e.target.value })} error={err('appUrl')} hint="Where owners are sent to connect after installing." />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput id="sx-email" label="Support email" type="email" value={f.supportEmail} onChange={(e) => set({ supportEmail: e.target.value })} error={err('supportEmail')} />
            <TextInput id="sx-privacy" label="Privacy policy" placeholder="https://" value={f.privacyUrl} onChange={(e) => set({ privacyUrl: e.target.value })} error={err('privacyUrl')} />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-label font-semibold text-fg">Price and release</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput id="sx-price" label="Monthly price (₦)" inputMode="numeric" value={f.price} onChange={(e) => set({ price: e.target.value.replace(/[^\d]/g, '') })} error={err('price')} hint={price > 0 && price <= cap ? `You get ${formatNgn(Math.round(price * DEV_SHARE))} · cap ${formatNgn(cap)}` : `0 = free · up to ${formatNgn(cap)} on ${plan.name}`} />
            <SelectInput<WorkspacePlan> id="sx-plan" label="Needs plan" value={f.minPlan} onChange={(v) => set({ minPlan: v })} options={planChoices.map((p) => ({ value: p, label: `${plans[p].name}+` }))} />
            <TextInput id="sx-ver" label="Version" value={f.version} onChange={(e) => set({ version: e.target.value })} error={err('version')} />
          </div>
          <TextArea id="sx-notes" label="What’s new" optional rows={2} value={f.releaseNotes} onChange={(e) => set({ releaseNotes: e.target.value })} />
        </fieldset>

        <label className="flex cursor-pointer items-start gap-2.5 text-label text-fg">
          <input type="checkbox" className="mt-0.5 size-4 accent-[rgb(var(--action))]" checked={f.agree} onChange={(e) => set({ agree: e.target.checked })} />
          <span>
            I’ll only use the data these permissions allow, delete it when an owner disconnects, and follow the KUBICU developer terms (draft, pending legal review).
            {err('agree') && <span className="mt-0.5 block text-caption text-danger">{err('agree')}</span>}
          </span>
        </label>
      </div>
    </Dialog>);

}

function blank(_name: string) {
  return {
    name: '',
    summary: '',
    description: '',
    category: 'operations' as Category,
    adds: '',
    scopes: new Set<ApiScope>(['orders:read']),
    events: new Set<WebhookEvent>(),
    appUrl: '',
    supportEmail: '',
    privacyUrl: '',
    price: '0',
    minPlan: 'creator' as WorkspacePlan,
    version: '1.0.0',
    releaseNotes: '',
    agree: false
  };
}

function bump(v: string) {
  const [a, b, c] = v.split('.').map((n) => Number(n) || 0);
  return `${a}.${b}.${c + 1}`;
}