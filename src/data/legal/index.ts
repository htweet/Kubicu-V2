import type { LegalDoc } from '../../types/legal';
import { legalDocs } from './legalDocs';
import { policyDocs } from './policyDocs';
import { serviceTermsDocs } from './serviceTermsDocs';

export const allLegalDocs: LegalDoc[] = [...legalDocs, ...policyDocs, ...serviceTermsDocs];

export function findLegalDoc(slug: string): LegalDoc | undefined {
  return allLegalDocs.find((d) => d.slug === slug);
}
