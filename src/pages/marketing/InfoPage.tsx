import React from 'react';
import { useParams } from 'react-router-dom';
import { findLegalDoc } from '../../data/legal';
import { LegalDocument } from '../../components/legal/LegalDocument';
import { TrustCentre } from './TrustCentre';
import { HelpCentre } from './HelpCentre';
import { Contact } from './Contact';
import { About } from './About';
import { Roadmap } from './Roadmap';
import { ReportAPage } from './ReportAPage';
import { NotFound } from '../NotFound';

const pages: Record<string, () => JSX.Element> = {
  trust: TrustCentre,
  help: HelpCentre,
  contact: Contact,
  about: About,
  roadmap: Roadmap,
  report: ReportAPage
};

/** /about/:topic — legal and policy documents, plus trust, help, contact, about and roadmap (D78). */
export function InfoPage() {
  const { topic = '' } = useParams();
  const Page = pages[topic];
  if (Page) return <Page />;
  const doc = findLegalDoc(topic);
  if (doc) return <LegalDocument key={doc.slug} doc={doc} />;
  return <NotFound embedded />;
}