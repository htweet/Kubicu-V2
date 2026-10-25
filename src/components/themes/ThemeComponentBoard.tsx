import React from 'react';
import { ArrowRightIcon, Loader2Icon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { PageSurface } from '../blocks/PageSurface';
import { accentOf, borderColor, buttonStyle, cardStyle, headingStyle, imageFrameStyle, inputStyle, mix } from '../blocks/pageStyle';

/**
 * Every component the theme styles, in every state that can be shown statically (D164).
 * Rendered on the theme's own surface so glass, depth and contrast read as they would on a page.
 */
export function ThemeComponentBoard({ theme }: {theme: PageTheme;}) {
  const m = theme.material;
  const error = m?.error ?? '#C0392B';
  const focus = m?.focus ?? theme.accent;
  const btn = 'inline-flex h-11 items-center justify-center gap-2 px-5 text-[14px] font-semibold';
  const link = m?.linkStyle ?? 'underline';
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <PageSurface theme={theme} columnClassName="!max-w-none !px-5 !py-6 gap-6">
        <Group label="Buttons" theme={theme}>
          <div className="flex flex-wrap gap-2">
            <span className={btn} style={buttonStyle(theme, 'featured')}>Primary <ArrowRightIcon size={15} aria-hidden /></span>
            <span className={btn} style={buttonStyle(theme, 'default')}>Secondary</span>
            <span className={btn} style={{ ...buttonStyle(theme, 'default'), background: 'transparent', border: `1.5px solid ${borderColor(theme, 40)}` }}>Outline</span>
            <span className={btn} style={buttonStyle(theme, 'subtle')}>Text</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <State label="Focus"><span className={btn} style={{ ...buttonStyle(theme, 'featured'), outline: `2px solid ${focus}`, outlineOffset: 2 }}>Primary</span></State>
            <State label="Pressed"><span className={btn} style={{ ...buttonStyle(theme, 'featured'), transform: 'scale(0.97)', filter: 'brightness(0.94)' }}>Primary</span></State>
            <State label="Disabled"><span className={btn} style={{ ...buttonStyle(theme, 'featured'), opacity: 0.5 }}>Primary</span></State>
            <State label="Loading"><span className={btn} style={buttonStyle(theme, 'featured')}><Loader2Icon size={15} className="animate-spin motion-reduce:animate-none" aria-hidden /> Saving</span></State>
          </div>
        </Group>

        <Group label="Links & labels" theme={theme}>
          <p className="text-[15px]" style={{ color: theme.text }}>
            Read the{' '}
            <span style={link === 'underline' ? { textDecoration: 'underline', textUnderlineOffset: 3 } : { color: accentOf(theme), fontWeight: 600 }}>
              studio journal{link === 'arrow' ? ' →' : ''}
            </span>{' '}
            for class dates.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: mix(accentOf(theme), 16, theme.background), color: theme.text }}>New</span>
            <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ border: `1px solid ${borderColor(theme, 20)}`, color: theme.mutedText }}>Sold out</span>
            <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: mix(m?.success ?? '#1E7B45', 16, theme.background), color: theme.text }}>✓ Paid</span>
          </div>
        </Group>

        <Group label="Card" theme={theme}>
          <article className="p-5" style={cardStyle(theme)}>
            <h4 className="text-[19px] leading-tight" style={{ ...headingStyle(theme), color: theme.text }}>Saturday wheel class</h4>
            <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>Three hours, six people, clay and glazes included.</p>
            <hr className="my-4 border-0" style={{ height: 1, background: borderColor(theme, 12) }} />
            <p className="text-[15px] font-semibold tabular-nums" style={{ color: theme.text }}>₦25,000</p>
          </article>
        </Group>

        <Group label="Inputs" theme={theme}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input theme={theme} label="Default" placeholder="Your name" />
            <Input theme={theme} label="Focus" value="amara@" style={{ outline: `2px solid ${focus}`, outlineOffset: 1 }} />
            <Input theme={theme} label="Error" value="0802" style={{ borderColor: error }} hint="Enter 11 digits" hintColor={error} />
          </div>
        </Group>

        <Group label="Photo frame" theme={theme}>
          <img
            src="/43e71e50-b63a-4a2f-8a21-e99e84704b0e.jpg"
            alt="Sample photo in the theme's frame"
            className="aspect-[16/9] w-full object-cover"
            style={{ borderRadius: cardStyle(theme).borderRadius as number ?? 12, ...imageFrameStyle(theme) }} />
          
        </Group>
      </PageSurface>
    </div>);

}

function Group({ label, theme, children }: {label: string;theme: PageTheme;children: React.ReactNode;}) {
  return (
    <section>
      <h4 className="mb-2.5 text-[12px] font-semibold" style={{ color: theme.mutedText }}>{label}</h4>
      {children}
    </section>);

}

function State({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <span className="inline-flex flex-col items-start gap-1">
      {children}
      <span className="text-[11px] opacity-70">{label}</span>
    </span>);

}

function Input({ theme, label, placeholder, value, style, hint, hintColor }: {theme: PageTheme;label: string;placeholder?: string;value?: string;style?: React.CSSProperties;hint?: string;hintColor?: string;}) {
  return (
    <span className="flex flex-col gap-1">
      <span className="text-[12px] font-medium" style={{ color: theme.mutedText }}>{label}</span>
      <span className="flex h-11 items-center px-3 text-[14px]" style={{ ...inputStyle(theme), ...style }}>
        <span style={{ color: value ? theme.text : theme.mutedText }}>{value ?? placeholder}</span>
      </span>
      {hint && <span className="text-[12px] font-medium" style={{ color: hintColor }}>{hint}</span>}
    </span>);

}