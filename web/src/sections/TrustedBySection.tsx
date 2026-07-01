import { motion } from 'framer-motion';
import { trustedBy } from '../data/landing';

export function TrustedBySection() {
  return (
    <section aria-label="Trusted by" className="border-y border-gray-100 bg-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {trustedBy.heading}
          </p>
          <p className="mt-1.5 text-sm text-gray-400">{trustedBy.subheading}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          role="list"
          aria-label="Organization types served"
        >
          {trustedBy.orgs.map(({ emoji, label }) => (
            <div
              key={label}
              role="listitem"
              className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <span aria-hidden="true">{emoji}</span>
              {label}
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-7 text-center text-xs text-gray-300"
        >
          {trustedBy.tagline}
        </motion.p>
      </div>
    </section>
  );
}
