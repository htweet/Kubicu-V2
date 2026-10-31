/** Endings of the form-setup problems in utils/forms/logic.ts formIssues that quote a field's label. */
const formQuotedIssueSuffixes = [
'has a rule pointing to a deleted field',
'can only depend on a field above it',
'needs at least two options',
'has options without a picture',
'needs at least one product',
'needs words for both ends of the scale',
'needs at least two rows',
'needs at least two items',
'needs at least two answer choices',
'needs a service from Bookings',
'needs at least one answer to add up',
'can only add up answers above it',
'needs an amount'];


/**
 * Sentences built from names, amounts and counts (D341).
 *
 * Many on-screen sentences are assembled in code — "kub.icu/ada is already taken…", "Booked with Gokada · ₦2,500 — …",
 * "Amounts below the ₦500 minimum are hidden" — and some are saved that way (order and delivery timelines, contact
 * activity, automation test runs). A fixed draft can't match them. Instead, when the translator has no draft for a piece
 * of text, it tries these patterns: each one pulls the names and numbers out, looks up a draft for the pattern's key
 * (e.g. "Booked with {partner} · {amount} — delivery code texted to the customer"), and puts the values back in.
 *
 * A pattern is only used when its key has a draft in the current language, so English — and any language still missing
 * that draft — always shows the original sentence untouched. Values listed in `translate` are themselves translated
 * (a stage name, a field label, "the rider"); names and amounts are kept exactly as written.
 */

export interface BuiltPattern {
  re: RegExp;
  key: string;
  names: string[];
  translate?: string[];
  /** Skip the match unless at least one of these values actually translated (for very general shapes). */
  requireTranslated?: string[];
}

type Lookup = (key: string) => string | undefined;

const p = (re: RegExp, key: string, names: string[], translate?: string[], requireTranslated?: string[]): BuiltPattern => ({ re, key, names, translate, requireTranslated });

export const builtPatterns: BuiltPattern[] = [
// ——— Page editor checks ———
p(/^(.+) link isn’t a full URL$/, '{platform} link isn’t a full URL', ['platform']),
p(/^Amounts below the (.+) minimum are hidden$/, 'Amounts below the {amount} minimum are hidden', ['amount']),
p(/^Button label is (\d+) characters — it may wrap on small phones\. Aim for (\d+) or fewer\.$/, 'Button label is {n} characters — it may wrap on small phones. Aim for {max} or fewer.', ['n', 'max']),
p(/^(.+) is too hard to read \(([\d.]+:1)\)\. Publishing is off until it reaches ([\d.]+):1 — try (.+)\.$/, '{name} is too hard to read ({ratio}). Publishing is off until it reaches {min}:1 — try {colour}.', ['name', 'ratio', 'min', 'colour'], ['name']),
p(/^(.+) contrast is ([\d.]+:1) — visitors will see a slightly adjusted shade\. Aim for at least ([\d.]+):1\.$/, '{name} contrast is {ratio} — visitors will see a slightly adjusted shade. Aim for at least {min}:1.', ['name', 'ratio', 'min'], ['name']),
p(/^Change button colour to (#[0-9A-Fa-f]+) with (#[0-9A-Fa-f]+) text → ([\d.]+:1)$/, 'Change button colour to {colour} with {text} text → {ratio}', ['colour', 'text', 'ratio']),
p(/^Change (text colour|secondary text|button text) to (#[0-9A-Fa-f]+) → ([\d.]+:1)$/, 'Change {what} to {colour} → {ratio}', ['what', 'colour', 'ratio'], ['what']),
p(/^kub\.icu\/(\S+) is already taken\. Choose another link in Page settings\.$/, 'kub.icu/{handle} is already taken. Choose another link in Page settings.', ['handle']),
p(/^(.+) isn’t on the safe list\. You can embed links from (.+)\.$/, '{host} isn’t on the safe list. You can embed links from {list}.', ['host', 'list']),
p(/^(.+) Then tick “This video has captions”\. Many people watch on mute, on buses and in shops\.$/, '{how} Then tick “This video has captions”. Many people watch on mute, on buses and in shops.', ['how'], ['how']),

// ——— Forms ———
p(/^Field (\d+) needs a label$/, 'Field {n} needs a label', ['n']),
...formQuotedIssueSuffixes.map((suffix) => p(new RegExp(`^“(.*)” ${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), `“{label}” ${suffix}`, ['label'])),

// ——— Visitor form errors (D344) ———
p(/^Keep it under (\d+) characters$/, 'Keep it under {n} characters', ['n']),
p(/^Answer (.+ and .+?)(…?)$/, 'Answer: {rows}{more}', ['rows', 'more']),

// ——— Automations: test-run steps and setup problems ———
p(/^If order total is over \(₦\) (.+)$/, 'If order total is over (₦) {amount}', ['amount']),
p(/^If contact came from (.+)$/, 'If contact came from {source}', ['source'], ['source']),
p(/^If contact has tag (.+)$/, 'If contact has tag {tag}', ['tag']),
p(/^Preview: (.+) would get “(.*)” in KUBICU — not sent$/, 'Preview: {name} would get “{text}” in KUBICU — not sent', ['name', 'text'], ['name']),
p(/^Preview: follow-up “(.*)” for (.+) — not created$/, 'Preview: follow-up “{text}” for {name} — not created', ['text', 'name'], ['name']),
p(/^AI preview draft: “(.*)” — waits in your notifications for you to approve, edit or discard\. Uses 1 AI credit on live runs\.$/, 'AI preview draft: “{text}” — waits in your notifications for you to approve, edit or discard. Uses 1 AI credit on live runs.', ['text']),
p(/^Preview: “(.*)” for (.+) would arrive in your notifications — not sent$/, 'Preview: “{report}” for {subject} would arrive in your notifications — not sent', ['report', 'subject'], ['report']),
p(/^Preview: POST (\S+) with the (\S+) event, signed with your webhook secret — not called in test runs$/, 'Preview: POST {url} with the {event} event, signed with your webhook secret — not called in test runs', ['url', 'event']),
p(/^Preview: “(.*)” — not sent$/, 'Preview: “{text}” — not sent', ['text']),
p(/^Step (\d+) needs (a tag|a webhook address|a report to send|some text)$/, 'Step {n} needs {what}', ['n', 'what'], ['what']),
p(/^Step (\d+): (.+)$/, 'Step {n}: {problem}', ['n', 'problem'], ['problem'], ['problem']),

// ——— Audience activity, wallet ———
p(/^Assigned to (.+)$/, 'Assigned to {name}', ['name']),
p(/^Moved to (.+)$/, 'Moved to {stage}', ['stage'], ['stage']),
p(/^Task added: (.+)$/, 'Task added: {task}', ['task']),
p(/^Done: (.+)$/, 'Done: {task}', ['task']),
p(/^Commission · (.+)$/, 'Commission · {name}', ['name']),

// ——— Deliveries and order timelines ———
// Amounts can be in any of the shop's currencies (₦, KSh, GH₵, R…), so they're matched loosely (D416).
p(/^Booked with (.+?) · (.+) — delivery code texted to the customer$/, 'Booked with {partner} · {amount} — delivery code texted to the customer', ['partner', 'amount']),
p(/^Booked with (.+) — delivery code texted to the customer$/, 'Booked with {partner} — delivery code texted to the customer', ['partner']),
p(/^Delivery booked with (.+)$/, 'Delivery booked with {partner}', ['partner']),
p(/^Collected by (.+) \((.+)\)$/, 'Collected by {rider} ({partner})', ['rider', 'partner'], ['rider']),
p(/^Delivered by (.+) · code matched$/, 'Delivered by {name} · code matched', ['name']),
p(/^Delivered — code matched and (.+) collected by the rider \((.+)\)$/, 'Delivered — code matched and {amount} collected by the rider ({partner})', ['amount', 'partner']),
p(/^Delivered — customer’s code matched \((.+)\)$/, 'Delivered — customer’s code matched ({partner})', ['partner']),
p(/^(.+) assigned · (.+)$/, '{rider} assigned · {vehicle}', ['rider', 'vehicle'], ['vehicle']),
p(/^(.+) assigned$/, '{rider} assigned', ['rider']),

// ——— Opportunities ———
p(/^(.+) · order (\S+)$/, '{name} · order {ref}', ['name', 'ref'], ['name']),
p(/^(.+) missed their booking$/, '{name} missed their booking', ['name']),
p(/^Was due (.+)$/, 'Was due {date}', ['date']),
p(/^Stage is due on (.+) — send the pay link$/, 'Stage is due on {quote} — send the pay link', ['quote']),
p(/^Instalment (\d+) of (\d+) unpaid after every retry$/, 'Instalment {n} of {total} unpaid after every retry', ['n', 'total']),
p(/^Instalment (\d+) of (\d+) didn’t go through — retrying automatically$/, 'Instalment {n} of {total} didn’t go through — retrying automatically', ['n', 'total']),
p(/^Card failed · ends (.+) unless updated$/, 'Card failed · ends {date} unless updated', ['date']),
p(/^(\d+) runs? failed this week — customers may have missed a message$/, 'Runs failed this week: {n} — customers may have missed a message', ['n']),

// ——— A page name in front of a check from that page ("Menu · Add a headline"). Last: it is the most general. ———
p(/^(.+?) · (.+)$/, '{page} · {message}', ['page', 'message'], ['message'], ['message'])];


const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => k in vars ? vars[k] : m);

/** Returns the sentence in the current language, or undefined when no pattern with a draft matches. */
export function translateBuilt(text: string, lookup: Lookup, depth = 0): string | undefined {
  if (depth > 2 || !text || text.length > 400) return undefined;
  for (const pat of builtPatterns) {
    const m = pat.re.exec(text);
    if (!m) continue;
    const draft = lookup(pat.key);
    if (draft === undefined) continue;
    const vars: Record<string, string> = {};
    const changed = new Set<string>();
    pat.names.forEach((name, i) => {
      const raw = m[i + 1] ?? '';
      if (pat.translate?.includes(name)) {
        const tr = lookup(raw) ?? translateBuilt(raw, lookup, depth + 1);
        if (tr !== undefined && tr !== raw) changed.add(name);
        vars[name] = tr ?? raw;
      } else vars[name] = raw;
    });
    if (pat.requireTranslated && !pat.requireTranslated.some((n) => changed.has(n))) continue;
    return fill(draft, vars);
  }
  return undefined;
}