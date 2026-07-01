import { motion } from 'framer-motion';
import { getIcon } from './iconRegistry';

interface Props {
  icon: string;
  title: string;
  body: string;
  index: number;
}

export function FeatureCard({ icon, title, body, index }: Props) {
  const IconComponent = getIcon(icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] }}
      whileHover={{ y: -2 }}
      className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 transition-colors duration-300 group-hover:bg-indigo-100">
        <IconComponent className="h-5 w-5 text-indigo-600" strokeWidth={2} aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-navy-800">{title}</h3>
      <p className="text-[15px] leading-relaxed text-gray-500">{body}</p>
    </motion.div>
  );
}
