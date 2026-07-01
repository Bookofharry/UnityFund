import { motion } from 'framer-motion';
import { pricing } from '../data/landing';
import { PricingCard } from '../components/landing/PricingCard';

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

export function PricingSection() {
  return (
    <section id="pricing" aria-label="Pricing" className="bg-white py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center"
        >
          <p className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-indigo-500">
            Plans & Pricing
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-[3rem] lg:leading-[1.1]">
            Simple pricing for{' '}
            <span className="text-indigo-600">every organization</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-gray-500">
            No per-transaction fees on our end. Pay for the platform, not for every payment.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="mt-16 grid items-center gap-5 md:grid-cols-3 md:gap-4">
          {pricing.plans.map((plan, i) => (
            <PricingCard key={plan.name} {...plan} index={i} />
          ))}
        </div>

        {/* Footnote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 flex flex-col items-center gap-3"
        >
          <div aria-hidden className="h-px w-14 bg-gray-200" />
          <p className="text-center text-sm text-gray-400">{pricing.footnote}</p>
        </motion.div>

      </div>
    </section>
  );
}
