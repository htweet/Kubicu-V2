import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheckIcon, LinkIcon, MessageCircleIcon, ShoppingBagIcon } from 'lucide-react';
import { TemplateThumb } from '../templates/TemplateThumb';
import { KbShape } from '../marketing/home/KbShape';
import { findExampleById } from '../../data/examples';
import { useT } from '../../contexts/LocaleContext';
import { swapPreviewAmount } from '../../utils/previewMoney';

const showcase = findExampleById('glow-by-halima')!;
const ease = [0.23, 1, 0.32, 1] as const;

export type ShowcaseKind = 'signup' | 'signin';

/**
 * The lime panel beside sign-in and sign-up: a real example page in a phone, with two example
 * moments floating beside it. Everything is labelled as an example of a fictional business.
 */
export function AuthShowcase({ kind }: { kind: ShowcaseKind }) {
  const { t, lang } = useT();
  const cards =
    kind === 'signup'
      ? [
          { icon: LinkIcon, title: 'kub.icu/glowbyhalima', text: t('Your link, ready to share') },
          { icon: MessageCircleIcon, title: t('Order on WhatsApp'), text: swapPreviewAmount(t('Knotless braids · ₦35,000'), 35000, lang) },
        ]
      : [
          { icon: ShoppingBagIcon, title: t('New order #1008'), text: swapPreviewAmount(t('Paid · ₦31,500'), 31500, lang) },
          { icon: CalendarCheckIcon, title: t('Booking confirmed'), text: t('Sat 10:00 · Silk press') },
        ];
  const steps = [t('Claim your link'), t('Build your page'), t('Share and sell')];

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] bg-[rgb(var(--kb-lime))] px-10 py-12 text-[rgb(var(--kb-forest))]">
      <KbShape kind="kube" color="rgb(var(--kb-pink))" size={96} motion="spin" className="absolute -right-5 top-8" />
      <KbShape kind="circle" color="rgb(var(--kb-cobalt))" size={84} motion="bob" className="absolute -left-7 bottom-40" />

      <p className="kb-display relative mx-auto max-w-md text-center text-[44px] leading-[0.96]">
        {kind === 'signup' ? t('One link. Your whole business.') : t('Welcome back to your business.')}
      </p>

      <div className="relative mx-auto mt-10 flex flex-1 items-center justify-center">
        <div className="overflow-hidden rounded-[30px] border-[6px] border-[rgb(var(--kb-forest))] bg-[rgb(var(--kb-forest))] shadow-3">
          <TemplateThumb doc={showcase.doc} width={230} height={460} />
        </div>
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease, delay: 0.15 + i * 0.06 }}
            className={i === 0 ? 'absolute -left-24 top-14' : 'absolute -right-24 bottom-20'}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
              className="flex w-[230px] items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[rgb(20_20_18)] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--kb-forest))] text-[rgb(var(--kb-lime))]">
                <c.icon size={18} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold">{c.title}</span>
                <span className="block truncate text-[12.5px] text-[rgb(20_20_18/0.65)]">{c.text}</span>
              </span>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <ol className="relative mt-10 grid grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-col gap-2 border-t-2 border-[rgb(var(--kb-forest)/0.25)] pt-3 first:border-[rgb(var(--kb-forest))]">
            <span className="text-[12px] font-bold tabular-nums opacity-70">{i + 1}</span>
            <span className="text-[14px] font-bold leading-tight">{s}</span>
          </li>
        ))}
      </ol>
      <p className="relative mt-6 text-center text-[12px] font-semibold opacity-70">{t('Example page · fictional business')}</p>
    </div>
  );
}
