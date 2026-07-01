import { motion } from 'framer-motion';
import { howItWorks } from '../data/landing';
import { SectionHeading } from '../components/landing/SectionHeading';
import { getIcon } from '../components/landing/iconRegistry';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-label="How it works" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeading heading={howItWorks.heading} />
        </motion.div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connector line — desktop only */}
          <div
            className="absolute left-0 right-0 top-12 hidden h-px bg-indigo-100 lg:block"
            aria-hidden="true"
          />

          <div className="grid gap-8 lg:grid-cols-4">
            {howItWorks.steps.map(({ number, icon, title, body }, i) => {
              const IconComponent = getIcon(icon);

              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] }}
                  className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-white shadow-card border border-gray-100">
                    <span className="text-xs font-bold text-indigo-300">{number}</span>
                    <IconComponent
                      className="mt-1 h-7 w-7 text-indigo-600"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-navy-800">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-500">{body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
