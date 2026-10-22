import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileTextIcon } from 'lucide-react';
import { legalTopics } from '../../data/marketing';
import { NotFound } from '../NotFound';

/** Help, contact and legal pages: the routes and structure exist, the final text needs legal review. */
export function ComingSoon() {
  const { topic = '' } = useParams();
  const info = legalTopics[topic];
  if (!info) return <NotFound embedded />;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-24 pt-16 md:px-8">
      <FileTextIcon size={22} className="text-fg-subtle" aria-hidden />
      <h1 className="mt-4 font-display text-[34px] font-semibold leading-tight tracking-[-0.026em] text-fg">{info.title}</h1>
      <p className="mt-4 text-body text-fg-muted">{info.summary}</p>
      <div className="mt-10 border-t border-line pt-6">
        <p className="text-label text-fg-muted">
          <span className="font-semibold text-fg">This page is being written.</span> Final wording needs legal and founder review before launch, so we haven’t published placeholder text here.
        </p>
        <Link to="/" className="mt-6 inline-block text-label font-semibold text-action hover:underline">
          Back to home
        </Link>
      </div>
    </div>);

}