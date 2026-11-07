import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BuildingIcon, CornerDownLeftIcon, SearchIcon, SlidersHorizontalIcon, ToggleRightIcon, UserIcon, BoxIcon } from "lucide-react";
import { StaffMember } from "../../types/admin";
import { adminNavItems } from "../../data/adminNavigation";
import { roleCanOpen } from "../../data/staffRoles";
import { adjustableFigures } from "../../data/adjustableFigures";
import { workspaceNav } from "../../data/navigation";
import { extensions } from "../../data/extensions";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useAccount } from "../../utils/account/store";
import { buildPeople } from "../../utils/admin/people";
import { Dialog } from "../ui/Dialog";
import { Kbd } from "../ui/Kbd";
import { cn } from "../../utils/cn";
interface Result {
  id: string;
  group: string;
  label: string;
  sub: string;
  icon: BoxIcon;
  to: string;
}
const MAX_PER_GROUP = 6;

/**
 * Staff console search (D472): one box for areas, people, workspaces, figures and module switches.
 * Opens with the sidebar button, Ctrl/⌘ K or "/". Only areas this staff role can open are searched.
 */
export function AdminSearch({
  staff,
  open,
  onClose
}: {
  staff: StaffMember;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const {
    workspaces
  } = useWorkspace();
  const account = useAccount();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
    }
  }, [open]);
  const can = (area: string) => roleCanOpen(staff.role, area);
  const all: Result[] = useMemo(() => {
    const areas: Result[] = adminNavItems.filter(i => can(i.id)).map(i => ({
      id: `area:${i.id}`,
      group: 'Areas',
      label: i.label,
      sub: i.summary,
      icon: i.icon,
      to: `/admin/${i.id}`
    }));
    const tenants = can('tenants');
    const people: Result[] = tenants ? buildPeople(workspaces, account).map(p => ({
      id: `person:${p.key}`,
      group: 'People',
      label: p.name,
      sub: [p.email || p.phone, `${p.workspaces.length} workspace${p.workspaces.length === 1 ? '' : 's'}`].filter(Boolean).join(' · '),
      icon: UserIcon,
      to: `/admin/tenants?person=${encodeURIComponent(p.key)}`
    })) : [];
    const spaces: Result[] = tenants ? workspaces.map(w => ({
      id: `ws:${w.id}`,
      group: 'Workspaces',
      label: w.name,
      sub: `Owner ${w.ownerName}`,
      icon: BuildingIcon,
      to: `/admin/tenants?ws=${encodeURIComponent(w.id)}`
    })) : [];
    const figures: Result[] = can('figures') ? adjustableFigures.map(f => ({
      id: `fig:${f.key}`,
      group: 'Figures',
      label: f.label,
      sub: f.area,
      icon: SlidersHorizontalIcon,
      to: `/admin/figures?q=${encodeURIComponent(f.label)}`
    })) : [];
    const switches: Result[] = can('flags') ? [...workspaceNav.map(n => ({
      id: `nav:${n.id}`,
      group: 'Module switches',
      label: n.label,
      sub: 'Workspace module',
      icon: ToggleRightIcon,
      to: `/admin/flags?q=${encodeURIComponent(n.label)}`
    })), ...extensions.filter(e => !e.retired).map(e => ({
      id: `ext:${e.id}`,
      group: 'Module switches',
      label: e.name,
      sub: 'Marketplace add-on',
      icon: ToggleRightIcon,
      to: `/admin/flags?q=${encodeURIComponent(e.name)}`
    }))] : [];
    return [...areas, ...people, ...spaces, ...figures, ...switches];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, account, staff.role]);
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all.filter(r => r.group === 'Areas').slice(0, 8);
    const words = term.split(/\s+/);
    const hit = all.filter(r => words.every(w => `${r.label} ${r.sub} ${r.group}`.toLowerCase().includes(w)));
    const groups = [...new Set(hit.map(r => r.group))];
    return groups.flatMap(g => hit.filter(r => r.group === g).slice(0, MAX_PER_GROUP));
  }, [all, q]);
  useEffect(() => setActive(0), [q]);
  const go = (r: Result | undefined) => {
    if (!r) return;
    onClose();
    navigate(r.to);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };
  let lastGroup = '';
  return <Dialog open={open} onClose={onClose} centered size="lg" title="Search the staff console">
      <div className="flex flex-col gap-3 pb-2">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <SearchIcon size={18} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input autoFocus type="search" role="combobox" aria-expanded aria-controls="admin-search-results" aria-activedescendant={results[active] ? `admin-search-${results[active].id}` : undefined} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKeyDown} placeholder="People, workspaces, areas, figures or modules" className="h-11 w-full rounded-md border border-line bg-raised pl-10 pr-3 text-body text-fg placeholder:text-fg-subtle focus:border-action focus:outline-none focus:ring-2 focus:ring-focus" />
        </label>
        {q.trim() === '' && <p className="text-caption text-fg-subtle">Start typing — for example a person’s email, a workspace name, “trial” or “Kenya”.</p>}
        <ul id="admin-search-results" role="listbox" aria-label="Results" className="flex flex-col">
          {results.map((r, i) => {
          const header = r.group !== lastGroup ? r.group : null;
          lastGroup = r.group;
          const Icon = r.icon;
          return <React.Fragment key={r.id}>
                {header && <li role="presentation" className="px-2 pb-1 pt-3 text-meta font-semibold text-fg-subtle">
                    {header}
                  </li>}
                <li id={`admin-search-${r.id}`} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)} onClick={() => go(r)} className={cn('flex cursor-pointer items-center gap-3 rounded-md px-2 py-2', i === active ? 'bg-sunken' : '')}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line text-fg-muted">
                    <Icon size={16} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label font-medium text-fg">{r.label}</span>
                    <span className="block truncate text-caption text-fg-subtle">{r.sub}</span>
                  </span>
                  {i === active && <CornerDownLeftIcon size={14} aria-hidden className="shrink-0 text-fg-subtle" />}
                </li>
              </React.Fragment>;
        })}
        </ul>
        {q.trim() !== '' && results.length === 0 && <p className="px-2 py-6 text-center text-label text-fg-muted">Nothing matches “{q.trim()}”.</p>}
        <p className="hidden items-center gap-1.5 border-t border-line pt-3 text-caption text-fg-subtle sm:flex">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> to move · <Kbd>Enter</Kbd> to open · <Kbd>Esc</Kbd> to close
        </p>
      </div>
    </Dialog>;
}

/** Ctrl/⌘ K and "/" open the search, unless the person is typing in a field. */
export function useAdminSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpen();
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpen]);
}