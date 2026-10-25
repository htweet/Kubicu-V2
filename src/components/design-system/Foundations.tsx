import React from 'react';
import { DsLabel } from './DsSection';

const typeScale = [
{ token: 'display', cls: 'font-display text-display font-semibold', size: '40 / 1.1 · Inter Semibold', sample: 'Your whole business' },
{ token: 'title', cls: 'font-display text-title font-semibold', size: '28 / 1.2 · Inter Semibold', sample: 'My Spaces' },
{ token: 'heading', cls: 'text-heading font-semibold', size: '17 / 1.4', sample: 'Version history' },
{ token: 'body', cls: 'text-body', size: '15 / 1.55', sample: 'Changes appear on the canvas as you type.' },
{ token: 'label', cls: 'text-label font-medium', size: '13 / 1.35', sample: 'Button label' },
{ token: 'caption', cls: 'text-caption text-fg-muted', size: '12 / 1.4', sample: 'Read aloud by screen readers.' },
{ token: 'meta', cls: 'text-meta text-fg-subtle', size: '11 / 1.3', sample: 'Updated 2 min ago' }];


const spacing = [4, 8, 12, 16, 24, 32, 48, 64];

export function Foundations() {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div>
        <DsLabel>Type scale — Inter for interface, display face per direction</DsLabel>
        <ul className="flex flex-col divide-y divide-line">
          {typeScale.map((t) =>
          <li key={t.token} className="flex items-baseline gap-4 py-3">
              <span className="w-16 shrink-0 font-mono text-caption text-fg-subtle">{t.token}</span>
              <span className={`min-w-0 flex-1 truncate text-fg ${t.cls}`}>{t.sample}</span>
              <span className="hidden shrink-0 font-mono text-caption text-fg-subtle sm:block">{t.size}</span>
            </li>
          )}
        </ul>
      </div>
      <div className="flex flex-col gap-8">
        <div>
          <DsLabel>Spacing — 4/8 scale</DsLabel>
          <ul className="flex flex-col gap-2">
            {spacing.map((s) =>
            <li key={s} className="flex items-center gap-3">
                <span className="w-8 font-mono text-caption text-fg-subtle">{s}</span>
                <span className="h-2.5 rounded-[2px] bg-action" style={{ width: s * 2 }} aria-hidden />
              </li>
            )}
          </ul>
        </div>
        <div>
          <DsLabel>Radius & elevation</DsLabel>
          <div className="flex flex-wrap gap-4">
            {[
            { label: 'sm · 6', cls: 'rounded-sm' },
            { label: 'md · 10', cls: 'rounded-md' },
            { label: 'lg · 16', cls: 'rounded-lg' },
            { label: 'pill', cls: 'rounded-full' }].
            map((r) =>
            <div key={r.label} className="flex flex-col items-center gap-1.5">
                <span className={`h-12 w-12 border border-line-strong bg-sunken ${r.cls}`} aria-hidden />
                <span className="font-mono text-meta text-fg-subtle">{r.label}</span>
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-4">
            {['shadow-1', 'shadow-2', 'shadow-3'].map((s) =>
            <div key={s} className="flex flex-col items-center gap-1.5">
                <span className={`h-12 w-16 rounded-md bg-overlay ${s}`} aria-hidden />
                <span className="font-mono text-meta text-fg-subtle">{s}</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-caption text-fg-subtle">Shadows only on floating layers: toolbars, menus, sheets, dialogs.</p>
        </div>
        <div>
          <DsLabel>Motion</DsLabel>
          <p className="text-label text-fg-muted">
            120–260ms, <span className="font-mono text-caption">cubic-bezier(0.23, 1, 0.32, 1)</span>. Enter from 0.96 scale. No motion on keyboard-triggered actions. Reduced-motion honoured globally.
          </p>
        </div>
      </div>
    </div>);

}