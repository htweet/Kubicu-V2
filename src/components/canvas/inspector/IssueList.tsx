import React from 'react';
import { AlertCircleIcon, AlertTriangleIcon } from 'lucide-react';
import type { ValidationIssue } from '../../../utils/validation';
import { cn } from '../../../utils/cn';

export function IssueList({ issues, className }: {issues: ValidationIssue[];className?: string;}) {
  if (issues.length === 0) return null;
  return (
    <ul className={cn('flex flex-col gap-1.5', className)} aria-label="Things to fix">
      {issues.map((issue) => {
        const error = issue.severity === 'error';
        const Icon = error ? AlertCircleIcon : AlertTriangleIcon;
        return (
          <li
            key={issue.id}
            className={cn('flex items-start gap-2 rounded-sm px-2.5 py-2 text-caption', error ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>
            
            <Icon size={13} className="mt-px shrink-0" aria-hidden />
            <span>
              <span className="sr-only">{error ? 'Must fix: ' : 'Worth checking: '}</span>
              {issue.message}
            </span>
          </li>);

      })}
    </ul>);

}