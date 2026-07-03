import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { finalCta } from '../data/landing';

export function FinalCTASection() {
  return (
    <section aria-label="Get started" className="bg-navy-800 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-display-l font-black text-white"
        >
          {finalCta.heading}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-5 text-lg leading-relaxed text-indigo-200"
        >
          {finalCta.subheading}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-navy-800 shadow-elevated transition-all duration-200 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
          >
            {finalCta.ctaPrimary}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href="mailto:hello@unityfund.io"
            className="rounded-lg border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:border-white/50 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {finalCta.ctaSecondary}
          </a>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="scrollbar-hide mt-8 flex flex-nowrap items-center justify-center gap-2 overflow-x-auto sm:flex-wrap sm:gap-6 sm:overflow-visible"
        >
          {finalCta.trust.map((item) => (
            <p key={item} className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] text-indigo-300 sm:gap-2 sm:text-sm">
              <span aria-hidden="true" className="text-emerald-400">✓</span>
              {item}
            </p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
