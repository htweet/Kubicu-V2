export interface LegalSection {
  id: string;
  title: string;
  /** Plain-language summary shown above the section. */
  summary: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  group: 'Legal' | 'Trust & safety';
  intro: string;
  updated: string;
  version: string;
  sections: LegalSection[];
}