import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** Fade-up for section headings only (D77). Off when the device asks for less motion. */
export function Reveal({ children, className }: {children: React.ReactNode;className?: string;}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}>
      
      {children}
    </motion.div>);

}