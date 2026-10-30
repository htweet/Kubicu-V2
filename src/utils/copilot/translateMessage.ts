/**
 * Shows a Copilot chat message in the chosen language (D340).
 *
 * Copilot's engine composes English messages (a lead line + the question + its help line, or sentences with counts and
 * names in them) and stores them in the session. Rather than change what is stored, the screen translates at display time:
 * 1. a whole paragraph, if a draft exists for it (help lines, the greeting, longer explanations);
 * 2. otherwise each line, then each sentence;
 * 3. sentences with numbers or names go through a short list of patterns — used only when that pattern has a draft,
 *    so English (and any language missing a draft) always shows the original sentence untouched.
 * Anything with no draft stays exactly as written — so a person's own typed words are never altered.
 */

type Translate = (key: string, vars?: Record<string, string | number>) => string;
type Vars = Record<string, string | number>;

interface Pattern {
  re: RegExp;
  /** The draft key. The pattern is skipped when this key has no draft. */
  key: string;
  vars: (m: RegExpExecArray, t: Translate) => Vars;
}

const kindPhrases: Record<string, string> = {
  'a business page': 'A business page',
  'a portfolio': 'A portfolio',
  'a creator page': 'A creator page',
  'an online shop': 'An online shop',
  'a service and booking page': 'A service and booking page',
  'an event page': 'An event page',
  'a page': 'A page'
};

const patterns: Pattern[] = [
{ re: /^Lovely — “(.+)”\.$/, key: 'Lovely — “{name}”.', vars: (m) => ({ name: m[1] }) },
{ re: /^Got (\d+) photos?\.$/, key: 'Photos received: {n}.', vars: (m) => ({ n: m[1] }) },
{ re: /^Your first photo is the big picture at the top, and the other (\d+) go in a photo gallery\.$/, key: 'Your first photo is the big picture at the top. The rest go in a photo gallery: {n}.', vars: (m) => ({ n: m[1] }) },
{ re: /^I could only keep (\d+) photos, so the last (\d+) weren’t added — you can add more later in KUBICU\.$/, key: 'I can keep {max} photos at most. Photos not added: {n} — you can add more later in KUBICU.', vars: (m) => ({ max: m[1], n: m[2] }) },
{ re: /^You can send (\d+) more photos? of your work, products, space or you\.$/, key: 'More photos you can send: {n} — of your work, products, space or you.', vars: (m) => ({ n: m[1] }) },
{ re: /^You already have (\d+) photos, the most I can use here — you can add more in KUBICU after you continue\.$/, key: 'You already have the most photos I can use here ({n}) — you can add more in KUBICU after you continue.', vars: (m) => ({ n: m[1] }) },
{ re: /^Got (\d+) items?\.$/, key: 'Items received: {n}.', vars: (m) => ({ n: m[1] }) },
{ re: /^Got (\d+) items? — (\d+) without a price will stay marked to fill in\.$/, key: 'Items received: {n}. Without a price, marked for you to fill in: {u}.', vars: (m) => ({ n: m[1], u: m[2] }) },
{
  re: /^I’ll use (.+) — it suits (.+)\.$/,
  key: 'I’ll use {look} — it suits {kind}.',
  vars: (m, t) => ({ look: t(m[1]), kind: kindPhrases[m[2]] ? t(kindPhrases[m[2]]).toLowerCase() : m[2] })
},
{ re: /^Your draft is ready, (.+)\.$/, key: 'Your draft is ready, {name}.', vars: (m) => ({ name: m[1] }) },
{ re: /^(\d+) details? still needs? filling in before you publish\.$/, key: 'Details still to fill in before you publish: {n}.', vars: (m) => ({ n: m[1] }) },
{ re: /^Sent (\d+) photos?$/, key: 'Photos sent: {n}', vars: (m) => ({ n: m[1] }) },
{ re: /^Items: (\d+) on the list$/, key: 'Items on the list: {n}', vars: (m) => ({ n: m[1] }) }];


const hasDraft = (t: Translate, key: string) => t(key) !== key;

/** A value in a change summary: quoted names stay as typed, fixed labels translate. */
const value = (v: string, t: Translate) => {
  const quoted = /^“(.*)”$/.exec(v);
  if (quoted) return quoted[1] === 'not set' ? t('not set') : v;
  return t(v);
};

/** Change-summary rows: "Look: Warm & natural → Sleek & dark", "WhatsApp number: removed". */
function summaryRow(s: string, t: Translate): string | null {
  const change = /^(Name|Look|Main action): (.+) → (.+)$/.exec(s);
  if (change && hasDraft(t, change[1])) return `${t(change[1])}: ${value(change[2], t)} → ${value(change[3], t)}`;
  const single = /^(WhatsApp number|Location): (.+)$/.exec(s);
  if (single && hasDraft(t, single[1])) return `${t(single[1])}: ${single[2] === 'removed' ? t('removed') : single[2]}`;
  return null;
}

// Split after . ! ? or a closing quote when the next sentence starts with a capital letter or an opening quote.
const SENTENCE = /(?<=[.!?…]|[.!?]”)\s+(?=[A-Z“"‘])/;

function sentence(s: string, t: Translate): string {
  const direct = t(s);
  if (direct !== s) return direct;
  for (const p of patterns) {
    const m = p.re.exec(s);
    if (m) return hasDraft(t, p.key) ? t(p.key, p.vars(m, t)) : s;
  }
  return summaryRow(s, t) ?? s;
}

function line(l: string, t: Translate): string {
  if (!l.trim()) return l;
  const bullet = /^• /.test(l) ? '• ' : '';
  const body = bullet ? l.slice(2) : l;
  const whole = sentence(body, t);
  if (whole !== body) return bullet + whole;
  const parts = body.split(SENTENCE);
  if (parts.length < 2) return l;
  return bullet + parts.map((p) => sentence(p, t)).join(' ');
}

export function translateCopilotText(text: string, t: Translate, lang: string): string {
  if (lang === 'en') return text;
  const whole = t(text);
  if (whole !== text) return whole;
  return text.
  split('\n\n').
  map((para) => {
    const p = t(para);
    if (p !== para) return p;
    return para.
    split('\n').
    map((l) => line(l, t)).
    join('\n');
  }).
  join('\n\n');
}