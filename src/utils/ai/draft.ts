import type { Block, PageDocument } from '../../types/page';
import { findExampleById, examplePages } from '../../data/examples';
import { prepareStarter } from '../starterKit';
import { createBlock, blockName } from '../blocks';
import { validateBlock } from '../validation';
import { aboutFrom, pitchFrom, type BriefAnalysis, type BriefAnswers } from './brief';

/** Text that starts like this is a gap for the owner to fill. Publishing is blocked until it's replaced. */
export const PLACEHOLDER = '[Add ';

export function placeholder(what: string): string {
  return `${PLACEHOLDER}${what}]`;
}

export function hasPlaceholder(block: Block): boolean {
  return JSON.stringify(block.content).includes(PLACEHOLDER);
}

export interface DraftResult {
  doc: PageDocument;
  exampleName: string;
  assumptions: string[];
}

export class DraftFailure extends Error {}

/**
 * Builds a draft page from the brief and answers (D63). Layout and look come from a starter;
 * words come from the owner. Prices, reviews, qualifications, delivery promises and policies
 * are never written — they become marked placeholders or hidden blocks instead.
 */
export function buildDraft(brief: string, answers: BriefAnswers, analysis: BriefAnalysis): DraftResult {
  const example = findExampleById(answers.category ?? analysis.exampleId ?? '') ?? examplePages[0];
  const name = (answers.name ?? analysis.name).trim() || 'Your name';
  const city = (answers.city ?? analysis.city).trim();
  const phone = (answers.phone ?? analysis.phone).trim();
  const action = answers.action ?? analysis.suggestedAction;
  const pitch = pitchFrom(brief);
  const about = aboutFrom(brief);
  const assumptions: string[] = [];

  assumptions.push(
    analysis.exampleId && !answers.category ?
    `Used the ${example.category} layout because you mentioned ${analysis.matched.slice(0, 3).map((w) => `“${w}”`).join(', ')}.` :
    `Used the ${example.category} layout you picked.`
  );
  assumptions.push(`Your one-line pitch is your own first sentence${pitch.endsWith('…') ? ', shortened' : ''}.`);

  const prepared = prepareStarter(example.doc, { name, tagline: pitch, location: city, whatsapp: phone });
  let usedAbout = false;
  let faqTouched = false;

  let blocks: Block[] = prepared.doc.blocks.map((block) => {
    if (block.type === 'text') {
      if (!usedAbout && about) {
        usedAbout = true;
        return { ...block, content: { ...block.content, body: about } };
      }
      return { ...block, content: { ...block.content, body: placeholder(`a few lines about ${name} — what you offer and who it’s for`) } };
    }
    if (block.type === 'faq') {
      faqTouched = true;
      return { ...block, content: { ...block.content, items: block.content.items.map((i) => ({ ...i, answer: placeholder('your answer') })) } };
    }
    return block;
  });

  if (usedAbout) assumptions.push('The About text is the rest of your brief, word for word.');
  if (faqTouched) assumptions.push('Kept common questions for this kind of business. Answers are left for you — we don’t guess delivery times, refunds or policies.');

  // The first action the owner chose sits right under the profile.
  const profileAt = Math.max(0, blocks.findIndex((b) => b.type === 'profile'));
  if (action === 'whatsapp' && !blocks.some((b) => b.type === 'whatsapp')) {
    const wa = createBlock('whatsapp');
    blocks.splice(profileAt + 1, 0, { ...wa, content: { ...wa.content, label: 'Chat on WhatsApp', phone, message: `Hi ${name}, I found you on KUBICU.` } });
  }
  if (action === 'link' && answers.link?.trim()) {
    const link = createBlock('link');
    blocks.splice(profileAt + 1, 0, { ...link, content: { ...link.content, label: 'Visit my store', url: answers.link.trim() } });
  }
  if (action === 'whatsapp') assumptions.push(phone ? 'WhatsApp opens a chat with the number you gave.' : 'The WhatsApp button stays hidden until you add your number.');
  if (action === 'booking') assumptions.push('Booking blocks need a service from Bookings before they show.');
  if (action === 'shop') assumptions.push('Product blocks need your own products and prices from Commerce before they show.');

  // Anything that can't publish yet is hidden, never deleted.
  const hidden: string[] = [];
  blocks = blocks.map((block) => {
    if (block.type === 'profile' || block.visibility.hidden) {
      if (block.visibility.hidden) hidden.push(blockName(block));
      return block;
    }
    if (validateBlock(block).some((i) => i.severity === 'error')) {
      hidden.push(blockName(block));
      return { ...block, visibility: { ...block.visibility, hidden: true } };
    }
    return block;
  });
  if (blocks.some((b) => b.type === 'testimonial')) assumptions.push('Testimonials are empty — only add real quotes you have permission to use.');
  if (hidden.length) assumptions.push(`${hidden.length} block${hidden.length === 1 ? ' is' : 's are'} hidden until you add details (prices, links or numbers): ${[...new Set(hidden)].slice(0, 4).join(', ')}.`);
  if (!city) assumptions.push('No location shown — add one on the profile if people visit you.');

  return {
    doc: { ...prepared.doc, blocks, title: name, seo: { title: name, description: pitch } },
    exampleName: `${example.category} · ${example.name}`,
    assumptions
  };
}