import { motion } from 'framer-motion';
import { Table2, EyeOff, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { problem } from '../data/landing';
import { SectionHeading } from '../components/landing/SectionHeading';

const iconMap: Record<string, React.ReactNode> = {
  Sheet: <Table2 className="h-6 w-6 text-amber-500" aria-hidden="true" />,
  EyeOff: <EyeOff className="h-6 w-6 text-amber-500" aria-hidden="true" />,
  Clock: <Clock className="h-6 w-6 text-amber-500" aria-hidden="true" />,
};

export function ProblemSection() {
  return (
    <section id="problem" aria-label="The problem" className="bg-[#f5f7ff] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeading heading={problem.heading} subheading={problem.subheading} />
        </motion.div>

        {/* Pain cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {problem.pains.map(({ title, icon, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-card"
            >
              {/* Left amber accent bar */}
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-amber-400" aria-hidden="true" />
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                {iconMap[icon]}
              </div>
              <h3 className="mb-2 font-semibold text-navy-800">{title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-500">{body}</p>
            </motion.div>
          ))}
        </div>

        {/* Before visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14"
          aria-label="Current manual workflow"
        >
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            How most organizations currently work
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            {problem.before.map(({ label, sub }, i) => (
              <div key={label} className="flex w-full max-w-xs flex-col items-center gap-4 sm:w-auto sm:max-w-none sm:flex-row">
                <div className="w-full rounded-xl border-2 border-dashed border-red-200 bg-red-50 px-5 py-4 text-center sm:w-48">
                  <p className="text-sm font-semibold text-red-700">{label}</p>
                  <p className="mt-0.5 text-xs text-red-400">{sub}</p>
                </div>
                {i < problem.before.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-red-300 sm:rotate-0" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-red-400 sm:text-sm">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
            Fragmented. Error-prone. Exhausting. Every cycle.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
