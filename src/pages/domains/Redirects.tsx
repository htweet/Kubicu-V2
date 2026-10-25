import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CornerDownRightIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import type { CustomRedirect } from '../../types/domains';
import { spaceDoc, spaceHandle } from '../../utils/domains/links';
import { activeExtraSpaces, MAIN_SPACE_ID } from '../../utils/spaces';
import { sitePages } from '../../utils/sitePages';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { RedirectDialog } from '../../components/domains/RedirectDialog';
import { Section } from '../../components/ui/layout/Section';
import { List } from '../../components/ui/layout/ListRow';

/** Every forwarding address in one place: yours, plus the ones KUBICU made automatically (D62). */
export function Redirects() {
  const { data, deleteRedirect } = useDomains();
  const { current } = useWorkspace();
  const can = useCan('pages.edit');
  const team = useTeam();
  const [editing, setEditing] = useState<CustomRedirect | null | 'new'>(null);

  const spaces = useMemo(
    () =>
    [{ id: MAIN_SPACE_ID, name: 'Main page' }, ...activeExtraSpaces(current).map((s) => ({ id: s.id, name: s.name }))].
    filter((s) => spaceDoc(current.id, s.id)).
    map((s) => ({ id: s.id, label: `${s.name} · kub.icu/${spaceHandle(current.id, s.id)}` })),
    [current]
  );

  const pageTitle = (spaceId: string, path: string) => {
    if (/^https?:\/\//.test(path)) return path.replace(/^https:\/\//, '');
    const doc = spaceDoc(current.id, spaceId);
    if (!doc) return 'missing page';
    if (!path) return `${doc.title || 'Home'} (home)`;
    if (path === 'shop') return 'Shop';
    return sitePages(doc).find((p) => p.path === path)?.title ?? 'missing page';
  };

  const automatic = useMemo(() => {
    const rows: {key: string;from: string;to: string;why: string;}[] = [];
    [{ id: MAIN_SPACE_ID }, ...activeExtraSpaces(current)].forEach((s) => {
      const doc = spaceDoc(current.id, s.id);
      if (!doc) return;
      (doc.redirects ?? []).forEach((r) =>
      rows.push({ key: `${s.id}-${r.from}`, from: `kub.icu/${doc.handle}/${r.from}`, to: r.to ? `kub.icu/${doc.handle}/${r.to}` : `kub.icu/${doc.handle}`, why: 'You renamed or removed this page' })
      );
    });
    const mainHandle = spaceHandle(current.id, MAIN_SPACE_ID);
    (current.spaces ?? []).
    filter((s) => s.archivedAt).
    forEach((s) => {
      const h = spaceHandle(current.id, s.id);
      if (h && mainHandle) rows.push({ key: `arch-${s.id}`, from: `kub.icu/${h}`, to: `kub.icu/${mainHandle}`, why: `“${s.name}” was archived` });
    });
    return rows;
  }, [current]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Redirects"
        description="Addresses that forward somewhere else. Nothing you’ve shared breaks when you rename a page or end a campaign."
        actions={
        <Button leadingIcon={PlusIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setEditing('new')}>
            Add a redirect
          </Button>
        } />
      

      <Section id="rd-yours" title="Your redirects">
        {data.redirects.length === 0 ?
        <p className="max-w-xl text-label text-fg-muted">None yet. For example, make kub.icu/{spaceHandle(current.id, MAIN_SPACE_ID)}/ig forward to your Instagram, or /menu to a page.</p> :

        <List ruled label="Your redirects">
            {data.redirects.map((r) => {
            const h = spaceHandle(current.id, r.spaceId) ?? '…';
            const dest = pageTitle(r.spaceId, r.to);
            return (
              <li key={r.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <p className="min-w-0 flex-1 truncate text-label font-medium text-fg">
                    kub.icu/{h}/{r.from}
                  </p>
                  <p className={`flex min-w-0 flex-1 items-center gap-1.5 truncate text-label ${dest === 'missing page' ? 'text-danger' : 'text-fg-muted'}`}>
                    <ArrowRightIcon size={14} className="shrink-0" aria-hidden />
                    <span className="truncate">{dest === 'missing page' ? 'Page removed — edit to choose another' : dest}</span>
                  </p>
                  <div className="flex gap-1">
                    <IconButton icon={PencilIcon} label={`Edit redirect from ${r.from}`} size="sm" disabled={!can.allowed} onClick={() => setEditing(r)} />
                    <IconButton
                    icon={Trash2Icon}
                    label={`Delete redirect from ${r.from}`}
                    size="sm"
                    disabled={!can.allowed}
                    onClick={() => {
                      deleteRedirect(r.id);
                      team.log('pages', `deleted the redirect kub.icu/${h}/${r.from}`, '/app/domains/redirects');
                    }} />
                  
                  </div>
                </li>);

          })}
          </List>
        }
      </Section>

      <Section id="rd-auto" title="Made automatically" description="KUBICU keeps these so old links keep working. Change them by editing the page or restoring the space.">
        {automatic.length === 0 ?
        <p className="text-label text-fg-muted">None yet.</p> :

        <List ruled label="Made automatically">
            {automatic.map((r) =>
          <li key={r.key} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                <p className="min-w-0 flex-1 truncate text-label text-fg">{r.from}</p>
                <p className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-label text-fg-muted">
                  <ArrowRightIcon size={14} className="shrink-0" aria-hidden />
                  <span className="truncate">{r.to}</span>
                </p>
                <p className="flex items-center gap-1 text-caption text-fg-subtle sm:w-56">
                  <CornerDownRightIcon size={12} aria-hidden className="sm:hidden" />
                  {r.why}
                </p>
              </li>
          )}
          </List>
        }
      </Section>

      <p className="text-caption text-fg-subtle">
        Short links (…/s/…) are managed on <Link to="/app/domains/links" className="underline underline-offset-2">Campaign links</Link>.
      </p>

      <RedirectDialog open={editing !== null} onClose={() => setEditing(null)} redirect={editing && editing !== 'new' ? editing : undefined} workspaceId={current.id} spaces={spaces} />
    </div>);

}