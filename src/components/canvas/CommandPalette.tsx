import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookmarkIcon, CornerDownLeftIcon, EyeIcon, HistoryIcon, MonitorIcon, PaletteIcon, Redo2Icon, RocketIcon, SearchIcon, SmartphoneIcon, TabletIcon, Undo2Icon, BoxIcon, ShoppingBagIcon, ReceiptIcon, UsersIcon } from "lucide-react";
import { Viewport } from "../../types/page";
import { useEditor } from "../../contexts/EditorContext";
import { useLibrary } from "../../contexts/LibraryContext";
import { blockDefinitions, blockOrder } from "../../data/blockRegistry";
import { blockName, summarizeBlock } from "../../utils/blocks";
import { Kbd } from "../ui/Kbd";
import { cn } from "../../utils/cn";
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onPublish: () => void;
  onVersions: () => void;
  onViewport: (v: Viewport) => void;
}
interface Command {
  id: string;
  group: 'Actions' | 'Add a block' | 'Your sections' | 'Go to block';
  label: string;
  hint?: string;
  icon: BoxIcon;
  keywords?: string;
  run: () => void;
}

/** ⌘K: search every block, section and editor action from the keyboard. */
export function CommandPalette({
  open,
  onClose,
  onPublish,
  onVersions,
  onViewport
}: CommandPaletteProps) {
  const {
    state,
    actions,
    canUndo,
    canRedo
  } = useEditor();
  const library = useLibrary();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const previous = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      window.clearTimeout(t);
      previous?.focus();
    };
  }, [open]);
  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [{
      id: 'publish',
      group: 'Actions',
      label: 'Publish…',
      icon: RocketIcon,
      keywords: 'live schedule',
      run: onPublish
    }, {
      id: 'preview',
      group: 'Actions',
      label: 'Preview draft',
      icon: EyeIcon,
      run: () => navigate(`/p/${state.draft.handle}?draft=1`)
    }, {
      id: 'theme',
      group: 'Actions',
      label: 'Page theme',
      icon: PaletteIcon,
      keywords: 'colours fonts design',
      run: () => actions.select(null)
    }, {
      id: 'versions',
      group: 'Actions',
      label: 'Version history',
      icon: HistoryIcon,
      keywords: 'restore snapshot',
      run: onVersions
    }, {
      id: 'phone',
      group: 'Actions',
      label: 'Preview on phone',
      icon: SmartphoneIcon,
      keywords: 'viewport mobile',
      run: () => onViewport('phone')
    }, {
      id: 'tablet',
      group: 'Actions',
      label: 'Preview on tablet',
      icon: TabletIcon,
      keywords: 'viewport',
      run: () => onViewport('tablet')
    }, {
      id: 'desktop',
      group: 'Actions',
      label: 'Preview on desktop',
      icon: MonitorIcon,
      keywords: 'viewport',
      run: () => onViewport('desktop')
    }];
    if (canUndo) list.push({
      id: 'undo',
      group: 'Actions',
      label: 'Undo',
      icon: Undo2Icon,
      run: actions.undo
    });
    if (canRedo) list.push({
      id: 'redo',
      group: 'Actions',
      label: 'Redo',
      icon: Redo2Icon,
      run: actions.redo
    });
    list.push({
      id: 'commerce:add',
      group: 'Actions',
      label: 'Add product',
      icon: ShoppingBagIcon,
      keywords: 'commerce catalogue sell',
      run: () => navigate('/app/commerce/products?new=1')
    }, {
      id: 'commerce:orders',
      group: 'Actions',
      label: 'Find order',
      icon: ReceiptIcon,
      keywords: 'commerce orders customer',
      run: () => navigate('/app/commerce/orders')
    }, {
      id: 'audience:add',
      group: 'Actions',
      label: 'Add contact',
      icon: UsersIcon,
      keywords: 'audience crm lead customer',
      run: () => navigate('/app/audience')
    });
    blockOrder.forEach((type) => {
      const def = blockDefinitions[type];
      list.push({
        id: `add:${type}`,
        group: 'Add a block',
        label: def.name,
        hint: def.category,
        icon: def.icon,
        keywords: `${def.description} ${def.keywords.join(' ')}`,
        run: () => actions.addBlock(type)
      });
    });
    library.sections.forEach((s) => list.push({
      id: `sec:${s.id}`,
      group: 'Your sections',
      label: s.name,
      hint: `${s.blocks.length} blocks`,
      icon: BookmarkIcon,
      run: () => actions.insertBlocks(s.blocks, s.name)
    }));
    state.draft.blocks.forEach((b) => list.push({
      id: `go:${b.id}`,
      group: 'Go to block',
      label: blockName(b),
      hint: summarizeBlock(b),
      icon: blockDefinitions[b.type].icon,
      run: () => actions.select(b.id)
    }));
    return list;
  }, [actions, canRedo, canUndo, library.sections, navigate, onPublish, onVersions, onViewport, state.draft.blocks, state.draft.handle]);
  const q = query.trim().toLowerCase();
  const results = q ? commands.filter((c) => `${c.label} ${c.hint ?? ''} ${c.keywords ?? ''} ${c.group}`.toLowerCase().includes(q)) : commands.filter((c) => c.group !== 'Go to block');
  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({
      block: 'nearest'
    });
  }, [active]);
  const run = (c: Command | undefined) => {
    if (!c) return;
    onClose();
    c.run();
  };
  let lastGroup = '';
  return createPortal(<AnimatePresence>
      {open && <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-black/45" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.15
      }} onClick={onClose} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-label="Command menu" initial={{
        opacity: 0,
        scale: 0.97,
        y: -6
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.98
      }} transition={{
        duration: 0.16,
        ease: [0.23, 1, 0.32, 1]
      }} className="relative flex max-h-[min(560px,70vh)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-line bg-overlay text-fg shadow-3" onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActive((i) => Math.min(results.length - 1, i + 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActive((i) => Math.max(0, i - 1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          run(results[active]);
        }
      }}>
            <div className="flex items-center gap-2.5 border-b border-line px-4">
              <SearchIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
              <input ref={inputRef} role="combobox" aria-expanded="true" aria-controls="command-list" aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined} aria-label="Search actions and blocks" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Add a block, find a block, or run an action…" className="h-12 min-w-0 flex-1 bg-transparent text-body text-fg placeholder:text-fg-subtle focus:outline-none" />
              <Kbd>Esc</Kbd>
            </div>
            <ul ref={listRef} id="command-list" role="listbox" className="scroll-quiet min-h-0 flex-1 overflow-y-auto p-1.5">
              {results.length === 0 && <li className="px-3 py-8 text-center text-label text-fg-subtle">Nothing matches “{query}”.</li>}
              {results.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            const Icon = c.icon;
            return <React.Fragment key={c.id}>
                    {header && <li role="presentation" className="px-2.5 pb-1 pt-2.5 text-caption font-semibold text-fg-subtle">
                        {header}
                      </li>}
                    <li id={`cmd-${c.id}`} role="option" aria-selected={i === active} data-index={i} onMouseMove={() => setActive(i)} onClick={() => run(c)} className={cn('flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2', i === active ? 'bg-sunken' : '')}>
                      <Icon size={15} className="shrink-0 text-fg-muted" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-label text-fg">{c.label}</span>
                      {c.hint && <span className="max-w-[40%] shrink-0 truncate text-caption text-fg-subtle">{c.hint}</span>}
                      {i === active && <CornerDownLeftIcon size={13} className="shrink-0 text-fg-subtle" aria-hidden />}
                    </li>
                  </React.Fragment>;
          })}
            </ul>
          </motion.div>
        </div>}
    </AnimatePresence>, document.body);
}