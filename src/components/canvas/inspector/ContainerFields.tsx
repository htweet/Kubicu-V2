import React from 'react';
import { AlignCenterIcon, AlignLeftIcon, ArrowDownIcon, ArrowUpIcon, CornerDownLeftIcon, LogOutIcon, SmartphoneIcon, UnplugIcon } from 'lucide-react';
import type { Block, BlockType } from '../../../types/page';
import type { ContainerBlock } from '../../../utils/containers';
import { MAX_CHILDREN, childrenOf, isContainer, isContainerType, slotName, topLevel } from '../../../utils/containers';
import { blockDefinitions, blockOrder } from '../../../data/blockRegistry';
import { blockName, layerName, summarizeBlock } from '../../../utils/blocks';
import { useEditor } from '../../../contexts/EditorContext';
import { containerRules, fitsIn } from '../../../data/blockCompatibility';
import { usePlan } from '../../../contexts/PlanContext';
import { planAtLeast } from '../../../data/plans';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { SelectInput } from '../../ui/SelectInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';

/** Content settings for Section, Columns and Tabs (D167): their own options, then the blocks inside. */
export function ContainerFields({ block }: {block: ContainerBlock;}) {
  const { state, actions } = useEditor();
  const plan = usePlan();
  const blocks = state.draft.blocks;
  const kids = childrenOf(blocks, block.id);
  const tops = topLevel(blocks);
  const at = tops.findIndex((b) => b.id === block.id);
  const above = tops[at - 1];
  const below = tops[at + 1];
  const room = kids.length < MAX_CHILDREN;
  const canTake = (b?: Block): b is Block => !!b && room && !isContainer(b) && !b.locked && fitsIn(b.type, block.type).ok;
  // Compatibility (D174): say why a neighbour can't come in, rather than hiding the option silently.
  const refusal = (b?: Block) => b && room && !isContainer(b) && !fitsIn(b.type, block.type).ok ? `“${blockName(b)}” can’t go in: ${fitsIn(b.type, block.type).reason}` : null;
  const id = (f: string) => `${block.id}-${f}`;
  const name = blockDefinitions[block.type].name;
  const unlocked = planAtLeast(plan.id, 'creator');
  const addable = blockOrder.filter((t) => !isContainerType(t) && !blockDefinitions[t].requiresApp && fitsIn(t, block.type).ok);

  const own = (() => {
    if (block.type === 'section') {
      const c = block.content;
      return (
        <>
          <TextInput id={id('heading')} label="Section heading" optional value={c.heading} placeholder="e.g. What I offer" onChange={(e) => actions.updateContent(block.id, 'section', { heading: e.target.value }, 'heading')} />
          <TextArea id={id('intro')} label="Short intro" optional rows={2} value={c.intro} onChange={(e) => actions.updateContent(block.id, 'section', { intro: e.target.value }, 'intro')} />
          <Field id={id('align')} label="Heading alignment">
            <Segmented
              ariaLabel="Heading alignment"
              value={c.align}
              onChange={(align) => actions.updateContent(block.id, 'section', { align }, 'align')}
              options={[
              { value: 'left', label: 'Left', icon: AlignLeftIcon },
              { value: 'center', label: 'Centre', icon: AlignCenterIcon }]
              } />
            
          </Field>
        </>);

    }
    if (block.type === 'columns') {
      const c = block.content;
      return (
        <>
          {kids.length === 2 &&
          <Field id={id('ratio')} label="Column widths">
              <Segmented
              ariaLabel="Column widths"
              fullWidth
              value={c.ratio}
              onChange={(ratio) => actions.updateContent(block.id, 'columns', { ratio }, 'ratio')}
              options={[
              { value: 'equal', label: '1 : 1' },
              { value: 'wide-first', label: '3 : 2' },
              { value: 'narrow-first', label: '2 : 3' }]
              } />
            
            </Field>
          }
          <Field id={id('valign')} label="Line columns up at the">
            <Segmented
              ariaLabel="Vertical alignment"
              fullWidth
              value={c.valign}
              onChange={(valign) => actions.updateContent(block.id, 'columns', { valign }, 'valign')}
              options={[
              { value: 'top', label: 'Top' },
              { value: 'center', label: 'Middle' }]
              } />
            
          </Field>
          <Field id={id('gap')} label="Space between columns">
            <Segmented
              ariaLabel="Space between columns"
              fullWidth
              value={c.gap}
              onChange={(gap) => actions.updateContent(block.id, 'columns', { gap }, 'gap')}
              options={[
              { value: 'normal', label: 'Normal' },
              { value: 'wide', label: 'Roomy' }]
              } />
            
          </Field>
          <Field id={id('phone')} label="On phones: order when stacked" trailing={<PhoneTag />} hint="Phones only — columns stack one under another. Four columns sit 2 × 2 on tablets.">
            <Segmented
              ariaLabel="Order on phones"
              fullWidth
              value={c.phoneReverse ? 'reverse' : 'normal'}
              onChange={(v) => actions.updateContent(block.id, 'columns', { phoneReverse: v === 'reverse' }, 'phoneReverse')}
              options={[
              { value: 'normal', label: 'As listed' },
              { value: 'reverse', label: 'Reversed' }]
              } />
            
          </Field>
        </>);

    }
    const c = block.content;
    return (
      <>
        <Field id={id('style')} label="Tab style">
          <Segmented
            ariaLabel="Tab style"
            fullWidth
            value={c.style}
            onChange={(style) => actions.updateContent(block.id, 'tabs', { style }, 'style')}
            options={[
            { value: 'underline', label: 'Underline' },
            { value: 'pills', label: 'Pills' }]
            } />
          
        </Field>
        <Field id={id('phoneStyle')} label="On phones and narrow screens" trailing={<PhoneTag />} hint="An accordion is easier to use on phones than a row of tabs.">
          <Segmented
            ariaLabel="On narrow screens"
            fullWidth
            value={c.phoneStyle}
            onChange={(phoneStyle) => actions.updateContent(block.id, 'tabs', { phoneStyle }, 'phoneStyle')}
            options={[
            { value: 'accordion', label: 'Accordion' },
            { value: 'tabs', label: 'Keep tabs' }]
            } />
          
        </Field>
      </>);

  })();

  return (
    <div className="flex flex-col gap-5">
      {!unlocked && block.type !== 'section' &&
      <InlineAlert tone="info" title={`${name} work fully on Creator and above`}>
          {block.type === 'columns' ? 'On your plan the blocks inside stack one under another.' : 'On your plan every tab shows one under another, each with its label as a heading.'}
        </InlineAlert>
      }
      {own}

      <section aria-labelledby={id('inside')} className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id={id('inside')} className="text-label font-semibold text-fg">
            Inside this {name.toLowerCase()}
          </h3>
          <span className="text-caption text-fg-subtle">
            {kids.length} of {MAX_CHILDREN}
          </span>
        </div>
        {kids.length === 0 ?
        <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
            Nothing inside yet. Add a block below, or move the block above or below into it.
          </p> :

        <ol className="flex flex-col divide-y divide-line rounded-md border border-line">
            {kids.map((k, i) => {
            const Icon = blockDefinitions[k.type].icon;
            return (
              <li key={k.id} className="flex flex-col gap-2 p-2.5">
                  <div className="flex items-center gap-2">
                    <Icon size={15} className="shrink-0 text-fg-muted" aria-hidden />
                    <button type="button" onClick={() => actions.select(k.id)} className="min-w-0 flex-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      <span className="block truncate text-label font-medium text-fg">
                        {slotName(block, i, k)} · {layerName(k)}
                      </span>
                      <span className="block truncate text-caption text-fg-subtle">{summarizeBlock(k) || 'Select to edit'}</span>
                    </button>
                    <IconButton icon={ArrowUpIcon} label={`Move ${blockName(k)} earlier`} size="sm" disabled={i === 0 || !!k.locked} onClick={() => actions.moveBlock(k.id, -1)} />
                    <IconButton icon={ArrowDownIcon} label={`Move ${blockName(k)} later`} size="sm" disabled={i === kids.length - 1 || !!k.locked} onClick={() => actions.moveBlock(k.id, 1)} />
                    <IconButton icon={LogOutIcon} label={`Move ${blockName(k)} out of the ${name.toLowerCase()}`} size="sm" disabled={!!k.locked} onClick={() => actions.moveOutOfContainer(k.id)} />
                  </div>
                  {block.type === 'tabs' &&
                <TextInput
                  id={id(`label-${k.id}`)}
                  label="Tab label"
                  value={k.slotLabel ?? ''}
                  placeholder={`Tab ${i + 1}`}
                  onChange={(e) => actions.updateBlockLabel(k.id, e.target.value)} />

                }
                </li>);

          })}
          </ol>
        }
        {room ?
        <SelectInput<'' | BlockType>
          id={id('add')}
          label="Add a block inside"
          value=""
          onChange={(t) => t && actions.addBlock(t, undefined, block.id)}
          options={[{ value: '', label: 'Choose a block…' }, ...addable.map((t) => ({ value: t, label: blockDefinitions[t].name }))]} /> :


        <p className="text-caption text-fg-subtle">Full — a {name.toLowerCase()} holds up to {MAX_CHILDREN} blocks. Add another {name.toLowerCase()} for more.</p>
        }
        {[refusal(above), refusal(below)].filter(Boolean).map((r) =>
        <p key={r} className="text-caption text-fg-subtle">{r}</p>
        )}
        <p className="text-caption text-fg-subtle">{containerRules[block.type]}</p>
        {(canTake(above) || canTake(below)) &&
        <div className="flex flex-wrap gap-2">
            {canTake(above) &&
          <Button variant="secondary" size="sm" leadingIcon={CornerDownLeftIcon} onClick={() => actions.moveIntoContainer(above.id, block.id)}>
                Move “{blockName(above)}” above into it
              </Button>
          }
            {canTake(below) &&
          <Button variant="secondary" size="sm" leadingIcon={CornerDownLeftIcon} onClick={() => actions.moveIntoContainer(below.id, block.id)}>
                Move “{blockName(below)}” below into it
              </Button>
          }
          </div>
        }
      </section>

      {kids.length > 0 &&
      <div className="border-t border-line pt-4">
          <Button variant="tertiary" size="sm" leadingIcon={UnplugIcon} disabled={!!block.locked} onClick={() => actions.unwrapContainer(block.id)}>
            Remove {name.toLowerCase()}, keep its blocks
          </Button>
        </div>
      }
    </div>);

}

/** Marks a setting that only affects phones, so per-device changes are never a surprise. */
function PhoneTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-meta font-medium text-fg-muted">
      <SmartphoneIcon size={11} aria-hidden /> Phones
    </span>);

}