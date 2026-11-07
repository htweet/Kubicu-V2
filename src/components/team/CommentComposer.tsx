import React, { useId, useMemo, useRef, useState } from 'react';
import { SendIcon } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import { initials } from '../../utils/team';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface CommentComposerProps {
  id: string;
  label: string;
  placeholder?: string;
  initial?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  onSubmit: (text: string) => boolean | void;
  onCancel?: () => void;
}

const MAX = 1000;

/** Comment box with @mention suggestions (D116). Ctrl/⌘+Enter sends. */
export function CommentComposer({ id, label, placeholder = 'Write a comment — type @ to mention someone', initial = '', submitLabel = 'Comment', autoFocus, onSubmit, onCancel }: CommentComposerProps) {
  const team = useTeam();
  const listId = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(initial);
  const [caret, setCaret] = useState(initial.length);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const query = useMemo(() => {
    const m = /(^|\s)@([^\s@]{0,20})$/.exec(text.slice(0, caret));
    return m ? m[2] : null;
  }, [text, caret]);
  const matches = useMemo(
    () => (query === null ? [] : team.data.members.filter((m) => m.id !== team.me.id && m.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)),
    [query, team.data.members, team.me.id],
  );
  const open = !dismissed && matches.length > 0;

  const track = (el: HTMLTextAreaElement) => setCaret(el.selectionStart ?? el.value.length);

  const insert = (name: string) => {
    if (query === null) return;
    const start = caret - query.length - 1;
    const next = `${text.slice(0, start)}@${name} ${text.slice(caret)}`.slice(0, MAX);
    const pos = Math.min(start + name.length + 2, next.length);
    setText(next);
    setCaret(pos);
    setActive(0);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(pos, pos);
    });
  };

  const send = () => {
    if (!text.trim()) return;
    if (onSubmit(text.trim()) !== false) {
      setText('');
      setCaret(0);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : matches.length - 1)) % matches.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insert(matches[Math.min(active, matches.length - 1)].name);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setDismissed(true);
        return;
      }
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <TextArea
        ref={ref}
        id={id}
        label={label}
        rows={2}
        value={text}
        maxLength={MAX}
        placeholder={placeholder}
        autoFocus={autoFocus}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onChange={(e) => {
          setText(e.target.value);
          setDismissed(false);
          setActive(0);
          track(e.target);
        }}
        onKeyUp={(e) => track(e.currentTarget)}
        onClick={(e) => track(e.currentTarget)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul id={listId} role="listbox" aria-label="Mention a teammate" className="flex flex-col overflow-hidden rounded-md border border-line bg-raised py-1 shadow-sm">
          {matches.map((m, i) => (
            <li
              key={m.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                insert(m.name);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn('flex cursor-pointer items-center gap-2.5 px-3 py-2 text-label', i === active ? 'bg-sunken text-fg' : 'text-fg-muted')}
            >
              <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sunken text-[10px] font-semibold text-fg">
                {initials(m.name)}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-fg">{m.name}</span>
              <span className="shrink-0 text-caption capitalize text-fg-subtle">{m.role}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption text-fg-subtle">{text.length > MAX - 100 ? `${text.length}/${MAX}` : 'Ctrl/⌘ + Enter to send'}</span>
        <div className="flex gap-2">
          {onCancel && (
            <Button size="sm" variant="tertiary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button size="sm" variant="secondary" leadingIcon={SendIcon} disabled={!text.trim()} onClick={send}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
