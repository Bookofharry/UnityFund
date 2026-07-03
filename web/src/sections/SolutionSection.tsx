import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { solution } from '../data/landing';
import { SectionHeading } from '../components/landing/SectionHeading';

export function SolutionSection() {
  return (
    <section id="solution" aria-label="Our solution" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeading heading={solution.heading} subheading={solution.subheading} />
        </motion.div>

        {/* Domain entity flow chain */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14"
          aria-label="Fund management workflow"
        >
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
            {solution.chain.map(({ label, desc }, i) => (
              <div key={label} className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
                <div className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-center sm:w-auto">
                  <p className="text-sm font-bold text-navy-800">{label}</p>
                  <p className="mt-0.5 text-[11px] text-indigo-500">{desc}</p>
                </div>
                {i < solution.chain.length - 1 && (
                  <ArrowRight
                    className="h-4 w-4 shrink-0 rotate-90 text-indigo-300 sm:rotate-0"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">
            Everything connected. Everything automated.
          </p>
        </motion.div>

        {/* Before / After comparison */}
        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {/* Before column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-8"
            aria-label="Before UnityFund"
          >
            <p className="mb-5 text-sm font-bold uppercase tracking-widest text-red-500">
              Before UnityFund
            </p>
            <ul className="space-y-3">
              {solution.comparison.map(({ before }) => (
                <li key={before} className="flex items-center gap-3 text-sm text-red-700">
                  <span aria-hidden="true" className="text-red-400">✕</span>
                  {before}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* After column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8"
            aria-label="With UnityFund"
          >
            <p className="mb-5 text-sm font-bold uppercase tracking-widest text-emerald-600">
              With UnityFund
            </p>
            <ul className="space-y-3">
              {solution.comparison.map(({ after }) => (
                <li key={after} className="flex items-center gap-3 text-sm text-emerald-800">
                  <Check
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {after}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
