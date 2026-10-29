import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, PencilIcon, SparklesIcon, XIcon } from 'lucide-react';
import { useOps } from '../../contexts/OpsContext';
import { useTeam } from '../../contexts/TeamContext';
import { decideDraft } from '../../utils/ops/liveRuns';
import { pendingDrafts } from '../../utils/ops/pendingDrafts';
import { formatRelative } from '../../utils/format';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { AiPreviewTag } from '../ai/AiPreviewTag';

/** Messages written by "Draft a message with AI" on live runs, waiting for the owner (D137). Nothing is sent on its own. */
export function PendingDrafts() {
  const { data, apply } = useOps();
  const me = useTeam().me.name;
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState('');

  const waiting = pendingDrafts(data.automations);
  if (waiting.length === 0) return null;

  const decide = (aId: string, rId: string, i: number, approve: boolean, newText?: string) => {
    const ok = apply((d) => {
      const edited = newText ? { ...d, automations: d.automations.map((a) => a.id !== aId ? a : { ...a, runs: a.runs.map((r) => r.id !== rId ? r : { ...r, steps: r.steps.map((s, j) => j === i ? { ...s, detail: newText } : s) }) }) } : d;
      return decideDraft(edited, aId, rId, i, approve, me);
    });
    if (!ok) return;
    setEditing(null);
    toast(approve ? 'Approved' : 'Discarded', { description: approve ? 'Ready to send once a messaging partner is connected — copy it to WhatsApp in the meantime.' : 'Nothing was sent.' });
  };

  return (
    <section id="drafts" aria-labelledby="drafts-h" className="ai-frame mt-8 rounded-lg">
      <div className="ai-soft rounded-[7px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="drafts-h" className="flex items-center gap-2 text-heading font-semibold text-fg">
            <SparklesIcon size={17} aria-hidden /> Drafts waiting for you · {waiting.length}
          </h2>
          <AiPreviewTag />
        </div>
        <p className="mt-1 text-caption text-fg-muted">Written from the contact’s name and what they last bought. Approve, edit or discard each one.</p>
        <ul className="mt-4 flex flex-col divide-y divide-line rounded-md border border-line bg-raised">
          {waiting.map(({ a, r, s, i }) => {
            const key = `${r.id}:${i}`;
            return (
              <li key={key} className="flex flex-col gap-3 px-4 py-3.5">
                <p className="text-caption text-fg-subtle">
                  <span className="font-medium text-fg">{a.name}</span> · {r.subject} · {formatRelative(r.at)}
                </p>
                {editing === key ?
                <TextArea id={`draft-${key}`} label="Message" rows={3} value={text} onChange={(e) => setText(e.target.value)} /> :

                <p className="text-label text-fg">{s.detail}</p>
                }
                <div className="flex flex-wrap gap-2">
                  {editing === key ?
                  <>
                      <Button size="sm" leadingIcon={CheckIcon} disabled={!text.trim()} onClick={() => decide(a.id, r.id, i, true, text.trim())}>
                        Save and approve
                      </Button>
                      <Button size="sm" variant="tertiary" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </> :

                  <>
                      <Button size="sm" leadingIcon={CheckIcon} onClick={() => decide(a.id, r.id, i, true)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="secondary" leadingIcon={PencilIcon} onClick={() => (setEditing(key), setText(s.detail))}>
                        Edit
                      </Button>
                      <Button size="sm" variant="tertiary" leadingIcon={XIcon} onClick={() => decide(a.id, r.id, i, false)}>
                        Discard
                      </Button>
                    </>
                  }
                </div>
              </li>);

          })}
        </ul>
      </div>
    </section>);

}