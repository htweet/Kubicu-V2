import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Partnership } from '../../types/partnership';
import type { SharedShop, SharedShopMember } from '../../types/sharedShop';
import type { Workspace } from '../../types/workspace';
import { MAX_MEMBERS, readSharedShops, slugify, slugProblem, updateSharedShops } from '../../utils/sharedShops';
import { resolvePublicPage } from '../../utils/resolvePublicPage';
import { uid } from '../../utils/id';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { PartnerAvatar } from './PartnerAvatar';

interface Props {
  open: boolean;
  onClose: () => void;
  host: Workspace;
  hostHandle: string;
  partners: Partnership[];
  workspaces: Workspace[];
}

/** Collaborations → Shared shops → New (D128): name, link, and which business partners to invite. */
export function SharedShopDialog({ open, onClose, host, hostHandle, partners, workspaces }: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [tried, setTried] = useState(false);
  const eligible = partners.filter((p) => p.kind === 'connected' && p.status === 'active' && p.partner.handle);

  useEffect(() => {
    if (!open) return;
    setName('');
    setSlug('');
    setSlugEdited(false);
    setDescription('');
    setPicked(new Set());
    setTried(false);
  }, [open]);

  const errors = {
    name: name.trim().length < 3 ? 'Give the shop a name customers will recognise.' : '',
    slug: slugProblem(slug, readSharedShops()) ?? '',
    members: picked.size === 0 ? 'Invite at least one business partner.' : picked.size + 1 > MAX_MEMBERS ? `Up to ${MAX_MEMBERS} sellers, including you.` : ''
  };

  const create = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    const now = new Date().toISOString();
    const me: SharedShopMember = { id: uid('ssm'), name: host.name, handle: hostHandle, workspaceId: host.id, partnershipId: null, status: 'joined', productIds: [], joinedAt: now };
    const others: SharedShopMember[] = eligible.
    filter((p) => picked.has(p.id)).
    map((p) => {
      const resolved = resolvePublicPage(p.partner.handle!, workspaces, '');
      return {
        id: uid('ssm'),
        name: p.partner.name,
        handle: p.partner.handle!,
        workspaceId: resolved?.workspaceId ?? null,
        partnershipId: p.id,
        status: 'invited',
        productIds: [],
        sampleItems: p.sample && !resolved?.workspaceId ? sampleFor(p.partner.name) : undefined
      };
    });
    const shop: SharedShop = { id: uid('ssh'), slug, name: name.trim(), description: description.trim(), hostWorkspaceId: host.id, hostName: host.name, members: [me, ...others], createdAt: now };
    if (!updateSharedShops((l) => [shop, ...l])) return toast.error('Couldn’t save', { description: 'Browser storage is full.' });
    toast.success('Shared shop created', { description: `${others.length} invite${others.length === 1 ? '' : 's'} sent. Their products appear once they agree.` });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New shared shop"
      description="One link where you and your partners show products together. Each seller keeps their own checkout, money and delivery."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={create}>Create and invite</Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <TextInput
          id="ss-name"
          label="Shop name"
          placeholder="e.g. Balogun Market Line 4, Aso-ebi Collective"
          value={name}
          error={tried ? errors.name || undefined : undefined}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }} />
        
        <TextInput
          id="ss-slug"
          label="Link"
          prefix="kub.icu/m/"
          value={slug}
          error={tried ? errors.slug || undefined : undefined}
          onChange={(e) => {
            setSlugEdited(true);
            setSlug(slugify(e.target.value));
          }} />
        
        <TextArea id="ss-desc" label="What customers will find" optional rows={2} value={description} placeholder="e.g. Ready-made and made-to-measure fashion from six Lagos designers." onChange={(e) => setDescription(e.target.value)} />

        <fieldset>
          <legend className="text-label font-medium text-fg">Sellers to invite</legend>
          <p className="mt-0.5 text-caption text-fg-subtle">From your business partners on KUBICU. You’re included automatically.</p>
          {eligible.length === 0 ?
          <p className="mt-3 rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">You need an active business partner on KUBICU first. Use Work together on the Business partners tab.</p> :

          <ul className="mt-3 divide-y divide-line rounded-md border border-line">
              {eligible.map((p) =>
            <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5">
                    <input
                  type="checkbox"
                  className="size-4 accent-[rgb(var(--action))]"
                  checked={picked.has(p.id)}
                  onChange={() =>
                  setPicked((s) => {
                    const n = new Set(s);
                    if (n.has(p.id)) n.delete(p.id);else
                    n.add(p.id);
                    return n;
                  })
                  } />
                
                    <PartnerAvatar partner={p.partner} size="sm" />
                    <span className="min-w-0">
                      <span className="block text-label font-medium text-fg">{p.partner.name}</span>
                      <span className="block text-caption text-fg-subtle">@{p.partner.handle}{p.partner.city ? ` · ${p.partner.city}` : ''}</span>
                    </span>
                  </label>
                </li>
            )}
            </ul>
          }
          {tried && errors.members && <p className="mt-2 text-caption font-medium text-danger">{errors.members}</p>}
        </fieldset>
      </div>
    </Dialog>);

}

function sampleFor(name: string) {
  const base = name.split(' ')[0];
  return [
  { id: 's1', name: `${base} signature piece`, priceNgn: 25000, imageUrl: '', imageAlt: '' },
  { id: 's2', name: `${base} everyday option`, priceNgn: 12000, imageUrl: '', imageAlt: '' }];

}