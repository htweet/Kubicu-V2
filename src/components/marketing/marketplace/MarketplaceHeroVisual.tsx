import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarCheckIcon, CheckIcon } from 'lucide-react';
import { findExampleById } from '../../../data/examples';
import { signatureThemes, signatureTheme } from '../../../data/signatureThemes';
import { TemplateThumb } from '../../templates/TemplateThumb';
import { KbShape } from '../home/KbShape';

const template = findExampleById('elite-beauty') ?? findExampleById('glow-by-halima');
const themed = findExampleById('elite-signature-creator');
const theme = signatureThemes.find((t) => t.id === 'emerald-luxe') ?? signatureThemes[0];
const ease = [0.23, 1, 0.32, 1] as const;

/** Marketplace hero (D268): a template, a theme and an app — the three things people add most — in one stack. */
export function MarketplaceHeroVisual() {
  const reduce = useReducedMotion();
  const pop = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 14, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.28, delay, ease } });
  return (
    // Shorter on phones so the hero doesn't push the page down by a whole screen (D565).
    <figure className="relative mx-auto h-[340px] w-full max-w-[540px] sm:h-[500px]">
      <KbShape kind="kube" color="rgb(var(--kb-lime))" size={84} motion="spin" className="absolute -right-2 -top-2 z-20" />
      <KbShape kind="circle" color="rgb(var(--kb-pink))" size={64} motion="bob" className="absolute bottom-6 left-[44%] z-0" />

      {template && (
        <motion.div className="absolute left-0 top-6 z-10 -rotate-[5deg]" {...pop(0.15)}>
          <div className="overflow-hidden rounded-[24px] border-[5px] border-[rgb(18_18_20)] bg-[rgb(18_18_20)] shadow-3">
            <div className="hidden sm:block">
              <TemplateThumb doc={template.doc} width={190} height={380} />
            </div>
            <div className="sm:hidden">
              <TemplateThumb doc={template.doc} width={140} height={280} />
            </div>
          </div>
          <p className="mt-2 text-center text-[12px] font-bold text-white/85">Template</p>
        </motion.div>
      )}

      {themed && (
        <motion.div className="absolute right-0 top-[18%] z-10 rotate-[4deg]" {...pop(0.3)}>
          <div className="overflow-hidden rounded-[24px] border-[5px] border-white bg-white shadow-3">
            <div className="hidden sm:block">
              <TemplateThumb doc={{ ...themed.doc, theme: signatureTheme(theme) }} width={170} height={300} />
            </div>
            <div className="sm:hidden">
              <TemplateThumb doc={{ ...themed.doc, theme: signatureTheme(theme) }} width={130} height={230} />
            </div>
          </div>
          <p className="mt-2 text-center text-[12px] font-bold text-white/85">Theme · {theme.name}</p>
        </motion.div>
      )}

      {/* Centred on phones by a plain wrapper, since the entrance animation owns the card's transform (D565). */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center sm:inset-x-auto sm:bottom-2 sm:left-[22%] sm:block">
      <motion.div className="w-[min(240px,80vw)] sm:w-[260px]" {...pop(0.5)}>
        <motion.div
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="rounded-[22px] bg-white p-4 text-[rgb(20_20_18)] shadow-3"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--kb-cobalt))] text-white">
              <CalendarCheckIcon size={20} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-extrabold">Bookings</p>
              <p className="text-[12px] text-[rgb(90_86_78)]">KUBICU app · Free</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[rgb(104_100_92)]">Works with</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {['Pages', 'Audience', 'Automations'].map((m) => (
              <span key={m} className="inline-flex items-center gap-1 rounded-full bg-[rgb(238_233_221)] px-2.5 py-1 text-[11px] font-semibold">
                <CheckIcon size={11} aria-hidden /> {m}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
      </div>
      <figcaption className="sr-only">A template, a theme and the Bookings app, as they appear in the Marketplace.</figcaption>
    </figure>
  );
}
