import React from 'react';
import { DsLabel } from './DsSection';

interface Token {
  name: string;
  variable: string;
  textOn?: string;
}

const groups: {title: string;tokens: Token[];}[] = [
{
  title: 'Surfaces',
  tokens: [
  { name: 'surface.canvas', variable: '--canvas' },
  { name: 'surface.raised', variable: '--raised' },
  { name: 'surface.sunken', variable: '--sunken' },
  { name: 'surface.stage', variable: '--stage' },
  { name: 'surface.inverse', variable: '--inverse', textOn: '--text-inverse' }]

},
{
  title: 'Text & borders',
  tokens: [
  { name: 'text.primary', variable: '--text-primary', textOn: '--canvas' },
  { name: 'text.secondary', variable: '--text-secondary', textOn: '--canvas' },
  { name: 'text.muted', variable: '--text-muted', textOn: '--canvas' },
  { name: 'border.subtle', variable: '--border-subtle' },
  { name: 'border.strong', variable: '--border-strong' }]

},
{
  title: 'Action & selection',
  tokens: [
  { name: 'action.primary', variable: '--action', textOn: '--on-action' },
  { name: 'action.hover', variable: '--action-hover', textOn: '--on-action' },
  { name: 'action.soft', variable: '--action-soft' },
  { name: 'accent', variable: '--accent', textOn: '--raised' },
  { name: 'selection', variable: '--select', textOn: '--on-select' }]

},
{
  title: 'Status',
  tokens: [
  { name: 'status.success', variable: '--success', textOn: '--success-soft' },
  { name: 'status.warning', variable: '--warning', textOn: '--warning-soft' },
  { name: 'status.danger', variable: '--danger', textOn: '--danger-soft' },
  { name: 'status.info', variable: '--info', textOn: '--info-soft' },
  { name: 'focus.ring', variable: '--focus' }]

}];


export function ColorTokens() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {groups.map((g) =>
      <div key={g.title}>
          <DsLabel>{g.title}</DsLabel>
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-md border border-line">
            {g.tokens.map((t) =>
          <li key={t.name} className="flex items-center gap-3 bg-raised px-3 py-2.5">
                <span
              aria-hidden
              className="flex h-8 w-12 shrink-0 items-center justify-center rounded-sm border border-line text-meta font-semibold"
              style={{ background: `rgb(var(${t.variable}))`, color: t.textOn ? `rgb(var(${t.textOn}))` : undefined }}>
              
                  {t.textOn ? 'Aa' : ''}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-label font-medium text-fg">{t.name}</span>
                  <span className="block font-mono text-caption text-fg-subtle">{t.variable}</span>
                </span>
              </li>
          )}
          </ul>
        </div>
      )}
    </div>);

}