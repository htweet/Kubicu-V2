import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CopyIcon } from 'lucide-react';
import type { Role } from '../../types/team';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { roleInfo } from '../../data/permissions';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { inviteState } from '../../utils/team';
import { dialPrefix } from '../../utils/phone';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SpaceAccessField } from './SpaceAccessField';
import { RolePicker } from './RolePicker';
import { useT } from '../../contexts/LocaleContext';

/** Invite by email or phone, with a role and the spaces they can edit (D57). */
export function InviteDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { t: tr } = useT();
  const team = useTeam();
  const { current } = useWorkspace();
  const [contact, setContact] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [spaceIds, setSpaceIds] = useState<string[] | null>(null);
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setContact('');
    setRole('editor');
    setSpaceIds(null);
    setTried(false);
    setSent(null);
  }, [open]);

  const c = contact.trim().toLowerCase();
  const error = !c ?
  'Enter an email or phone number.' :
  !isValidEmail(c) && !isValidPhone(c) ?
  'That doesn’t look like an email or a phone number.' :
  team.data.members.some((m) => m.contact.toLowerCase() === c) ?
  'They’re already on the team.' :
  team.data.invites.some((i) => i.contact.toLowerCase() === c && inviteState(i) === 'pending') ?
  'There’s already a pending invite for them — resend it from the list.' :
  '';

  const send = () => {
    setTried(true);
    if (error) return;
    const inv = team.invite({ contact: contact.trim(), role, spaceIds: role === 'admin' ? null : spaceIds });
    if (!inv) {
      toast.error(tr('No seats left'), { description: tr('Free a seat or upgrade to invite more people.') });
      return;
    }
    setSent(inv.token);
  };

  const link = sent ? `${window.location.origin}/invite/${sent}` : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={sent ? 'Invite ready' : 'Invite people'}
      description={sent ? tr(isValidEmail(c) ? 'Prototype: nothing is sent. In the real product {contact} gets an email with this link. It expires in 7 days.' : 'Prototype: nothing is sent. In the real product {contact} gets a WhatsApp message with this link. It expires in 7 days.', { contact: contact.trim() }) : tr('They join {workspace} with the role you pick. You can change it any time.', { workspace: current.name })}
      footer={
      sent ?
      <Button onClick={onClose}>Done</Button> :

      <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={send}>Send invite</Button>
          </>

      }>
      
      {sent ?
      <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-md bg-sunken px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate font-mono text-caption text-fg">{link}</span>
            <Button
            size="sm"
            variant="secondary"
            leadingIcon={CopyIcon}
            onClick={() => {
              void navigator.clipboard?.writeText(link);
              toast(tr('Invite link copied'));
            }}>
            
              Copy
            </Button>
          </div>
          <p className="text-caption text-fg-muted">{tr('Open the link in another tab to see what {contact} sees.', { contact: contact.trim() })}</p>
        </div> :

      <div className="flex flex-col gap-5">
          <TextInput id="invite-contact" label="Email or phone" value={contact} placeholder={`name@example.com or ${dialPrefix()}`} error={tried ? error || undefined : undefined} onChange={(e) => setContact(e.target.value)} />
          <RolePicker value={role} onChange={setRole} />
          {role !== 'admin' && <SpaceAccessField value={spaceIds} onChange={setSpaceIds} />}
          {role === 'admin' && <p className="text-caption text-fg-muted">{tr('Admins can always edit every space.')}</p>}
          <p className="text-caption text-fg-subtle">{tr(roleInfo[role].summary)}</p>
        </div>
      }
    </Dialog>);

}