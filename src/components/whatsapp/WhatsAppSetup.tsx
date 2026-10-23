import React, { useEffect, useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { WhatsAppData } from '../../types/whatsapp';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';
import { formatTimestamp } from '../../utils/format';
import { uid } from '../../utils/id';

interface WhatsAppSetupProps {
  data: WhatsAppData;
  canEdit: boolean;
  defaultName: string;
  defaultPhone: string;
  update: (fn: (d: WhatsAppData) => WhatsAppData) => void;
}

const MAX_QUICK_REPLIES = 10;

export function WhatsAppSetup({ data, canEdit, defaultName, defaultPhone, update }: WhatsAppSetupProps) {
  const c = data.connection;
  const [phone, setPhone] = useState(c.phone || defaultPhone);
  const [name, setName] = useState(c.displayName || defaultName);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (c.status === 'none') {
      setPhone(c.phone || defaultPhone);
      setName(c.displayName || defaultName);
    }
  }, [c.status, c.phone, c.displayName, defaultName, defaultPhone]);

  const sendCode = () => {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 10) return setPhoneError('Enter the full WhatsApp Business number, e.g. +234 803 555 0100.');
    if (!name.trim()) return setPhoneError('Add the name customers will see.');
    setPhoneError('');
    update((d) => ({ ...d, connection: { status: 'pending', phone: phone.trim(), displayName: name.trim() } }));
    toast('Code sent', { description: 'Simulated: enter any 6 digits except 000000.' });
  };

  const verify = () => {
    if (!/^\d{6}$/.test(code)) return setCodeError('Enter the 6-digit code.');
    if (code === '000000') return setCodeError('That code didn’t work. Try again.');
    setCodeError('');
    setCode('');
    update((d) => ({ ...d, connection: { ...d.connection, status: 'connected', connectedAt: new Date().toISOString() } }));
    toast.success('WhatsApp connected', { description: 'New chats now arrive here (simulated).' });
  };

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="wa-conn" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="wa-conn" className="text-heading font-semibold text-fg">
              Business number
            </h2>
            <p className="mt-1 text-body text-fg-muted">The WhatsApp Business number customers message. Connection is simulated until a WhatsApp partner is chosen.</p>
          </div>
          <Badge tone={c.status === 'connected' ? 'success' : c.status === 'pending' ? 'warning' : 'neutral'} dot>
            {c.status === 'connected' ? 'Connected' : c.status === 'pending' ? 'Waiting for code' : 'Not connected'}
          </Badge>
        </div>

        {c.status === 'connected' ?
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-raised p-4">
            <div>
              <p className="text-label font-semibold text-fg">{c.displayName}</p>
              <p className="text-caption text-fg-muted">
                {c.phone}
                {c.connectedAt ? ` · since ${formatTimestamp(c.connectedAt)}` : ''}
              </p>
            </div>
            <Button
            variant="destructive"
            size="sm"
            disabled={!canEdit}
            onClick={() => {
              update((d) => ({ ...d, connection: { status: 'none', phone: d.connection.phone, displayName: d.connection.displayName } }));
              toast('Disconnected', { description: 'Your chats are kept here. New messages stop arriving.' });
            }}>
            
              Disconnect
            </Button>
          </div> :
        c.status === 'pending' ?
        <div className="grid max-w-xl gap-4 rounded-lg border border-line bg-raised p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <TextInput id="wa-code" label={`Code sent to ${c.phone}`} inputMode="numeric" maxLength={6} value={code} error={codeError} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            <div className="flex gap-2">
              <Button onClick={verify} disabled={!canEdit}>
                Verify
              </Button>
              <Button variant="tertiary" onClick={() => update((d) => ({ ...d, connection: { ...d.connection, status: 'none' } }))}>
                Change number
              </Button>
            </div>
          </div> :

        <div className="grid max-w-xl gap-4">
            <TextInput id="wa-phone" label="WhatsApp Business number" type="tel" value={phone} error={phoneError} disabled={!canEdit} onChange={(e) => setPhone(e.target.value)} />
            <TextInput id="wa-name" label="Name customers see" value={name} disabled={!canEdit} onChange={(e) => setName(e.target.value)} />
            <div>
              <Button onClick={sendCode} disabled={!canEdit}>
                Send code
              </Button>
            </div>
          </div>
        }
      </section>

      <section aria-labelledby="wa-qr" className="flex flex-col gap-4 border-t border-line pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="wa-qr" className="text-heading font-semibold text-fg">
              Quick replies
            </h2>
            <p className="mt-1 text-body text-fg-muted">Answers to questions you get every day. Up to {MAX_QUICK_REPLIES}.</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={PlusIcon}
            disabled={!canEdit || data.quickReplies.length >= MAX_QUICK_REPLIES}
            onClick={() => update((d) => ({ ...d, quickReplies: [...d.quickReplies, { id: uid('qr'), title: 'New reply', text: '' }] }))}>
            
            Add reply
          </Button>
        </div>
        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
          {data.quickReplies.length === 0 && <li className="px-4 py-6 text-center text-body text-fg-muted">No quick replies yet.</li>}
          {data.quickReplies.map((q, i) =>
          <li key={q.id} className="grid gap-3 p-4 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-start">
              <TextInput id={`qr-t-${q.id}`} label="Name" value={q.title} maxLength={30} disabled={!canEdit} onChange={(e) => update((d) => ({ ...d, quickReplies: d.quickReplies.map((x) => x.id === q.id ? { ...x, title: e.target.value } : x) }))} />
              <TextArea id={`qr-x-${q.id}`} label="Message" rows={2} maxLength={500} value={q.text} disabled={!canEdit} onChange={(e) => update((d) => ({ ...d, quickReplies: d.quickReplies.map((x) => x.id === q.id ? { ...x, text: e.target.value } : x) }))} />
              <IconButton icon={Trash2Icon} label={`Delete quick reply ${i + 1}`} className="sm:mt-6" disabled={!canEdit} onClick={() => update((d) => ({ ...d, quickReplies: d.quickReplies.filter((x) => x.id !== q.id) }))} />
            </li>
          )}
        </ul>
      </section>
    </div>);

}