import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarCheckIcon, PackageCheckIcon } from 'lucide-react';
import { KbShape } from './KbShape';
import { Parallax } from './Parallax';
import { homeImages } from '../../../data/marketingHome';
import { useT } from '../../../contexts/LocaleContext';
import { previewAmount } from '../../../utils/previewMoney';

const ease = [0.23, 1, 0.32, 1] as const;

/** Shop owner photo with an order and a booking arriving on top (D260). Figures are illustrative. */
export function SellVisual() {
  const { lang } = useT();
  const reduce = useReducedMotion();
  const enter = (delay: number, x: number) => ({
    initial: reduce ? false : { opacity: 0, x },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true },
    transition: { duration: 0.28, delay, ease },
  });
  return (
    <div className="relative mx-auto max-w-[580px] pb-10 pt-6" aria-hidden>
      <KbShape kind="plus" color="rgb(var(--kb-clay))" size={56} motion="spin" className="absolute -right-2 top-0 z-20" />
      <KbShape kind="circle" color="rgb(var(--kb-lime))" size={120} motion="bob" className="absolute -bottom-4 -left-8 z-0" />

      <Parallax distance={18} className="relative z-10">
        <img src={homeImages.shop} alt="" className="aspect-[4/3] w-full rounded-[36px] object-cover shadow-3" />
      </Parallax>

      <motion.div {...enter(0.3, 24)} className="absolute -right-2 top-[14%] z-20 w-[230px] rounded-2xl bg-white p-4 text-[rgb(20_20_18)] shadow-3 sm:-right-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--kb-peach))] text-[rgb(var(--kb-clay))]">
            <PackageCheckIcon size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold">Woven tote · Large</p>
            <p className="text-[11px] text-[rgb(104_100_92)]">Paid · ready for pickup</p>
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-[rgb(224_217_202)] pt-3">
          <span className="text-[11px] text-[rgb(104_100_92)]">You receive</span>
          <span className="text-[16px] font-extrabold">{previewAmount(24150, lang)}</span>
        </div>
      </motion.div>

      <motion.div {...enter(0.5, -24)} className="absolute -left-2 bottom-0 z-20 flex items-center gap-3 rounded-2xl bg-[rgb(var(--kb-clay))] p-3 pr-5 text-white shadow-3 sm:-left-8">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <CalendarCheckIcon size={20} />
        </span>
        <span>
          <span className="block text-[13px] font-bold">Fitting booked · Sat 11:00</span>
          <span className="block text-[11px] text-white/80">{previewAmount(5000, lang)} deposit paid</span>
        </span>
      </motion.div>
    </div>
  );
}
