import type { Block, PageDocument, PageTheme } from '../types/page';
import type { WorkspacePlan } from '../types/plan';
import { CONTRAST_MIN_PUBLISH, CONTRAST_TARGET, contrastRatio, formatRatio } from './contrast';
import { contrastCopy, suggestContrastFix, type ContrastKey } from './contrastFixes';
import { parseEmbed } from './embeds';
import { formatNgn } from './format';
import { socialPlatformLabels } from '../data/socialPlatforms';

export type IssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  id: string;
  blockId: string | null;
  severity: IssueSeverity;
  message: string;
  field?: string;
  /** Plain-language explanation of why it matters and how to improve it. */
  guidance?: string;
  /** A one-tap suggested theme change. */
  fix?: {label: string;description: string;theme: Partial<PageTheme>;};
  /** Which page of the site the block is on (null/undefined = home). */
  pageId?: string | null;
  /** A plan limit causes this; offer an upgrade to this plan. */
  upgradeTo?: WorkspacePlan;
  /** What the upgrade unlocks, in a few words (“Checkout on your page”). */
  upgradeFeature?: string;
}

export function isValidUrl(value: string): boolean {
  return /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return /^\+?[0-9][0-9\s-]{9,16}$/.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function validateBlock(block: Block): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (severity: IssueSeverity, message: string, field: string) => {
    const base = `${block.id}:${field}`;
    const n = issues.filter((i) => i.id === base || i.id.startsWith(`${base}#`)).length;
    issues.push({ id: n ? `${base}#${n}` : base, blockId: block.id, severity, message, field });
  };

  switch (block.type) {
    case 'profile':
      if (!block.content.name.trim()) push('error', 'Add a name for your profile', 'name');
      if (block.content.avatarUrl && !block.content.avatarAlt.trim())
      push('warning', 'Describe the profile photo for screen readers', 'avatarAlt');
      break;
    case 'heading':
      if (!block.content.text.trim()) push('error', 'This heading is empty', 'text');
      break;
    case 'text':
      if (!block.content.body.trim()) push('warning', 'This text block is empty', 'body');
      break;
    case 'link':
      if (!block.content.label.trim()) push('error', 'Add a button label', 'label');
      if (!block.content.url.trim()) push('error', 'Add a destination URL', 'url');else
      if (!isValidUrl(block.content.url)) push('error', 'Destination must be a full link starting with https://', 'url');
      break;
    case 'social':
      if (block.content.items.length === 0) push('warning', 'Add at least one social profile', 'items');
      block.content.items.forEach((item) => {
        if (!isValidUrl(item.url))
        push('error', `${socialPlatformLabels[item.platform]} link isn’t a full URL`, `item:${item.id}`);
      });
      break;
    case 'image':
      if (!block.content.url.trim()) push('error', 'Choose an image', 'url');else
      if (!block.content.decorative && !block.content.alt.trim())
      push('warning', 'Describe this image for screen readers, or mark it as decorative', 'alt');
      break;
    case 'video':
      if (!block.content.url.trim()) push('error', 'Paste a link to embed', 'url');else
      {
        const r = parseEmbed(block.content.url);
        if (!r.ok) push('error', r.reason, 'url');else
        if (r.kind === 'video' && !block.content.captioned) push('warning', 'Not marked as captioned — check the video has captions', 'captioned');
      }
      break;
    case 'contact':{
        const c = block.content;
        if (!c.phone && !c.email && !c.address && !c.hours) push('warning', 'Add at least one contact detail', 'phone');
        if (c.phone && !isValidPhone(c.phone)) push('error', 'Phone number looks incomplete', 'phone');
        if (c.email && !isValidEmail(c.email)) push('error', 'Email address looks incomplete', 'email');
        break;
      }
    case 'faq':
      if (block.content.items.length === 0) push('warning', 'Add at least one question', 'items');else
      if (block.content.items.some((i) => !i.question.trim() || !i.answer.trim()))
      push('warning', 'Some questions are missing a question or an answer — visitors only see answered questions', 'items');
      break;
    case 'leadForm':{
        const f = block.content.fields;
        if (!f.name && !f.email && !f.phone && !f.message) push('error', 'Turn on at least one form field', 'fields');
        if (!block.content.consentText.trim())
        push('warning', 'Add a consent note explaining how you’ll use people’s details', 'consentText');
        break;
      }
    case 'product':{
        const p = block.content;
        // Catalogue-linked products are checked against Commerce (utils/commerce/linkIssues).
        if (p.source !== 'catalog') {
          if (!p.name.trim()) push('error', 'Add a product name', 'name');
          if (p.priceNgn === null) push('warning', 'No price set — visitors will see “Price on request”', 'priceNgn');
          if (!p.imageUrl.trim()) push('warning', 'Add a product photo', 'imageUrl');else
          if (!p.imageAlt.trim()) push('warning', 'Describe the product photo for screen readers', 'imageAlt');
          if (p.ctaAction === 'checkout') push('error', 'Checkout needs a product from Commerce — link one or choose WhatsApp', 'ctaAction');
        }
        if (p.ctaAction === 'whatsapp' && !isValidPhone(p.whatsappPhone))
        push('error', 'Add the WhatsApp number orders should go to', 'whatsappPhone');
        if (p.ctaAction === 'link' && !isValidUrl(p.url)) push('error', 'Add a full link for the order button', 'url');
        break;
      }
    case 'booking':
      if (block.content.source === 'catalog') break;
      if (!block.content.title.trim()) push('error', 'Add a service name', 'title');
      if (!isValidUrl(block.content.url)) push('error', 'Add a full link to where people book', 'url');
      break;
    case 'whatsapp':
      if (!isValidPhone(block.content.phone))
      push('error', 'Add a WhatsApp number with country code, e.g. +234…', 'phone');
      break;
    case 'newsletter':
      if (!block.content.consentText.trim())
      push('warning', 'Add a consent note so subscribers know what they’re signing up for', 'consentText');
      break;
    case 'gallery':{
        const imgs = block.content.images;
        if (imgs.length === 0) push('warning', 'Add at least one photo', 'images');
        if (imgs.length > 12) push('error', 'A gallery can hold up to 12 photos — remove some to keep the page fast', 'images');
        if (imgs.some((i) => i.url && !i.alt.trim())) push('warning', 'Describe every photo for screen readers', 'images');
        break;
      }
    case 'productGrid':{
        const c = block.content;
        if (c.source === 'catalog') {
          if (c.orderAction === 'whatsapp' && !isValidPhone(c.whatsappPhone)) push('error', 'Add the WhatsApp number orders should go to', 'whatsappPhone');
          if (c.orderAction === 'link') push('error', 'Linked products order through checkout or WhatsApp', 'orderAction');
          break;
        }
        if (c.orderAction === 'checkout') push('error', 'Checkout needs products from Commerce', 'orderAction');
        const named = c.items.filter((i) => i.name.trim());
        if (named.length === 0) push('error', 'Add at least one product name', 'items');
        if (c.items.length > 12) push('error', 'Up to 12 products per grid', 'items');
        if (named.some((i) => i.priceNgn === null)) push('warning', 'Some products have no price — they’ll show “Price on request”', 'items');
        if (named.some((i) => i.imageUrl && !i.imageAlt.trim())) push('warning', 'Describe each product photo for screen readers', 'items');
        if (c.orderAction === 'whatsapp' && !isValidPhone(c.whatsappPhone)) push('error', 'Add the WhatsApp number orders should go to', 'whatsappPhone');
        if (c.orderAction === 'link' && named.some((i) => !i.soldOut && !isValidUrl(i.url))) push('error', 'Every available product needs a full order link', 'items');
        break;
      }
    case 'menu':{
        const c = block.content;
        if (!c.categories.some((cat) => cat.items.some((i) => i.name.trim()))) push('error', 'Add at least one menu item', 'categories');
        if (c.orderingOpen && c.whatsappPhone && !isValidPhone(c.whatsappPhone)) push('error', 'WhatsApp number needs a country code, e.g. +234…', 'whatsappPhone');
        if (c.orderingOpen && !c.whatsappPhone) push('warning', 'Add a WhatsApp number so people can order', 'whatsappPhone');
        break;
      }
    case 'pricing':{
        const pk = block.content.packages.filter((p) => p.name.trim());
        if (pk.length === 0) push('error', 'Add at least one package', 'packages');
        if (block.content.packages.length > 3) push('warning', 'More than three packages is hard to compare on a phone', 'packages');
        if (pk.some((p) => p.url && !isValidUrl(p.url))) push('error', 'Package links must start with https://', 'packages');
        if (pk.some((p) => !p.url && !p.serviceId)) push('warning', 'Some package buttons have no link or service yet', 'packages');
        break;
      }
    case 'subscription':{
        const c = block.content;
        if (c.planIds.length === 0) push('error', 'Choose at least one plan from Commerce → Subscriptions', 'planIds');
        if (c.planIds.length > 3) push('warning', 'More than three plans is hard to compare on a phone', 'planIds');
        if (!c.ctaLabel.trim()) push('warning', 'Add a button label', 'ctaLabel');
        break;
      }
    case 'form':{
        // Missing/closed forms and the add-on itself are checked in utils/forms/linkIssues.
        if (!block.content.formId) push('error', 'Choose a form from Forms', 'formId');
        break;
      }
    case 'proof':{
        // Contents come from Proof of work; an empty block simply doesn't show to visitors.
        if (block.content.limit < 1) push('error', 'Show at least one item', 'limit');
        break;
      }
    case 'membersOnly':{
        // Plans and the Pro plan are checked against Commerce in catalogLinkIssues.
        const c = block.content;
        if (c.access === 'plans' && c.planIds.length === 0) push('error', 'Choose which plans can see it, or switch to Any subscriber', 'planIds');
        if (!c.joinLabel.trim()) push('warning', 'Add a label for the join button', 'joinLabel');
        break;
      }
    case 'trustBadge':
      break;
    case 'testimonial':{
        const c = block.content;
        if (!c.quote.trim()) push('error', 'Add the customer’s words', 'quote');
        if (!c.name.trim()) push('error', 'Add who said it', 'name');
        if (!c.permission) push('error', 'Confirm you have permission to publish this quote — it stays hidden until you do', 'permission');
        break;
      }
    case 'event':{
        const c = block.content;
        // Linked events are checked against Commerce instead (linkIssues).
        if (c.source === 'catalog') break;
        if (!c.title.trim()) push('error', 'Add the event name', 'title');
        if (!c.startsAt) push('error', 'Set the date and start time', 'startsAt');
        if (c.startsAt && c.endsAt && Date.parse(c.endsAt) <= Date.parse(c.startsAt)) push('error', 'End time must be after the start', 'endsAt');
        if (!c.soldOut && !isValidUrl(c.ticketUrl)) push('error', 'Add a full link to where people get tickets', 'ticketUrl');
        if (!c.venue.trim()) push('warning', 'Add the venue so people know where to go', 'venue');
        break;
      }
    case 'countdown':{
        const c = block.content;
        if (!c.target) push('error', 'Set the real date this counts down to', 'target');else
        if (Date.parse(c.target) < Date.now()) push('warning', 'This date has passed — visitors see your ended message', 'target');
        if (c.linkLabel && !isValidUrl(c.url)) push('error', 'Add a full link for the button, or clear its label', 'url');
        break;
      }
    case 'download':{
        const c = block.content;
        if (c.source === 'catalog') break;
        if (!c.title.trim()) push('error', 'Add a title for the file', 'title');
        if (!isValidUrl(c.url)) push('error', c.access === 'paid' ? 'Add the link to your payment page' : 'Add a full link to the file', 'url');
        if (c.access === 'paid' && c.priceNgn === null) push('warning', 'Add the price so buyers know before they tap', 'priceNgn');
        break;
      }
    case 'portfolio':{
        const items = block.content.items.filter((i) => i.title.trim());
        if (items.length === 0) push('error', 'Add at least one project', 'items');
        if (items.some((i) => i.coverUrl && !i.coverAlt.trim())) push('warning', 'Describe each cover image for screen readers', 'items');
        if (items.some((i) => i.url && !isValidUrl(i.url))) push('error', 'Project links must start with https://', 'items');
        break;
      }
    case 'audio':{
        const c = block.content;
        if (!c.url.trim()) push('error', 'Add an audio link or upload a track', 'url');else
        if (!c.url.startsWith('data:') && !isValidUrl(c.url)) push('error', 'The audio link must start with https://', 'url');
        if (c.coverUrl && !c.coverAlt.trim()) push('warning', 'Describe the cover image for screen readers', 'coverAlt');
        if (c.url && !c.transcript.trim()) push('warning', 'Add a transcript or short description so deaf visitors can follow', 'transcript');
        break;
      }
    case 'playlist':{
        const tracks = block.content.tracks.filter((t) => t.url.trim());
        if (tracks.length === 0) push('error', 'Add at least one track with an audio link', 'tracks');
        if (tracks.some((t) => !t.title.trim())) push('warning', 'Give every track a title', 'tracks');
        if (tracks.some((t) => !t.url.startsWith('data:') && !isValidUrl(t.url))) push('error', 'Track links must start with https://', 'tracks');
        if (block.content.coverUrl && !block.content.coverAlt.trim()) push('warning', 'Describe the cover image for screen readers', 'coverAlt');
        break;
      }
    case 'collection':
      if (!block.content.collectionId) push('error', 'Choose a collection', 'collectionId');
      break;
    case 'support':{
        const c = block.content;
        if (!c.linkId) push('error', 'The payment link for this block isn’t set up yet — open the block once to create it', 'amounts');
        if (c.amounts.length === 0 && !c.allowOther) push('error', 'Add an amount or allow “Other amount”', 'amounts');
        if (c.amounts.some((a) => a < c.minNgn)) push('warning', `Amounts below the ${formatNgn(c.minNgn)} minimum are hidden`, 'amounts');
        break;
      }
    case 'location':{
        const c = block.content;
        if (!c.address.trim()) push('error', 'Add the address', 'address');
        if (c.hours.some((h) => !h.closed && h.close <= h.open)) push('error', 'Closing time must be after opening time', 'hours');
        break;
      }
    // ——— Layout & showcase (D153) ———
    case 'hero':{
        const c = block.content;
        if (!c.title.trim()) push('error', 'Add a headline', 'title');
        if (c.imageUrl && !c.imageAlt.trim()) push('warning', 'Describe the photo for screen readers', 'imageAlt');
        if ((c.variant === 'cover' || c.variant === 'product') && !c.imageUrl) push('warning', 'This layout is designed around a photo — add one', 'imageUrl');
        if (c.primaryLabel && c.primaryUrl && !c.primaryUrl.startsWith('#') && !isValidUrl(c.primaryUrl)) push('error', 'Main button link must start with https:// or #', 'primaryUrl');
        break;
      }
    case 'featureGrid':
      if (block.content.items.filter((i) => i.title.trim()).length < 2) push('warning', 'A grid reads best with at least two items', 'items');
      if (block.content.items.some((i) => i.imageUrl && !i.imageAlt.trim())) push('warning', 'Describe each photo for screen readers', 'items');
      break;
    case 'steps':
      if (block.content.items.filter((i) => i.title.trim()).length < 2) push('warning', 'Add at least two steps', 'items');
      break;
    case 'logoStrip':
      if (block.content.items.length && !block.content.permission) push('warning', 'Hidden on your live page until you confirm you have permission to show these names', 'permission');
      break;
    case 'figures':
      if (!block.content.confirmed) push('warning', 'Visitors see “Example figures” until you confirm these are real', 'confirmed');
      break;
    case 'mediaList':
      if (block.content.items.filter((i) => i.title.trim()).length === 0) push('error', 'Add at least one item', 'items');
      break;
    case 'listings':
      if (block.content.items.some((i) => i.example)) push('warning', 'Some listings are still examples — replace them with your own', 'items');
      if (block.content.items.some((i) => i.imageUrl && !i.imageAlt.trim())) push('warning', 'Describe each listing photo for screen readers', 'items');
      break;
    default:
      break;
  }

  // Layout sections (D153): a block paired with nothing has no partner to sit beside.
  if (block.layout.pair && block.visibility.hidden) push('warning', 'This block is hidden, so its side-by-side partner shows on its own', 'pair');

  // Responsive: button labels this long wrap to two lines on a 360px phone.
  const label = buttonLabelOf(block);
  if (label && label.trim().length > BUTTON_LABEL_MAX)
  push('warning', `Button label is ${label.trim().length} characters — it may wrap on small phones. Aim for ${BUTTON_LABEL_MAX} or fewer.`, labelFieldOf(block));

  // Scheduling: the window must make sense.
  const { showFrom, showUntil } = block.visibility;
  if (showFrom && showUntil && Date.parse(showUntil) <= Date.parse(showFrom))
  push('error', 'The “hide after” time must be later than the “show from” time', 'showUntil');else
  if (showUntil && Date.parse(showUntil) <= Date.now() && !block.visibility.hidden)
  push('warning', 'This block’s schedule has ended, so visitors no longer see it', 'showUntil');

  return issues;
}

const BUTTON_LABEL_MAX = 32;

function buttonLabelOf(block: Block): string | null {
  switch (block.type) {
    case 'link':
      return block.content.label;
    case 'whatsapp':
      return block.content.label;
    case 'product':
    case 'booking':
      return block.content.ctaLabel;
    case 'leadForm':
      return block.content.submitLabel;
    case 'newsletter':
      return block.content.buttonLabel;
    case 'event':
    case 'download':
    case 'productGrid':
      return block.content.ctaLabel;
    default:
      return null;
  }
}

function labelFieldOf(block: Block): string {
  switch (block.type) {
    case 'product':
    case 'booking':
    case 'event':
    case 'download':
    case 'productGrid':
      return 'ctaLabel';
    case 'leadForm':
      return 'submitLabel';
    case 'newsletter':
      return 'buttonLabel';
    default:
      return 'label';
  }
}

export interface ThemeContrast {
  text: number;
  muted: number;
  button: number;
}

export function themeContrast(theme: PageTheme): ThemeContrast {
  // Signature themes (D161): text is checked against the worst colour the atmosphere can put behind it,
  // and button text against both ends of a gradient action — not just the flat colours.
  const grounds = [theme.background, ...(theme.material?.backdropStops ?? [])];
  const worst = (fg: string) => Math.min(...grounds.map((g) => contrastRatio(fg, g)));
  const m = theme.material;
  const actionStops = m && (m.buttonFinish === 'gradient' || m.buttonFinish === 'gloss') ? [theme.accent, m.secondary ?? theme.accent] : [theme.accent];
  return {
    text: worst(theme.text),
    muted: worst(theme.mutedText),
    button: Math.min(...actionStops.map((s) => contrastRatio(theme.accentText, s)))
  };
}

export function validateTheme(theme: PageTheme): ValidationIssue[] {
  const c = themeContrast(theme);
  const checks: {key: ContrastKey;ratio: number;field: keyof PageTheme;}[] = [
  { key: 'text', ratio: c.text, field: 'text' },
  { key: 'muted', ratio: c.muted, field: 'mutedText' },
  { key: 'button', ratio: c.button, field: 'accentText' }];

  const issues: ValidationIssue[] = [];
  checks.forEach(({ key, ratio, field }) => {
    if (ratio >= CONTRAST_TARGET) return;
    // D108: below 3:1 blocks publishing; 3–4.5:1 warns (live pages still nudge to a readable shade, D76).
    const veryLow = ratio < CONTRAST_MIN_PUBLISH;
    const { name, guidance } = contrastCopy[key];
    const fix = suggestContrastFix(theme, key);
    issues.push({
      id: `theme:${key}`,
      blockId: null,
      severity: veryLow ? 'error' : 'warning',
      message: veryLow ?
      `${name} is too hard to read (${formatRatio(ratio)}). Publishing is off until it reaches ${CONTRAST_MIN_PUBLISH}:1 — try ${fix.label.replace('Use ', '')}.` :
      `${name} contrast is ${formatRatio(ratio)} — visitors will see a slightly adjusted shade. Aim for at least ${CONTRAST_TARGET}:1.`,
      field,
      guidance,
      fix: { label: fix.label, description: `${fix.description} → ${formatRatio(fix.ratio)}`, theme: fix.theme }
    });
  });
  return issues;
}

export function validateDocument(doc: PageDocument, takenHandles?: ReadonlySet<string>): ValidationIssue[] {
  const visible = doc.blocks.filter((b) => !b.visibility.hidden);
  const issues: ValidationIssue[] = [];
  if (visible.length === 0)
  issues.push({ id: 'page:empty', blockId: null, severity: 'error', message: 'Your page has no visible blocks yet' });
  if (!/^[a-z0-9-]{3,30}$/.test(doc.handle))
  issues.push({
    id: 'page:handle',
    blockId: null,
    severity: 'error',
    message: 'Page handle must be 3–30 lowercase letters, numbers or hyphens'
  });else
  if (takenHandles?.has(doc.handle))
  issues.push({
    id: 'page:handle',
    blockId: null,
    severity: 'error',
    message: `kub.icu/${doc.handle} is already taken. Choose another link in Page settings.`
  });
  return [...issues, ...visible.flatMap(validateBlock), ...validateTheme(doc.theme)];
}

export function issuesByBlock(issues: ValidationIssue[]): Record<string, ValidationIssue[]> {
  return issues.reduce<Record<string, ValidationIssue[]>>((acc, issue) => {
    if (!issue.blockId) return acc;
    (acc[issue.blockId] ??= []).push(issue);
    return acc;
  }, {});
}