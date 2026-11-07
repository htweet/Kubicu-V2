import React from 'react';
import { LockIcon, PlusIcon, SendIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { WaUpdateId, WhatsAppData } from '../../types/whatsapp';
import { MAX_KEYWORD_REPLIES, WELCOME_BACK_DAYS, fillPlaceholders, keywordList, sendTestUpdate, unknownPlaceholders, updateIds, updateInfo } from '../../utils/whatsapp';
import { uid } from '../../utils/id';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Switch';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { IconButton } from '../ui/IconButton';
import { InlineAlert } from '../ui/InlineAlert';

interface WhatsAppAutoMessagesProps {
  data: WhatsAppData;
  canEdit: boolean;
  /** Keyword replies and updates need Creator or above. */
  unlocked: boolean;
  onUpgrade: () => void;
  update: (fn: (d: WhatsAppData) => WhatsAppData) => void;
}

const hours = Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: `${String(h).padStart(2, '0')}:00` }));
const groups = ['Orders', 'Bookings', 'Win back'] as const;
const approvalLabel = { draft: 'Draft', in_review: 'In review', approved: 'Approved' } as const;
const approvalTone = { draft: 'neutral', in_review: 'warning', approved: 'success' } as const;

/** Every automatic WhatsApp message in one place (D100): replies to customers, then updates the business starts. */
export function WhatsAppAutoMessages({ data, canEdit, unlocked, onUpgrade, update }: WhatsAppAutoMessagesProps) {
  const proEdit = canEdit && unlocked;

  const setUpdate = (id: WaUpdateId, patch: Partial<WhatsAppData['updates'][WaUpdateId]>) => update((d) => ({ ...d, updates: { ...d.updates, [id]: { ...d.updates[id], ...patch } } }));

  const submitForReview = (id: WaUpdateId) => {
    setUpdate(id, { approval: 'in_review' });
    toast('Sent to WhatsApp for review', { description: 'Simulated — approved in a few seconds.' });
    window.setTimeout(() => update((d) => (d.updates[id].approval === 'in_review' ? { ...d, updates: { ...d.updates, [id]: { ...d.updates[id], approval: 'approved' } } } : d)), 3000);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Replies */}
      <section aria-labelledby="wa-replies" className="flex flex-col gap-6">
        <div>
          <h2 id="wa-replies" className="text-heading font-semibold text-fg">
            Replies to customers
          </h2>
          <p className="mt-1 text-body text-fg-muted">Sent the moment someone writes, so nobody waits in silence. Free on every plan.</p>
        </div>
        <div className="grid gap-x-8 gap-y-8 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <Switch id="wa-greet" label="Greeting" description="To someone messaging you for the first time." checked={data.greeting.on} disabled={!canEdit} onChange={(v) => update((d) => ({ ...d, greeting: { ...d.greeting, on: v } }))} />
            <TextArea id="wa-greet-text" label="Greeting message" rows={4} maxLength={300} value={data.greeting.text} disabled={!canEdit || !data.greeting.on} onChange={(e) => update((d) => ({ ...d, greeting: { ...d.greeting, text: e.target.value } }))} />
          </div>
          <div className="flex flex-col gap-3">
            <Switch id="wa-back" label="Welcome back" description={`To someone who hasn’t written for ${WELCOME_BACK_DAYS}+ days.`} checked={data.welcomeBack.on} disabled={!canEdit} onChange={(v) => update((d) => ({ ...d, welcomeBack: { ...d.welcomeBack, on: v } }))} />
            <TextArea id="wa-back-text" label="Welcome back message" rows={4} maxLength={300} value={data.welcomeBack.text} disabled={!canEdit || !data.welcomeBack.on} onChange={(e) => update((d) => ({ ...d, welcomeBack: { ...d.welcomeBack, text: e.target.value } }))} />
          </div>
          <div className="flex flex-col gap-3">
            <Switch id="wa-away" label="Away message" description="When someone writes outside your hours." checked={data.away.on} disabled={!canEdit} onChange={(v) => update((d) => ({ ...d, away: { ...d.away, on: v } }))} />
            <TextArea id="wa-away-text" label="Away message" rows={4} maxLength={300} value={data.away.text} disabled={!canEdit || !data.away.on} onChange={(e) => update((d) => ({ ...d, away: { ...d.away, text: e.target.value } }))} />
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="wa-open" label="Open from" value={String(data.openHour)} disabled={!canEdit || !data.away.on} options={hours} onChange={(v) => update((d) => ({ ...d, openHour: Math.min(Number(v), d.closeHour - 1) }))} />
              <SelectInput id="wa-close" label="Close at" value={String(data.closeHour)} disabled={!canEdit || !data.away.on} options={hours.slice(1).concat({ value: '24', label: '24:00' })} onChange={(v) => update((d) => ({ ...d, closeHour: Math.max(Number(v), d.openHour + 1) }))} />
            </div>
          </div>
        </div>
      </section>

      {!unlocked && (
        <InlineAlert
          tone="info"
          title="Keyword replies and order updates are on Creator and above"
          action={
            <Button size="sm" leadingIcon={LockIcon} onClick={onUpgrade}>
              Upgrade
            </Button>
          }
        >
          You can look through them below. Greeting, welcome back and away messages stay free.
        </InlineAlert>
      )}

      {/* Keyword replies */}
      <section aria-labelledby="wa-kw" className="flex flex-col gap-4 border-t border-line pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="wa-kw" className="text-heading font-semibold text-fg">
              Keyword replies
            </h2>
            <p className="mt-1 text-body text-fg-muted">Answer common questions instantly when a message contains a word you choose. The first match wins. Up to {MAX_KEYWORD_REPLIES}.</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={PlusIcon}
            disabled={!proEdit || data.keywordReplies.length >= MAX_KEYWORD_REPLIES}
            onClick={() => update((d) => ({ ...d, keywordReplies: [...d.keywordReplies, { id: uid('kw'), on: true, keywords: '', text: '' }] }))}
          >
            Add keyword reply
          </Button>
        </div>
        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
          {data.keywordReplies.length === 0 && <li className="px-4 py-6 text-center text-body text-fg-muted">No keyword replies yet.</li>}
          {data.keywordReplies.map((k, i) => {
            const words = keywordList(k);
            const set = (patch: Partial<typeof k>) => update((d) => ({ ...d, keywordReplies: d.keywordReplies.map((x) => (x.id === k.id ? { ...x, ...patch } : x)) }));
            return (
              <li key={k.id} className="grid gap-3 p-4 md:grid-cols-[14rem_minmax(0,1fr)_auto] md:items-start">
                <TextInput
                  id={`kw-k-${k.id}`}
                  label="When a message contains"
                  hint={words.length ? `${words.length} keyword${words.length === 1 ? '' : 's'}` : 'Separate with commas'}
                  error={k.on && k.text.trim() && !words.length ? 'Add at least one keyword.' : undefined}
                  value={k.keywords}
                  maxLength={120}
                  disabled={!proEdit}
                  onChange={(e) => set({ keywords: e.target.value })}
                />
                <TextArea id={`kw-x-${k.id}`} label="Reply with" rows={2} maxLength={500} value={k.text} disabled={!proEdit} onChange={(e) => set({ text: e.target.value })} />
                <div className="flex items-center gap-1 md:mt-6">
                  <Switch id={`kw-on-${k.id}`} label="On" checked={k.on} disabled={!proEdit} onChange={(v) => set({ on: v })} />
                  <IconButton icon={Trash2Icon} label={`Delete keyword reply ${i + 1}`} disabled={!proEdit} onClick={() => update((d) => ({ ...d, keywordReplies: d.keywordReplies.filter((x) => x.id !== k.id) }))} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Business-started updates */}
      <section aria-labelledby="wa-upd" className="flex flex-col gap-4 border-t border-line pt-8">
        <div>
          <h2 id="wa-upd" className="text-heading font-semibold text-fg">
            Updates you send
          </h2>
          <p className="mt-1 max-w-3xl text-body text-fg-muted">
            Sent automatically when an order or booking changes. WhatsApp only allows business-started messages as approved templates, so editing one sends it back for a quick review. Approval and sending are simulated until a WhatsApp partner is chosen —
            <strong className="font-semibold text-fg"> Send test</strong> shows exactly what a customer would get in a “Test messages” chat.
          </p>
        </div>

        {groups.map((g) => (
          <div key={g} className="flex flex-col gap-2">
            <h3 className="text-label font-semibold text-fg-muted">{g}</h3>
            <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
              {updateIds
                .filter((id) => updateInfo[id].group === g)
                .map((id) => {
                  const info = updateInfo[id];
                  const t = data.updates[id];
                  const unknown = unknownPlaceholders(id, t.text);
                  return (
                    <li key={id} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,16rem)] lg:items-start">
                      <div className="flex flex-col gap-2">
                        <Switch id={`upd-on-${id}`} label={info.label} description={info.when} checked={t.on} disabled={!proEdit || (t.approval !== 'approved' && !t.on)} onChange={(v) => setUpdate(id, { on: v })} />
                        <span>
                          <Badge tone={approvalTone[t.approval]} dot>
                            {approvalLabel[t.approval]}
                          </Badge>
                        </span>
                      </div>
                      <TextArea
                        id={`upd-x-${id}`}
                        label="Message"
                        rows={3}
                        maxLength={500}
                        value={t.text}
                        hint={`Fills in: ${info.placeholders.map((p) => `{${p}}`).join(' ')}`}
                        error={unknown.length ? `Can’t fill ${unknown.map((u) => `{${u}}`).join(', ')} here.` : !t.text.trim() ? 'Write the message.' : undefined}
                        disabled={!proEdit}
                        onChange={(e) => setUpdate(id, { text: e.target.value, approval: 'draft', on: false })}
                      />
                      <div className="flex flex-col gap-2">
                        <p className="text-caption font-medium text-fg-muted">Preview</p>
                        <p className="rounded-lg rounded-tl-sm bg-sunken px-3 py-2 text-caption text-fg">{fillPlaceholders(t.text) || '—'}</p>
                        <div className="flex flex-wrap gap-2">
                          {t.approval === 'draft' && (
                            <Button size="sm" disabled={!proEdit || !!unknown.length || !t.text.trim()} onClick={() => submitForReview(id)}>
                              Submit for review
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            leadingIcon={SendIcon}
                            disabled={!proEdit || !t.text.trim()}
                            onClick={() => {
                              update((d) => sendTestUpdate(d, id));
                              toast('Test sent', { description: 'Open “Test messages” in Chats to see it.' });
                            }}
                          >
                            Send test
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
        <p className="text-caption text-fg-subtle">Customers only get updates if they gave a WhatsApp number at checkout or booking. Order and booking updates aren’t marketing; win-back messages respect each contact’s marketing choice.</p>
      </section>
    </div>
  );
}
