import { motion } from 'framer-motion';

interface Props {
  quote: string;
  org: string;
  location: string;
  index: number;
}

export function TestimonialCard({ quote, org, location, index }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-card"
    >
      {/* Decorative quote mark */}
      <div
        aria-hidden="true"
        className="mb-4 select-none font-serif text-6xl leading-none text-indigo-100"
      >
        "
      </div>
      <p className="flex-1 text-[15px] leading-relaxed text-gray-600">{quote}</p>
      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="font-semibold text-navy-800">{org}</p>
        <p className="text-sm text-gray-400">{location}</p>
      </div>
    </motion.article>
  );
}
