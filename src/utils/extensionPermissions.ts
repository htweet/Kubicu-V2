/**
 * Groups an extension's plain-language permissions into what it can see and what it can
 * change, and flags the ones that touch customer details or money (D139).
 */
export type PermissionAccess = 'see' | 'change';

export interface ClassifiedPermission {
  text: string;
  access: PermissionAccess;
  /** Touches customers' personal details, money, or your device. */
  sensitive: boolean;
}

const seeVerbs = /^(read|count|see|view|use your monthly)/i;
const sensitiveWords = /(address|phone|contact|audience|customer|wallet|pay|escrow|refund|microphone|message|chat|tracking tag)/i;

export function classifyPermission(text: string): ClassifiedPermission {
  return { text, access: seeVerbs.test(text.trim()) ? 'see' : 'change', sensitive: sensitiveWords.test(text) };
}

export function groupPermissions(list: string[]): { see: ClassifiedPermission[]; change: ClassifiedPermission[] } {
  const all = list.map(classifyPermission);
  return { see: all.filter((p) => p.access === 'see'), change: all.filter((p) => p.access === 'change') };
}
