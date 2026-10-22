import type { Block, PageDocument } from '../types/page';
import type { OnboardingState } from '../hooks/useOnboarding';
import { findExampleById } from '../data/examples';
import { blankTemplateDoc } from '../data/templates';
import { firstActions } from '../data/onboarding';
import { createBlock } from './blocks';
import { prepareStarter, type HiddenStarterBlock } from './starterKit';

export interface BuiltOnboardingPage {
  doc: PageDocument;
  hidden: HiddenStarterBlock[];
  /** Visible items without a price, which show "Price on request". */
  unpricedCount: number;
}

function actionBlock(state: OnboardingState): Block | null {
  const label = state.actionLabel.trim() || firstActions.find((a) => a.id === state.actionType)?.defaultLabel || '';
  const value = state.actionValue.trim();
  switch (state.actionType) {
    case 'whatsapp':{
        const b = createBlock('whatsapp');
        return { ...b, style: { ...b.style, emphasis: 'featured' }, content: { label, phone: value, message: `Hello ${state.name.trim() || 'there'}, I found you on KUBICU and I’d like to…` } };
      }
    case 'booking':{
        const b = createBlock('booking');
        return { ...b, content: { ...b.content, title: label, ctaLabel: 'Pick a time', url: value } };
      }
    case 'link':{
        const b = createBlock('link');
        return { ...b, style: { ...b.style, emphasis: 'featured' }, content: { label, url: value, description: '' } };
      }
    case 'form':{
        const b = createBlock('leadForm');
        return { ...b, content: { ...b.content, title: label } };
      }
    default:
      return null;
  }
}

function countUnpriced(blocks: Block[]): number {
  return blocks.
  filter((b) => !b.visibility.hidden).
  reduce((n, b) => {
    if (b.type === 'product') return n + (b.content.priceNgn === null ? 1 : 0);
    if (b.type === 'productGrid') return n + b.content.items.filter((i) => i.priceNgn === null).length;
    if (b.type === 'menu') return n + b.content.categories.flatMap((c) => c.items).filter((i) => i.priceNgn === null).length;
    if (b.type === 'pricing') return n + b.content.packages.filter((p) => p.priceNgn === null).length;
    return n;
  }, 0);
}

/** Builds the new page from the onboarding answers. Pure, so the live preview can call it on every change. */
export function buildOnboardingPage(state: OnboardingState): BuiltOnboardingPage {
  const kit = state.kitId && state.kitId !== 'blank' ? findExampleById(state.kitId)?.doc : undefined;
  const name = state.name.trim() || 'Your name';
  const { doc, hidden } = prepareStarter(kit ?? blankTemplateDoc, {
    name,
    tagline: state.bio,
    avatarUrl: state.avatarUrl,
    location: state.city,
    whatsapp: state.actionType === 'whatsapp' ? state.actionValue : ''
  });

  const action = actionBlock(state);
  const blocks = [...doc.blocks];
  if (action) {
    const profileIndex = blocks.findIndex((b) => b.type === 'profile');
    blocks.splice(profileIndex + 1, 0, action);
  }

  return {
    doc: { ...doc, blocks, handle: state.handle, title: name, seo: { title: name, description: state.bio.trim() } },
    hidden,
    unpricedCount: countUnpriced(blocks)
  };
}