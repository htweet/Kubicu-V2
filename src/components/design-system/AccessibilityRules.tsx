import React from 'react';
import { accessibilityRules } from '../../data/accessibilityRules';

/** The accessibility rules new screens follow, with the shared piece that enforces each (D76). */
export function AccessibilityRules() {
  return (
    <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
      {accessibilityRules.map((r) => (
        <div key={r.id} className="flex flex-col gap-1.5 border-t border-line pt-4">
          <dt className="text-label font-semibold text-fg">{r.title}</dt>
          <dd className="text-label text-fg-muted">{r.rule}</dd>
          <dd className="text-caption text-fg-subtle">{r.use}</dd>
        </div>
      ))}
    </dl>
  );
}
