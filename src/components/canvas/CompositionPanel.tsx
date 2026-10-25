import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { CheckCircle2Icon, InfoIcon, LayoutPanelTopIcon, XIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { useBlockShelf } from '../../hooks/useBlockShelf';
import { compositionFindings, type CompositionFinding } from '../../utils/compositionCheck';
import { Button } from '../ui/Button';

/**
 * Check → Composition (D174): layout suggestions from simple rules the page can actually be tested against.
 * Each one says what it's about and why; the action is optional and undoable; Dismiss hides it on this device.
 */
export function CompositionPanel() {
  const { state, actions } = useEditor();
  const shelf = useBlockShelf();
  const all = useMemo(() => compositionFindings(state.draft.blocks), [state.draft.blocks]);
  const findings = all.filter((f) => !shelf.dismissed.includes(`comp:${f.id}`));

  const run = (f: CompositionFinding) => {
    if (!f.fix) return;
    if (f.fix.kind === 'add') {
      actions.addBlock(f.fix.type, state.draft.blocks.length);
      toast('Added at the end of the page', { action: { label: 'Undo', onClick: () => actions.undo() } });
    } else if (f.fix.kind === 'tighten') {
      actions.updateMeta(f.fix.blockId, { layout: { spacing: 'tight' } });
      toast('Spacing set to Tight', { action: { label: 'Undo', onClick: () => actions.undo() } });
    } else actions.select(f.fix.blockId);
  };

  return (
    <section aria-labelledby="chk-comp">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="chk-comp" className="inline-flex items-center gap-1.5 text-label font-semibold text-fg">
          <LayoutPanelTopIcon size={14} aria-hidden /> Composition
        </h2>
        <span className="text-caption text-fg-subtle">Rule-based, not AI</span>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-caption font-medium text-fg-muted" role="status">
        {findings.length === 0 ? <CheckCircle2Icon size={14} className="text-success" aria-hidden /> : null}
        {findings.length === 0 ? 'The page reads well: a clear start, an action and varied sections' : `${findings.length} suggestion${findings.length === 1 ? '' : 's'} — all optional`}
      </p>
      {findings.length > 0 &&
      <ul className="mt-3 flex flex-col gap-2">
          {findings.map((f) =>
        <li key={f.id} className="rounded-md border border-line p-3">
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-label font-medium text-fg">{f.title}</span>
                  <span className="mt-0.5 block text-caption text-fg-muted">{f.why}</span>
                </span>
                <button
              type="button"
              aria-label={`Dismiss: ${f.title}`}
              onClick={() => shelf.dismiss(`comp:${f.id}`)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-fg-subtle hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
                  <XIcon size={14} aria-hidden />
                </button>
              </div>
              {f.fix &&
          <Button size="sm" variant="secondary" className="mt-2" onClick={() => run(f)}>
                  {f.fix.label}
                </Button>
          }
            </li>
        )}
        </ul>
      }
      <p className="mt-3 flex gap-1.5 text-caption text-fg-subtle">
        <InfoIcon size={13} className="mt-px shrink-0" aria-hidden />
        Checks look at block order, actions, backgrounds and spacing. Nothing changes unless you press a button.
      </p>
    </section>);

}