import React, { useEffect, useMemo, useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import type { ProofData, ProofSource, WorkItem } from '../../types/proof';
import { useCommerce } from '../../contexts/CommerceContext';
import { useOps } from '../../contexts/OpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useServiceOs } from '../../hooks/useServiceOs';
import { eligibleSources, matchedLabel } from '../../utils/proof';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { MediaPicker } from '../media/MediaPicker';

interface Props {
  /** Null closes; 'new' starts a blank entry. */
  item: WorkItem | 'new' | null;
  canEdit: boolean;
  update: (fn: (d: ProofData) => ProofData) => void;
  onClose: () => void;
}

const blank = (): WorkItem => ({ id: uid('work'), title: '', date: new Date().toISOString().slice(0, 10), description: '', imageUrl: '', imageAlt: '', source: null, clientName: '', published: false, createdAt: new Date().toISOString() });

/** Add or edit one piece of delivered work, optionally matched to the real record behind it (D91). */
export function WorkEditor({ item, canEdit, update, onClose }: Props) {
  const { current } = useWorkspace();
  const commerce = useCommerce();
  const ops = useOps();
  const sos = useServiceOs(current.id);
  const [draft, setDraft] = useState<WorkItem | null>(null);
  const [named, setNamed] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const d = item === 'new' ? blank() : item;
    setDraft(d);
    setNamed(!!d?.clientName);
    setTried(false);
  }, [item]);

  // Any completed record can be matched — asking for a review isn't required.
  const sources = useMemo(() => eligibleSources(commerce.data.orders, ops.data.bookings, sos.data.jobs, []), [commerce.data.orders, ops.data.bookings, sos.data.jobs]);
  const options = useMemo(() => {
    const list: ProofSource[] = sources.map((s) => s.source);
    if (draft?.source && !list.some((s) => s.id === draft.source?.id)) list.unshift(draft.source);
    return list;
  }, [sources, draft?.source]);

  if (!draft) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const set = (p: Partial<WorkItem>) => setDraft({ ...draft, ...p });
  const isNew = item === 'new';
  const titleErr = tried && !draft.title.trim() ? 'Give it a short title.' : undefined;
  const nameErr = tried && named && !draft.clientName.trim() ? 'Add the name, or switch this off.' : undefined;

  const save = () => {
    setTried(true);
    if (!draft.title.trim() || named && !draft.clientName.trim()) return;
    const next = { ...draft, title: draft.title.trim(), clientName: named ? draft.clientName.trim() : '' };
    update((d) => ({ ...d, work: d.work.some((w) => w.id === next.id) ? d.work.map((w) => w.id === next.id ? next : w) : [next, ...d.work] }));
    onClose();
  };

  return (
    <Sheet
      open={!!item}
      onClose={onClose}
      side="right"
      title={isNew ? 'Add delivered work' : 'Edit delivered work'}
      description="Show what you’ve actually delivered. Matching it to a real record adds a “matched” label visitors can trust."
      footer={
      <div className="flex items-center gap-2">
          {!isNew && canEdit &&
        <Button
          variant="tertiary"
          leadingIcon={Trash2Icon}
          onClick={() => {
            update((d) => ({ ...d, work: d.work.filter((w) => w.id !== draft.id) }));
            onClose();
          }}>
          
              Delete
            </Button>
        }
          <span className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!canEdit} onClick={save}>
              Save
            </Button>
          </span>
        </div>
      }>
      
      <div className="flex flex-col gap-5">
        <TextInput id="work-title" label="What you delivered" placeholder="e.g. Bridal party of six" value={draft.title} error={titleErr} disabled={!canEdit} onChange={(e) => set({ title: e.target.value })} />
        <TextInput id="work-date" label="Date delivered" type="date" value={draft.date} disabled={!canEdit} onChange={(e) => set({ date: e.target.value })} />
        <TextArea id="work-desc" label="Short description" optional rows={3} maxLength={280} value={draft.description} disabled={!canEdit} onChange={(e) => set({ description: e.target.value })} hint="What was the brief, and what did you hand over?" />
        <MediaPicker id="work-photo" label="Photo" optional aspect="16:9" value={draft.imageUrl} disabled={!canEdit} onChange={(src, meta) => set({ imageUrl: src, imageAlt: draft.imageAlt || meta?.alt || '' })} />
        {draft.imageUrl && <TextInput id="work-alt" label="Describe the photo" value={draft.imageAlt} disabled={!canEdit} onChange={(e) => set({ imageAlt: e.target.value })} />}
        <SelectInput<string>
          id="work-source"
          label="Match to a real record"
          value={draft.source ? `${draft.source.kind}:${draft.source.id}` : ''}
          disabled={!canEdit}
          onChange={(v) => set({ source: options.find((s) => `${s.kind}:${s.id}` === v) ?? null })}
          options={[{ value: '', label: 'Not matched' }, ...options.map((s) => ({ value: `${s.kind}:${s.id}`, label: s.label }))]} />
        
        <p className="-mt-3 text-caption text-fg-subtle">{draft.source ? `Visitors see “${matchedLabel[draft.source.kind]}”.` : 'Completed orders, completed bookings and finished jobs from the last 120 days can be matched.'}</p>
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <Switch id="work-named" checked={named} disabled={!canEdit} onChange={setNamed} label="Name the client" description="Only if they’ve agreed to be named on your page." />
          {named && <TextInput id="work-client" label="Client name as shown" placeholder="e.g. Chiamaka" value={draft.clientName} error={nameErr} disabled={!canEdit} onChange={(e) => set({ clientName: e.target.value })} />}
          <Switch id="work-published" checked={draft.published} disabled={!canEdit} onChange={(v) => set({ published: v })} label="Show on my page" description="Appears in Proof blocks on your page once you publish." />
        </div>
      </div>
    </Sheet>);

}