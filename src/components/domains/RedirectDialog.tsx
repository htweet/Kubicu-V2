import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';
import { useDomains } from '../../contexts/DomainsContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useTeam } from '../../contexts/TeamContext';
import type { CustomRedirect } from '../../types/domains';
import { spaceDoc, spaceHandle } from '../../utils/domains/links';
import { sitePages } from '../../utils/sitePages';
import { STOREFRONT_PATH, storefrontAvailable } from '../../utils/commerce/storefront';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { uid } from '../../utils/id';
import { useT } from '../../contexts/LocaleContext';

interface Props {
  open: boolean;
  onClose: () => void;
  redirect?: CustomRedirect;
  workspaceId: string;
  spaces: {id: string;label: string;}[];
}

const PATH_PATTERN = /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;
/** Addresses the platform uses inside every space. */
const RESERVED = ['s', 'shop', 'order', 'download', 'booking'];

export function RedirectDialog({ open, onClose, redirect, workspaceId, spaces }: Props) {
  const { t: tr } = useT();
  const { data, saveRedirect } = useDomains();
  const { data: commerce } = useCommerce();
  const team = useTeam();
  const [spaceId, setSpaceId] = useState(MAIN_SPACE_ID);
  const [from, setFrom] = useState('');
  const [kind, setKind] = useState<'page' | 'url'>('page');
  const [page, setPage] = useState('');
  const [url, setUrl] = useState('https://');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    const external = !!redirect && /^https?:\/\//.test(redirect.to);
    setSpaceId(redirect?.spaceId ?? MAIN_SPACE_ID);
    setFrom(redirect?.from ?? '');
    setKind(external ? 'url' : 'page');
    setPage(redirect && !external ? redirect.to : '');
    setUrl(external ? redirect!.to : 'https://');
    setTried(false);
  }, [open, redirect]);

  const doc = spaceDoc(workspaceId, spaceId);
  const handle = spaceHandle(workspaceId, spaceId) ?? '';
  const targets = useMemo(() => {
    if (!doc) return [];
    const list = [{ value: '', label: `${doc.title || tr('Home')} (${tr('home')})` }, ...sitePages(doc).map((p) => ({ value: p.path, label: p.title || p.path }))];
    if (spaceId === MAIN_SPACE_ID && storefrontAvailable(doc, commerce)) list.push({ value: STOREFRONT_PATH, label: 'Shop' });
    return list;
  }, [doc, spaceId, commerce, tr]);

  const clean = from.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  const fromError = !clean ?
  'Type the address people will visit.' :
  !PATH_PATTERN.test(clean) ?
  'Use lowercase letters, numbers, hyphens and / only.' :
  RESERVED.includes(clean.split('/')[0]) ?
  tr('“{word}” is used by KUBICU. Pick another word.', { word: clean.split('/')[0] }) :
  doc && sitePages(doc).some((p) => p.path === clean) ?
  'A page already uses this address — the page would win. Pick another.' :
  data.redirects.some((r) => r.spaceId === spaceId && r.from === clean && r.id !== redirect?.id) ?
  'You already have a redirect from this address.' :
  undefined;
  let urlError: string | undefined;
  if (kind === 'url') {
    try {
      const u = new URL(url.trim());
      if (u.protocol !== 'https:') urlError = 'Use a secure address starting with https://.';
    } catch {
      urlError = 'Enter a full address, like https://instagram.com/adaeze.';
    }
  }
  const to = kind === 'url' ? url.trim() : page;
  const loopError = kind === 'page' && to === clean ? 'It can’t forward to itself.' : undefined;

  const save = () => {
    setTried(true);
    if (fromError || urlError || loopError) return;
    const next: CustomRedirect = { id: redirect?.id ?? uid('rdr'), spaceId, from: clean, to, createdAt: redirect?.createdAt ?? new Date().toISOString() };
    if (!saveRedirect(next)) return;
    team.log('pages', `${redirect ? 'updated' : 'added'} the redirect kub.icu/${handle}/${clean}`, '/app/domains/redirects');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={redirect ? 'Edit redirect' : 'Add a redirect'}
      description="Forward an address you choose — handy for printed links, old addresses, or a quick link to your Instagram."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{redirect ? 'Save' : 'Add redirect'}</Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        {spaces.length > 1 && <SelectInput id="rd-space" label="Space" value={spaceId} options={spaces.map((s) => ({ value: s.id, label: s.label }))} onChange={setSpaceId} />}
        <TextInput id="rd-from" label="From" prefix={`/${handle}/`.length > 14 ? '…/' : `/${handle}/`} placeholder="menu" value={from} onChange={(e) => setFrom(e.target.value)} error={tried ? fromError : undefined} hint={`kub.icu/${handle}/${clean || 'menu'}`} />
        <div className="flex flex-col gap-1.5">
          <span className="text-label font-medium text-fg">{tr('To')}</span>
          <Segmented<'page' | 'url'>
            ariaLabel="Forward to"
            fullWidth
            value={kind}
            onChange={setKind}
            options={[
            { value: 'page', label: 'One of my pages' },
            { value: 'url', label: 'Another website' }]
            } />
          
        </div>
        {kind === 'page' ?
        <SelectInput id="rd-page" label="Page" value={page} options={targets} onChange={setPage} hint={loopError && tried ? loopError : undefined} /> :

        <TextInput id="rd-url" label="Website address" type="url" value={url} onChange={(e) => setUrl(e.target.value)} error={tried ? urlError : undefined} />
        }
      </div>
    </Dialog>);

}