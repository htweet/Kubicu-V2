import type { Contact, SegmentField, SegmentOp, SegmentRule } from '../../types/ops';
import { consentLabels, sourceLabels, stageLabels } from '../../data/audience';
import { sourceLabels as channelLabels } from '../analytics/track';

/** Segment conditions (D272). Every rule is something the contact record actually holds. */

export interface FieldDef {
  label: string;
  ops: SegmentOp[];
  /** Fixed choices; tag and short link get theirs from the workspace. */
  kind: 'choice' | 'tag' | 'campaign' | 'days' | 'presence';
}

export const fieldDefs: Record<SegmentField, FieldDef> = {
  consent: { label: 'Consent', ops: ['is', 'isNot'], kind: 'choice' },
  source: { label: 'Came from', ops: ['is', 'isNot'], kind: 'choice' },
  tag: { label: 'Tag', ops: ['is', 'isNot'], kind: 'tag' },
  stage: { label: 'Stage', ops: ['is', 'isNot'], kind: 'choice' },
  channel: { label: 'First channel', ops: ['is', 'isNot'], kind: 'choice' },
  campaign: { label: 'Short link', ops: ['is', 'isNot'], kind: 'campaign' },
  added: { label: 'Added', ops: ['within', 'olderThan'], kind: 'days' },
  email: { label: 'Email', ops: ['has', 'missing'], kind: 'presence' },
  phone: { label: 'Phone', ops: ['has', 'missing'], kind: 'presence' }
};

export const opLabels: Record<SegmentOp, string> = {
  is: 'is',
  isNot: 'is not',
  within: 'in the last',
  olderThan: 'more than',
  has: 'is filled in',
  missing: 'is empty'
};

export const dayOptions = ['7', '30', '90', '180', '365'];

export function choiceOptions(field: SegmentField): {value: string;label: string;}[] {
  const map: Record<string, string> =
  field === 'consent' ? consentLabels : field === 'source' ? sourceLabels : field === 'stage' ? stageLabels : field === 'channel' ? channelLabels : {};
  return Object.entries(map).map(([value, label]) => ({ value, label }));
}

export function defaultRule(field: SegmentField, id: string, tags: string[], campaigns: string[]): SegmentRule {
  const def = fieldDefs[field];
  const value =
  def.kind === 'choice' ? choiceOptions(field)[0]?.value ?? '' : def.kind === 'tag' ? tags[0] ?? '' : def.kind === 'campaign' ? campaigns[0] ?? '' : def.kind === 'days' ? '30' : '';
  return { id, field, op: def.ops[0], value };
}

const DAY = 86_400_000;

export function ruleMatches(c: Contact, r: SegmentRule, now = Date.now()): boolean {
  const pick = (): boolean => {
    switch (r.field) {
      case 'consent':
        return c.consent === r.value;
      case 'source':
        return c.sources.includes(r.value as Contact['sources'][number]);
      case 'tag':
        return c.tags.includes(r.value);
      case 'stage':
        return c.stage === r.value;
      case 'channel':
        return c.attribution?.channel === r.value;
      case 'campaign':
        return c.attribution?.campaign === r.value;
      case 'added':{
          const age = now - Date.parse(c.createdAt);
          const days = Number(r.value) * DAY;
          return r.op === 'within' ? age <= days : age > days;
        }
      case 'email':
        return !!c.email.trim();
      case 'phone':
        return !!c.phone.trim();
    }
  };
  if (r.op === 'isNot' || r.op === 'missing') return !pick();
  return pick();
}

export function rulesMatch(c: Contact, rules: SegmentRule[] | undefined, match: 'all' | 'any' = 'all'): boolean {
  if (!rules?.length) return true;
  return match === 'all' ? rules.every((r) => ruleMatches(c, r)) : rules.some((r) => ruleMatches(c, r));
}

/** A rule a value can't satisfy (empty tag/short link) is ignored when saving. */
export const ruleComplete = (r: SegmentRule) => fieldDefs[r.field].kind === 'presence' || !!r.value;

export function describeRule(r: SegmentRule): string {
  const def = fieldDefs[r.field];
  if (def.kind === 'presence') return `${def.label} ${opLabels[r.op]}`;
  if (def.kind === 'days') return `${def.label} ${opLabels[r.op]} ${r.value} days${r.op === 'olderThan' ? ' ago' : ''}`;
  const value = def.kind === 'choice' ? choiceOptions(r.field).find((o) => o.value === r.value)?.label ?? r.value : def.kind === 'campaign' ? `/s/${r.value}` : r.value;
  return `${def.label} ${opLabels[r.op]} ${value}`;
}

export function describeRules(rules: SegmentRule[] | undefined, match: 'all' | 'any' = 'all'): string {
  if (!rules?.length) return '';
  if (rules.length === 1) return describeRule(rules[0]);
  return `${match === 'all' ? 'All of' : 'Any of'}: ${rules.map(describeRule).join(' · ')}`;
}