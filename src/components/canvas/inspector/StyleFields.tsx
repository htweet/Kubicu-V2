import React from 'react';
import { AlignCenterIcon, AlignLeftIcon, PaletteIcon } from 'lucide-react';
import type { Block } from '../../../types/page';
import { blockDefinitions } from '../../../data/blockRegistry';
import { useEditor } from '../../../contexts/EditorContext';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { Button } from '../../ui/Button';

const alignable = new Set<Block['type']>(['profile', 'heading', 'text', 'link', 'social']);

export function StyleFields({ block }: {block: Block;}) {
  const { actions } = useEditor();
  const def = blockDefinitions[block.type];

  return (
    <div className="flex flex-col gap-5">
      {alignable.has(block.type) &&
      <Field id={`${block.id}-align`} label="Alignment">
          <Segmented
          ariaLabel="Alignment"
          value={block.style.align}
          onChange={(align) => actions.updateMeta(block.id, { style: { align } })}
          options={[
          { value: 'left', label: 'Left', icon: AlignLeftIcon },
          { value: 'center', label: 'Centre', icon: AlignCenterIcon }]
          } />
        
        </Field>
      }
      {def.supportsEmphasis &&
      <Field id={`${block.id}-emphasis`} label="Emphasis" hint="Featured uses your page’s button colour. Keep it for one or two key actions.">
          <Segmented
          ariaLabel="Emphasis"
          fullWidth
          value={block.style.emphasis}
          onChange={(emphasis) => actions.updateMeta(block.id, { style: { emphasis } })}
          options={[
          { value: 'default', label: 'Standard' },
          { value: 'featured', label: 'Featured' },
          { value: 'subtle', label: 'Subtle' }]
          } />
        
        </Field>
      }
      <Field id={`${block.id}-spacing`} label="Spacing around block">
        <Segmented
          ariaLabel="Spacing"
          fullWidth
          value={block.layout.spacing}
          onChange={(spacing) => actions.updateMeta(block.id, { layout: { spacing } })}
          options={[
          { value: 'tight', label: 'Tight' },
          { value: 'normal', label: 'Normal' },
          { value: 'loose', label: 'Roomy' }]
          } />
        
      </Field>
      {/* Layout sections (D153) */}
      <Field id={`${block.id}-width`} label="Width" hint="Edge to edge suits covers and galleries. Phones always use the full screen.">
        <Segmented
          ariaLabel="Width"
          fullWidth
          value={block.layout.width ?? 'column'}
          onChange={(width) => actions.updateMeta(block.id, { layout: { width } })}
          options={[
          { value: 'column', label: 'Column' },
          { value: 'wide', label: 'Wide' },
          { value: 'full', label: 'Edge to edge' }]
          } />
        
      </Field>
      <Field id={`${block.id}-pair`} label="Sit beside the next block" hint="On tablets and computers. Phones stack them; open Preview to see it.">
        <Segmented
          ariaLabel="Side by side"
          fullWidth
          value={block.layout.pair ?? 'off'}
          onChange={(v) => actions.updateMeta(block.id, { layout: { pair: v === 'off' ? null : v } })}
          options={[
          { value: 'off', label: 'Off' },
          { value: 'equal', label: '1 : 1' },
          { value: 'wide-first', label: '3 : 2' },
          { value: 'narrow-first', label: '2 : 3' }]
          } />
        
      </Field>
      {block.layout.pair &&
      <Field id={`${block.id}-phone`} label="On phones, show this block">
          <Segmented
          ariaLabel="Phone order"
          fullWidth
          value={block.layout.phoneSecond ? 'second' : 'first'}
          onChange={(v) => actions.updateMeta(block.id, { layout: { phoneSecond: v === 'second' } })}
          options={[
          { value: 'first', label: 'First' },
          { value: 'second', label: 'Second' }]
          } />
        
        </Field>
      }
      <Field id={`${block.id}-bg`} label="Section background" hint="Taken from your theme, so it works with any theme.">
        <Segmented
          ariaLabel="Section background"
          fullWidth
          value={block.layout.background ?? 'none'}
          onChange={(background) => actions.updateMeta(block.id, { layout: { background } })}
          options={[
          { value: 'none', label: 'Plain' },
          { value: 'tint', label: 'Tint' },
          { value: 'invert', label: 'Inverted' }]
          } />
        
      </Field>
      <div className="rounded-md border border-line bg-sunken/60 p-3.5">
        <p className="text-label font-medium text-fg">Colours, fonts and button shape</p>
        <p className="mt-0.5 text-caption text-fg-subtle">These come from the page theme, so every block stays consistent.</p>
        <Button variant="secondary" size="sm" leadingIcon={PaletteIcon} className="mt-3" onClick={() => actions.select(null)}>
          Edit page theme
        </Button>
      </div>
    </div>);

}