import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RiseText } from './RiseText';
import { KbShape } from './KbShape';
import { localFeatures } from '../../../data/marketing';
import { homeImages } from '../../../data/marketingHome';
import { cn } from '../../../utils/cn';

const tiles = [
{ bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))' },
{ bg: 'rgb(var(--kb-plum))', fg: 'rgb(255 255 255)' },
{ bg: 'rgb(var(--kb-peach))', fg: 'rgb(var(--kb-clay))' },
{ bg: 'rgb(var(--kb-cobalt))', fg: 'rgb(255 255 255)' }];


/** "Built for Nigeria" bento: the WhatsApp tile leads with a photo, three supporting tiles (D260). */
export function LocalSection() {
  const reduce = useReducedMotion();
  const [lead, ...rest] = localFeatures;
  const LeadIcon = lead.icon;
  return (
    <section aria-labelledby="local-heading" className="bg-canvas pb-20 md:pb-28">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <h2 id="local-heading" className="kb-display max-w-4xl text-[42px] leading-[0.98] text-fg sm:text-[56px] lg:text-[64px]">
          <RiseText text="Built for how customers actually buy here." stagger={0.04} />
        </h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <motion.article
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative grid overflow-hidden rounded-[36px] sm:col-span-2 sm:grid-cols-2 lg:row-span-2"
            style={{ backgroundColor: tiles[0].bg, color: tiles[0].fg }}>
            
            <div className="relative z-10 flex flex-col p-8 md:p-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--kb-forest))] text-[rgb(var(--kb-lime))]">
                <LeadIcon size={26} aria-hidden />
              </span>
              <h3 className="kb-display mt-8 text-[34px] leading-[1.02] md:text-[40px]">{lead.title}</h3>
              <p className="mt-4 max-w-sm text-[17px] font-medium leading-relaxed opacity-90">{lead.text}</p>
              <div className="mt-auto pt-8">
                <div className="inline-block max-w-[260px] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[13px] font-medium leading-snug text-[rgb(20_20_18)] shadow-2">
                  Hello! I’d like 2 party trays of small chops (₦45,000) for Saturday.
                </div>
              </div>
            </div>
            <div className="relative min-h-[280px]">
              <img src={homeImages.chef} alt="Chef presenting a plate of jollof rice" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <KbShape kind="asterisk" color="rgb(var(--kb-lime))" size={64} motion="spin" className="absolute right-5 top-5" />
            </div>
          </motion.article>

          {rest.map((f, i) => {
            const t = tiles[i + 1];
            const Icon = f.icon;
            return (
              <motion.article
                key={f.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: 0.06 * (i + 1), ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                  'flex flex-col rounded-[36px] p-8',
                  i === 0 && 'lg:col-start-3 lg:row-start-1',
                  i === 1 && 'lg:col-start-3 lg:row-start-2',
                  i === 2 && 'sm:col-span-2 md:flex-row md:items-center md:gap-10 lg:col-span-3'
                )}
                style={{ backgroundColor: t.bg, color: t.fg }}>
                
                <Icon size={30} aria-hidden className="shrink-0" />
                <h3 className={cn('kb-display mt-6 text-[26px] leading-tight', i === 2 && 'md:mt-0 md:shrink-0')}>{f.title}</h3>
                <p className={cn('mt-3 text-[15px] font-medium leading-relaxed opacity-90', i === 2 && 'md:mt-0 md:max-w-2xl md:text-[17px]')}>{f.text}</p>
              </motion.article>);

          })}
        </div>
      </div>
    </section>);

}