import React, { useEffect, useRef, useState } from 'react';
import { ExternalLinkIcon, PackageIcon, SendIcon, UserPlusIcon, ZapIcon } from 'lucide-react';
import type { Product } from '../../types/commerce';
import type { WaChat, WaChatLabel, WaProductCard, WaQuickReply } from '../../types/whatsapp';
import { chatLabels, inServiceWindow, SERVICE_WINDOW_HOURS } from '../../utils/whatsapp';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { SelectInput } from '../ui/SelectInput';
import { InlineAlert } from '../ui/InlineAlert';
import { cn } from '../../utils/cn';

interface ChatThreadProps {
  chat: WaChat | null;
  canEdit: boolean;
  quickReplies: WaQuickReply[];
  products: Product[];
  toCard: (p: Product) => WaProductCard;
  onClose: () => void;
  onSend: (chat: WaChat, text: string, product?: WaProductCard) => void;
  onLabel: (chat: WaChat, label: WaChatLabel) => void;
  onSaveContact: (chat: WaChat) => void;
}

const FOLLOW_UP_TEMPLATE = 'Hi {name}, following up on your message to us. Reply here if you’d still like help with your order.';

export function ChatThread({ chat, canEdit, quickReplies, products, toCard, onClose, onSend, onLabel, onSaveContact }: ChatThreadProps) {
  const [text, setText] = useState('');
  const [picker, setPicker] = useState<'none' | 'replies' | 'products'>('none');
  const endRef = useRef<HTMLLIElement>(null);
  const open = !!chat;

  useEffect(() => {
    setText('');
    setPicker('none');
  }, [chat?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [chat?.messages.length]);

  if (!chat) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const windowOpen = inServiceWindow(chat);
  const send = () => {
    if (!text.trim()) return;
    onSend(chat, text.trim());
    setText('');
  };

  const footer = !canEdit ?
  <p className="text-caption text-fg-muted">Your role can read chats but not reply.</p> :
  windowOpen ?
  <div className="flex w-full flex-col gap-3">
      {picker === 'replies' &&
    <ul className="max-h-40 divide-y divide-line overflow-y-auto rounded-md border border-line" aria-label="Quick replies">
          {quickReplies.length === 0 && <li className="px-3 py-2 text-caption text-fg-muted">No quick replies yet. Add some in Setup.</li>}
          {quickReplies.map((q) =>
      <li key={q.id}>
              <button type="button" className="w-full px-3 py-2 text-left hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none" onClick={() => {setText(q.text);setPicker('none');}}>
                <span className="block text-label font-medium text-fg">{q.title}</span>
                <span className="block truncate text-caption text-fg-muted">{q.text}</span>
              </button>
            </li>
      )}
        </ul>
    }
      {picker === 'products' &&
    <ul className="max-h-48 divide-y divide-line overflow-y-auto rounded-md border border-line" aria-label="Products to send">
          {products.length === 0 && <li className="px-3 py-2 text-caption text-fg-muted">No products can be sent yet. Products need to be active with a price.</li>}
          {products.map((p) =>
      <li key={p.id}>
              <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none"
          onClick={() => {
            const card = toCard(p);
            onSend(chat, text.trim() || `Here’s ${p.name}. You can order it here:`, card);
            setText('');
            setPicker('none');
          }}>
          
                <span className="min-w-0 truncate text-label text-fg">{p.name}</span>
                <span className="shrink-0 text-caption tabular-nums text-fg-muted">{p.priceNgn ? formatNgn(p.priceNgn) : '—'}</span>
              </button>
            </li>
      )}
        </ul>
    }
      <div className="flex items-end gap-2">
        <label htmlFor="wa-compose" className="sr-only">
          Reply to {chat.name}
        </label>
        <textarea
        id="wa-compose"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        placeholder="Type a reply"
        className="min-h-[2.75rem] flex-1 resize-none rounded-md border border-line bg-raised px-3 py-2 text-body text-fg placeholder:text-fg-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-action/30" />
      
        <Button leadingIcon={SendIcon} onClick={send} disabled={!text.trim()}>
          Send
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" leadingIcon={ZapIcon} aria-expanded={picker === 'replies'} onClick={() => setPicker(picker === 'replies' ? 'none' : 'replies')}>
          Quick reply
        </Button>
        <Button size="sm" variant="secondary" leadingIcon={PackageIcon} aria-expanded={picker === 'products'} onClick={() => setPicker(picker === 'products' ? 'none' : 'products')}>
          Send a product
        </Button>
      </div>
    </div> :

  <div className="flex w-full flex-col gap-3">
      <InlineAlert tone="info" title={`More than ${SERVICE_WINDOW_HOURS} hours since they wrote`}>
        WhatsApp only allows approved message templates now. Send the follow-up template, and you can chat freely once they reply.
      </InlineAlert>
      <Button
      variant="secondary"
      onClick={() => onSend(chat, FOLLOW_UP_TEMPLATE.replace('{name}', chat.name.split(' ')[0] || 'there'))}>
      
        Send follow-up template
      </Button>
    </div>;


  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      height="full"
      title={chat.name}
      description={`${chat.phone} · Simulated WhatsApp chat`}
      footer={footer}
      bodyClassName="flex flex-col gap-5">
      
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <SelectInput<WaChatLabel>
          id="wa-label"
          label="Label"
          value={chat.label}
          disabled={!canEdit}
          onChange={(v) => onLabel(chat, v)}
          options={(Object.keys(chatLabels) as WaChatLabel[]).map((l) => ({ value: l, label: chatLabels[l] }))} />
        
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" leadingIcon={UserPlusIcon} disabled={!canEdit || chat.contactSaved} onClick={() => onSaveContact(chat)}>
            {chat.contactSaved ? 'In Audience' : 'Save to Audience'}
          </Button>
          <Button size="sm" variant="tertiary" leadingIcon={ExternalLinkIcon} onClick={() => window.open(whatsappLink(chat.phone, ''), '_blank', 'noopener')}>
            Open in WhatsApp
          </Button>
        </div>
      </div>

      <ol className="flex flex-col gap-3 rounded-lg bg-sunken p-4" aria-label="Messages">
        {chat.messages.map((m) => {
          const mine = m.from !== 'customer';
          return (
            <li key={m.id} className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
              <div className={cn('max-w-[85%] rounded-lg px-3 py-2 text-body', mine ? 'bg-action text-action-fg' : 'border border-line bg-raised text-fg')}>
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                {m.product &&
                <div className={cn('mt-2 rounded-md border px-3 py-2', mine ? 'border-action-fg/25' : 'border-line')}>
                    <p className="text-label font-semibold">{m.product.name}</p>
                    <p className="text-caption tabular-nums opacity-90">{m.product.priceNgn ? formatNgn(m.product.priceNgn) : 'Ask for price'}</p>
                    <p className="mt-1 truncate font-mono text-caption opacity-80">{m.product.url}</p>
                  </div>
                }
              </div>
              <span className="text-caption text-fg-subtle">
                {m.from === 'auto' ? 'Automatic · ' : ''}
                {formatTimestamp(m.at)}
              </span>
            </li>);

        })}
        <li ref={endRef} aria-hidden className="h-0" />
      </ol>
    </Sheet>);

}