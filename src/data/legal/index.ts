import type { LegalDoc } from '../../types/legal';
import { legalDocs } from './legalDocs';
import { policyDocs } from './policyDocs';

export const allLegalDocs: LegalDoc[] = [...legalDocs, ...policyDocs];

export function findLegalDoc(slug: string): LegalDoc | undefined {
  return allLegalDocs.find((d) => d.slug === slug);
}