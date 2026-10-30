import React from 'react';
import { AlignCenterIcon, AlignLeftIcon, PaletteIcon } from 'lucide-react';
import type { Block } from '../../../types/page';
import { blockDefinitions } from '../../../data/blockRegistry';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { Button } from '../../ui/Button';
import { InspectorGroup } from './InspectorGroup';
import { LookPicker } from './LookPicker';
import { currentLook, looksFor } from '../../../utils/blockLooks';

const alignable = new Set<Block['type']>(['profile', 'heading', 'text', 'link', 'social']);

const spacingLabel = { tight: 'Tight', normal: 'Normal', loose: 'Roomy' } as const;
const emphasisLabel = { default: 'Standard', featured: 'Featured', subtle: 'Subtle' } as const;
const widthLabel = { column: 'Column', wide: 'Wide', full: 'Edge to edge' } as const;
const bgLabel = { none: 'Plain', tint: 'Tint', invert: 'Inverted' } as const;
const pairLabel = { equal: '1 : 1', 'wide-first': '3 : 2', 'narrow-first': '2 : 3' } as const;

/** Style tab, grouped (D177): Look → Appearance → On the page → Advanced. */
export function StyleFields({ block }: {block: Block;}) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const def = blockDefinitions[block.type];
  const looks = looksFor(block.type);
  const look = looks.length ? currentLook(block, looks) : null;
  const canAlign = alignable.has(block.type);

  const appearanceSummary = [
  canAlign ? block.style.align === 'center' ? tr('Centred') : tr('Left') : null,
  def.supportsEmphasis ? tr(emphasisLabel[block.style.emphasis]) : null,
  tr('{size} spacing', { size: tr(spacingLabel[block.layout.spacing]) })].

  filter(Boolean).
  join(' · ');
  const pageSummary = tr('{width} · {bg} background', { width: tr(widthLabel[block.layout.width ?? 'column']), bg: tr(bgLabel[block.layout.background ?? 'none']) });
  const pair = block.layout.pair;
  const advancedSummary = pair ? tr('Beside the next block, {ratio}', { ratio: pairLabel[pair] }) : tr('Not beside another block');

  return (
    <div className="flex flex-col">
      {looks.length > 0 &&
      <InspectorGroup storeKey="style.look" title={tr('Look')} summary={look ? tr(look.name) : tr('Custom settings')}>
          <LookPicker block={block} options={looks} />
        </InspectorGroup>
      }

      <InspectorGroup storeKey="style.appearance" title={tr('Appearance')} summary={appearanceSummary}>
        {canAlign &&
        <Field id={`${block.id}-align`} label={tr('Alignment')}>
            <Segmented
            ariaLabel={tr('Alignment')}
            value={block.style.align}
            onChange={(align) => actions.updateMeta(block.id, { style: { align } })}
            options={[
            { value: 'left', label: tr('Left'), icon: AlignLeftIcon },
            { value: 'center', label: tr('Centre'), icon: AlignCenterIcon }]
            } />
          
          </Field>
        }
        {def.supportsEmphasis &&
        <Field id={`${block.id}-emphasis`} label={tr('Emphasis')} hint={tr('Featured uses your page’s button colour. Keep it for one or two key actions.')}>
            <Segmented
            ariaLabel={tr('Emphasis')}
            fullWidth
            value={block.style.emphasis}
            onChange={(emphasis) => actions.updateMeta(block.id, { style: { emphasis } })}
            options={[
            { value: 'default', label: tr('Standard') },
            { value: 'featured', label: tr('Featured') },
            { value: 'subtle', label: tr('Subtle') }]
            } />
          
          </Field>
        }
        <Field id={`${block.id}-spacing`} label={tr('Spacing around block')}>
          <Segmented
            ariaLabel={tr('Spacing')}
            fullWidth
            value={block.layout.spacing}
            onChange={(spacing) => actions.updateMeta(block.id, { layout: { spacing } })}
            options={[
            { value: 'tight', label: tr('Tight') },
            { value: 'normal', label: tr('Normal') },
            { value: 'loose', label: tr('Roomy') }]
            } />
          
        </Field>
      </InspectorGroup>

      {/* Layout sections (D153). Blocks inside a container (D167) take width and background from it. */}
      {block.parentId ?
      <InspectorGroup storeKey="style.page" title={tr('On the page')} summary={tr('Set by its container')}>
          <p className="text-caption text-fg-muted">{tr('Width, side-by-side and background come from the container this block is in. Select the container to change them.')}</p>
        </InspectorGroup> :

      <>
          <InspectorGroup storeKey="style.page" title={tr('On the page')} summary={pageSummary}>
            <Field id={`${block.id}-width`} label={tr('Width')} hint={tr('Edge to edge suits covers and galleries. Phones always use the full screen.')}>
              <Segmented
              ariaLabel={tr('Width')}
              fullWidth
              value={block.layout.width ?? 'column'}
              onChange={(width) => actions.updateMeta(block.id, { layout: { width } })}
              options={[
              { value: 'column', label: tr('Column') },
              { value: 'wide', label: tr('Wide') },
              { value: 'full', label: tr('Edge to edge') }]
              } />
            
            </Field>
            <Field id={`${block.id}-bg`} label={tr('Section background')} hint={tr('Taken from your theme, so it works with any theme.')}>
              <Segmented
              ariaLabel={tr('Section background')}
              fullWidth
              value={block.layout.background ?? 'none'}
              onChange={(background) => actions.updateMeta(block.id, { layout: { background } })}
              options={[
              { value: 'none', label: tr('Plain') },
              { value: 'tint', label: tr('Tint') },
              { value: 'invert', label: tr('Inverted') }]
              } />
            
            </Field>
          </InspectorGroup>

          <InspectorGroup storeKey="style.advanced" title={tr('Advanced')} summary={advancedSummary} defaultOpen={false}>
            <Field id={`${block.id}-pair`} label={tr('Sit beside the next block')} hint={tr('On tablets and computers. Phones stack them; open Preview to see it. For more than two, use a Columns block.')}>
              <Segmented
              ariaLabel={tr('Side by side')}
              fullWidth
              value={pair ?? 'off'}
              onChange={(v) => actions.updateMeta(block.id, { layout: { pair: v === 'off' ? null : v } })}
              options={[
              { value: 'off', label: tr('Off') },
              { value: 'equal', label: '1 : 1' },
              { value: 'wide-first', label: '3 : 2' },
              { value: 'narrow-first', label: '2 : 3' }]
              } />
            
            </Field>
            {pair &&
          <Field id={`${block.id}-phone`} label={tr('On phones, show this block')}>
                <Segmented
              ariaLabel={tr('Phone order')}
              fullWidth
              value={block.layout.phoneSecond ? 'second' : 'first'}
              onChange={(v) => actions.updateMeta(block.id, { layout: { phoneSecond: v === 'second' } })}
              options={[
              { value: 'first', label: tr('First') },
              { value: 'second', label: tr('Second') }]
              } />
            
              </Field>
          }
          </InspectorGroup>
        </>
      }

      <div className="mt-2 border-t border-line pt-5">
        <p className="text-label font-medium text-fg">{tr('Colours, fonts and button shape')}</p>
        <p className="mt-0.5 text-caption text-fg-subtle">{tr('These come from the page theme, so every block stays consistent.')}</p>
        <Button variant="secondary" size="sm" leadingIcon={PaletteIcon} className="mt-3" onClick={() => actions.select(null)}>
          {tr('Edit page theme')}
        </Button>
      </div>
    </div>);

}