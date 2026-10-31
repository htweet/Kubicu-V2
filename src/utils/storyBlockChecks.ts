import type { Block } from '../types/page';
import type { ValidationIssue } from './validation';

/** Publish checks for round 1 blocks (D169). Errors only where visitors would be misled or locked out. */
export function storyBlockIssues(blocks: Block[]): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const ids = new Set(blocks.map((b) => b.id));
  const issue = (b: Block, key: string, severity: ValidationIssue['severity'], message: string, field?: string) => out.push({ id: `story:${key}:${b.id}`, blockId: b.id, severity, message, field });
  blocks.forEach((b) => {
    if (b.visibility.hidden) return;
    switch (b.type) {
      case 'beforeAfter':{
          const c = b.content;
          if (!c.beforeUrl || !c.afterUrl) return;
          if (!c.beforeAlt.trim()) issue(b, 'before-alt', 'error', 'Describe the before photo for people using screen readers.', 'beforeAlt');
          if (!c.afterAlt.trim()) issue(b, 'after-alt', 'error', 'Describe the after photo for people using screen readers.', 'afterAlt');
          if (!c.permission) issue(b, 'permission', 'error', 'Confirm you have permission to show these photos.', 'permission');
          return;
        }
      case 'cta':
        if (b.content.primaryLabel.trim() && !b.content.primaryUrl.trim()) issue(b, 'cta-url', 'warning', 'The main button has no link, so it won’t show on the live page.', 'primaryUrl');
        return;
      case 'announcement':
        if (b.content.linkLabel.trim() && !b.content.url.trim()) issue(b, 'ann-url', 'warning', 'Add a link for “' + b.content.linkLabel + '”, or remove the link text.', 'url');
        return;
      case 'contactActions':{
          const c = b.content;
          if (c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) issue(b, 'email', 'error', 'That email address doesn’t look right.', 'email');
          if (c.whatsapp.trim() && c.whatsapp.replace(/\D/g, '').length < 10) issue(b, 'wa', 'warning', 'Add the full WhatsApp number with country code, e.g. +234…', 'whatsapp');
          if (c.website.trim() && !/^https?:\/\//i.test(c.website.trim())) issue(b, 'web', 'warning', 'Start the website with https://', 'website');
          return;
        }
      case 'anchorNav':
        b.content.items.forEach((i) => {
          if (i.blockId && !ids.has(i.blockId)) out.push({ id: `story:anchor:${i.id}`, blockId: b.id, severity: 'warning', message: `“${i.label || 'A jump link'}” points at a block that was removed.` });
        });
        return;
      case 'comparison':
        if (b.content.columns.filter((c) => c.highlight).length > 1) issue(b, 'hl', 'warning', 'More than one option is marked “Most chosen”. Keep it to the one that really is.');
        return;
      case 'policies':
        if (b.content.items.some((i) => i.title.trim() && !i.text.trim())) issue(b, 'empty', 'warning', 'Some policies have a heading but no text, so they’re hidden. Write them or remove them.');
        return;
      case 'delivery':{
          const c = b.content;
          if (c.source === 'own' && c.zones.some((z) => !z.area.trim() && (z.price.trim() || z.time.trim()))) issue(b, 'zone-name', 'warning', 'A delivery area has a price but no name, so it’s hidden. Name it or remove it.');
          if (!c.returns.trim()) issue(b, 'returns', 'warning', 'No returns policy yet. Buyers look for this — write what you actually do, even if it’s “no returns on custom pieces”.', 'returns');
          return;
        }
      // Round 2 (D170)
      case 'carousel':
        if (b.content.slides.some((s) => s.imageUrl && !s.imageAlt.trim())) issue(b, 'alt', 'error', 'Describe every slide photo for people using screen readers.');
        return;
      case 'checkoutButton':{
          const c = b.content;
          if (c.mode === 'checkout' && !c.productId) issue(b, 'product', 'error', 'Choose a product, or switch to a payment link. Without one the button doesn’t show.', 'productId');
          if (c.mode === 'link' && !/^https:\/\//i.test(c.url.trim())) issue(b, 'link', 'error', 'Add a payment link starting with https://', 'url');
          return;
        }
      case 'qrCode':
        if (b.content.target === 'url' && !/^https?:\/\//i.test(b.content.url.trim())) issue(b, 'url', 'error', 'Add the link the QR code should open.', 'url');
        return;
      case 'document':
        if (!b.content.url.trim()) issue(b, 'url', 'warning', 'Add the document link, or the block won’t show.', 'url');
        return;
      case 'community':
        if (!b.content.url.trim()) issue(b, 'url', 'warning', 'Add the invite link, or the block won’t show.', 'url');
        return;
      case 'campaignSpotlight':{
          const c = b.content;
          if (c.startsAt && c.endsAt && Date.parse(c.endsAt) <= Date.parse(c.startsAt)) issue(b, 'range', 'error', 'The campaign ends before it starts.', 'endsAt');else
          if (!c.endsAt) issue(b, 'noend', 'warning', 'No end date, so this spotlight shows until you remove it.', 'endsAt');
          return;
        }
      case 'smartButton':
        if (!b.content.url.trim()) issue(b, 'default', 'warning', 'Set a default link — visitors from other sources see nothing without it.', 'url');
        return;
      // FAQ assistant (D342): it can only ever repeat what the owner wrote.
      case 'faqAssistant':{
          const c = b.content;
          const answered = c.facts.filter((f) => f.question.trim() && f.answer.trim());
          if (answered.length === 0) issue(b, 'facts', 'warning', 'Add at least one approved question and answer, or the block won’t show.', 'facts');else
          if (c.facts.some((f) => f.question.trim() && !f.answer.trim())) issue(b, 'unanswered', 'warning', 'Some questions have no answer, so they’re never used.', 'facts');
          if (!c.fallbackUrl.trim()) issue(b, 'fallback', 'warning', 'Add a link for visitors whose question has no approved answer.', 'fallbackUrl');
          return;
        }
      default:
    }
  });
  return out;
}