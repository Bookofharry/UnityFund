import { motion } from 'framer-motion';
import { getIcon } from './iconRegistry';

interface Props {
  color: string;
  icon: string;
  title: string;
  body: string;
  badges: string[];
  comingSoon?: boolean;
  index: number;
}

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    badge: 'bg-rose-50 text-rose-700 border-rose-100' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  orange:  { bg: 'bg-orange-50',  icon: 'text-orange-600',  badge: 'bg-orange-50 text-orange-700 border-orange-100' },
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  badge: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600',  badge: 'bg-purple-50 text-purple-700 border-purple-100' },
  teal:    { bg: 'bg-teal-50',    icon: 'text-teal-600',    badge: 'bg-teal-50 text-teal-700 border-teal-100' },
};

export function FundTypeCard({ color, icon, title, body, badges, comingSoon = false, index }: Props) {
  const IconComponent = getIcon(icon);
  const palette = colorMap[color] ?? colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] }}
      className={`group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${
        comingSoon ? 'opacity-70' : ''
      }`}
    >
      {comingSoon && (
        <span className="absolute right-4 top-4 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
          Coming Soon
        </span>
      )}
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${palette.bg}`}>
        <IconComponent className={`h-5 w-5 ${palette.icon}`} strokeWidth={2} aria-hidden="true" />
      </div>
      <h3 className="mb-1.5 font-semibold text-navy-800">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-gray-500">{body}</p>
      <div className="flex flex-wrap gap-1.5">
        {badges.map((badge) => (
          <span
            key={badge}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${palette.badge}`}
          >
            {badge}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
