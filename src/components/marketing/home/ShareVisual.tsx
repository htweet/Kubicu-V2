import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link2Icon, QrCodeIcon } from 'lucide-react';
import { KbShape } from './KbShape';
import { Parallax } from './Parallax';
import { homeImages, shareChannels } from '../../../data/marketingHome';

const spots = [
'left-0 top-[12%]',
'right-0 top-[4%]',
'-left-2 top-[46%]',
'right-[-6px] top-[40%]',
'left-[4%] bottom-[16%]',
'right-[2%] bottom-[24%]'];


/** Photo in an arch with the places people share their link floating around it (D260). */
export function ShareVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto h-[480px] w-full max-w-[520px] sm:h-[560px]" aria-hidden>
      <KbShape kind="diamond" color="rgb(var(--kb-cobalt))" size={64} motion="float" className="absolute right-[14%] top-[-12px] z-20" />
      <KbShape kind="half" color="rgb(var(--kb-plum))" size={90} motion="sway" phase={0.8} className="absolute bottom-[-10px] left-[18%] z-0" />

      <Parallax distance={20} className="absolute inset-x-[16%] bottom-6 top-6">
        <img src={homeImages.musician} alt="" className="h-full w-full rounded-t-full rounded-b-[36px] object-cover object-top shadow-3" />
      </Parallax>

      {shareChannels.slice(0, 6).map((c, i) =>
      <motion.span
        key={c}
        className={`absolute z-10 ${spots[i]}`}
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.25, delay: 0.25 + i * 0.06, ease: [0.23, 1, 0.32, 1] }}>
        
          <motion.span
          animate={reduce ? undefined : { y: [0, i % 2 ? 8 : -8, 0] }}
          transition={{ repeat: Infinity, duration: 4 + i % 3, ease: 'easeInOut', delay: i * 0.3 }}
          className="flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-[13px] font-bold text-[rgb(var(--kb-plum))] shadow-2">
          
            <Link2Icon size={14} /> {c}
          </motion.span>
        </motion.span>
      )}

      <motion.div
        className="absolute bottom-0 right-[8%] z-20 rounded-3xl bg-[rgb(var(--kb-plum))] p-3 text-white shadow-3"
        initial={reduce ? false : { opacity: 0, rotate: 0, y: 14 }}
        whileInView={{ opacity: 1, rotate: 6, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}>
        
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-[rgb(var(--kb-plum))]">
          <QrCodeIcon size={56} strokeWidth={1.6} />
        </span>
        <span className="mt-2 block text-center text-[11px] font-bold">Scan to visit</span>
      </motion.div>
    </div>);

}