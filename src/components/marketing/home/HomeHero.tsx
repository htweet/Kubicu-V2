import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, CheckIcon, MessageCircleIcon } from 'lucide-react';
import { HandleClaim } from '../HandleClaim';
import { TemplateThumb } from '../../templates/TemplateThumb';
import { KbShape } from './KbShape';
import { Parallax } from './Parallax';
import { RiseText } from './RiseText';
import { findExampleById } from '../../../data/examples';
import { homeImages } from '../../../data/marketingHome';

const atelier = findExampleById('adaeze-atelier')!;
const ease = [0.23, 1, 0.32, 1] as const;

/** Home hero (D260, D261): dark grey band with a subtle even gradient under the floating nav, giant headline, link claim, and a photo + live page collage. */
export function HomeHero() {
  const reduce = useReducedMotion();
  const pop = (delay: number) => reduce ? {} : { initial: { opacity: 0, scale: 0.96, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.28, delay, ease } };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative -mt-[88px] overflow-hidden pt-[88px] text-white"
      style={{ backgroundColor: 'rgb(30 30 33)', backgroundImage: 'linear-gradient(160deg, rgb(48 48 52) 0%, rgb(34 34 38) 50%, rgb(22 22 25) 100%)' }}>
      
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-10 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10 lg:pb-24 lg:pt-16">
        <div className="relative z-10 max-w-2xl">
          <h1 id="hero-heading" className="kb-display text-[52px] leading-[0.95] sm:text-[72px] lg:text-[88px]">
            <RiseText text="Your whole business in one link." />
          </h1>
          <motion.p
            className="mt-7 max-w-lg text-[18px] font-medium leading-relaxed opacity-90 md:text-[20px]"
            {...reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: 0.35, ease } }}>
            
            Sell, take bookings, sell tickets and collect enquiries from one page — built on a real canvas, made for phones and for how customers buy in Nigeria.
          </motion.p>
          <motion.div className="mt-9" {...reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: 0.45, ease } }}>
            <HandleClaim />
          </motion.div>
          <Link
            to="/templates"
            className="group mt-4 inline-flex items-center gap-1.5 rounded-sm text-label font-bold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
            Or browse example pages <ArrowRightIcon size={15} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
          </Link>
        </div>

        <figure className="relative mx-auto h-[440px] w-full max-w-[560px] sm:h-[540px] lg:h-[600px]">
          <KbShape kind="asterisk" color="rgb(var(--kb-pink))" size={92} motion="spin" className="absolute -right-2 -top-4 z-20 sm:-right-6" />
          <KbShape kind="circle" color="rgb(var(--kb-cobalt))" size={70} motion="bob" className="absolute -left-2 top-[38%] z-0 hidden sm:block" />
          <KbShape kind="arch" color="rgb(var(--kb-lime))" size={64} motion="sway" phase={1} className="absolute bottom-2 right-[30%] z-0" />

          <Parallax distance={24} className="absolute right-0 top-0 h-[84%] w-[76%]">
            <motion.img
              src={homeImages.fashion}
              alt="A fashion designer in her Lagos studio, holding her phone"
              className="h-full w-full rounded-[36px] object-cover object-[50%_25%] shadow-3"
              {...reduce ? {} : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3, delay: 0.1, ease } }} />
            
          </Parallax>

          <motion.div className="absolute bottom-0 left-0 z-10 origin-bottom-left -rotate-[4deg] sm:left-2" {...pop(0.3)}>
            <motion.div animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} className="overflow-hidden rounded-[26px] border-[5px] border-[rgb(12_12_14)] bg-[rgb(12_12_14)] shadow-3 ring-1 ring-white/15">
              <div className="hidden sm:block">
                <TemplateThumb doc={atelier.doc} width={200} height={400} />
              </div>
              <div className="sm:hidden">
                <TemplateThumb doc={atelier.doc} width={150} height={300} />
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="absolute left-[30%] top-[6%] z-20 max-w-[220px] sm:left-[18%]" {...pop(0.55)}>
            <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[rgb(20_20_18)] shadow-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[rgb(22_122_70)]">
                <MessageCircleIcon size={12} aria-hidden /> WhatsApp · from your page
              </p>
              <p className="mt-1 text-[13px] font-medium leading-snug">Hi! Is the green ankara dress in size 12?</p>
            </div>
          </motion.div>

          <motion.div className="absolute bottom-[14%] right-0 z-20 sm:-right-4" {...pop(0.8)}>
            <motion.div animate={reduce ? undefined : { y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }} className="flex items-center gap-3 rounded-2xl bg-[rgb(var(--kb-forest))] py-3 pl-3 pr-5 text-white shadow-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(var(--kb-lime))] text-[rgb(var(--kb-forest))]">
                <CheckIcon size={18} strokeWidth={3} aria-hidden />
              </span>
              <span>
                <span className="block text-[13px] font-bold">New order · ₦18,500</span>
                <span className="block text-[11px] text-white/75">Paid by transfer</span>
              </span>
            </motion.div>
          </motion.div>

          <figcaption className="sr-only">Example page for a fictional fashion business, with a sample WhatsApp enquiry and order.</figcaption>
        </figure>
      </div>
    </section>);

}