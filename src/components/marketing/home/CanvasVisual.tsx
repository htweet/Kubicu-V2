import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GripVerticalIcon, PlusIcon } from 'lucide-react';
import { TemplateThumb } from '../../templates/TemplateThumb';
import { KbShape } from './KbShape';
import { findExampleById } from '../../../data/examples';
import { canvasBlocks } from '../../../data/marketingHome';

const brunch = findExampleById('afrobeats-brunch')!;
const swatches = ['rgb(var(--kb-lime))', 'rgb(var(--kb-pink))', 'rgb(var(--kb-cobalt))', 'rgb(var(--kb-peach))', 'rgb(20 20 18)'];

/** Simplified editor: blocks slot into a list beside the live page (D260). */
export function CanvasVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto max-w-[560px]" aria-hidden>
      <KbShape kind="asterisk" color="rgb(var(--kb-lime))" size={84} motion="spin" className="absolute -left-6 -top-8 z-20" />
      <KbShape kind="ring" color="rgb(var(--kb-sky))" size={110} motion="bob" className="absolute -bottom-10 -right-6 z-0" />

      <div className="relative z-10 overflow-hidden rounded-[28px] bg-white text-[rgb(20_20_18)] shadow-3">
        <div className="flex items-center gap-3 border-b border-[rgb(224_217_202)] px-4 py-3">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--kb-pink))]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--kb-lime))]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--kb-sky))]" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-full bg-[rgb(238_233_221)] px-3 py-1 text-[12px] font-medium text-[rgb(70_68_62)]">kub.icu/{brunch.doc.handle}</span>
          <span className="rounded-full bg-[rgb(var(--kb-lime))] px-3 py-1 text-[12px] font-bold">Publish</span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 p-4 sm:gap-6 sm:p-6">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[rgb(104_100_92)]">Your blocks</p>
            {canvasBlocks.map((b, i) =>
            <motion.div
              key={b}
              initial={reduce ? false : { opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.25, delay: 0.2 + i * 0.05, ease: [0.23, 1, 0.32, 1] }}
              className={`flex h-10 items-center gap-2 rounded-xl border px-2.5 text-[13px] font-semibold ${i === 2 ? 'border-[rgb(var(--kb-cobalt))] bg-[rgb(var(--kb-sky)/0.4)]' : 'border-[rgb(224_217_202)] bg-white'}`}>
              
                <GripVerticalIcon size={14} className="shrink-0 text-[rgb(150_145_135)]" />
                <span className="truncate">{b}</span>
              </motion.div>
            )}
            <div className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-dashed border-[rgb(186_177_158)] text-[12px] font-semibold text-[rgb(104_100_92)]">
              <PlusIcon size={14} /> Add a block
            </div>
          </div>
          <div className="overflow-hidden rounded-[20px] border-4 border-[rgb(20_20_18)]">
            <div className="hidden sm:block">
              <TemplateThumb doc={brunch.doc} width={190} height={380} />
            </div>
            <div className="sm:hidden">
              <TemplateThumb doc={brunch.doc} width={130} height={290} />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.28, delay: 0.55, ease: [0.23, 1, 0.32, 1] }}
        className="absolute -bottom-6 left-6 z-20 flex items-center gap-2 rounded-full bg-[rgb(20_20_18)] py-2 pl-4 pr-2 text-white shadow-3">
        
        <span className="text-[12px] font-semibold">Theme</span>
        {swatches.map((s) =>
        <span key={s} className="h-6 w-6 rounded-full border-2 border-white" style={{ backgroundColor: s }} />
        )}
      </motion.div>
    </div>);

}