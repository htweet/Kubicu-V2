import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';

/** The single header link a Card may carry (“All orders →”). */
export function CardLink({ to, children }: {to: string;children: React.ReactNode;}) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 whitespace-nowrap rounded-sm text-label font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      {children} <ArrowRightIcon size={14} aria-hidden />
    </Link>);

}