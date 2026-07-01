import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  name: string;
  price: string;
  period: string;
  highlight: boolean;
  badge?: string;
  features: string[];
  cta: string;
  ctaVariant: 'filled' | 'outline';
  index: number;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

// Per-card color scheme — index 0 = Starter, 1 = Pro, 2 = Org
const SCHEMES = [
  {
    // Starter — light indigo tint, welcoming
    card: 'bg-[#f5f4ff] border border-indigo-200/60',
    label: 'text-indigo-400',
    price: 'text-navy-800',
    divider: 'bg-indigo-100/70',
    checkBg: 'bg-indigo-100',
    checkColor: 'text-indigo-600',
    featureText: 'text-gray-600',
    cta: 'bg-indigo-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.28)] hover:bg-indigo-700',
    badgeBg: '',
    glowLine: false,
    scale: '',
  },
  {
    // Professional — deep navy, elevated, indigo-accented
    card: [
      'bg-navy-800',
      'ring-1 ring-inset ring-indigo-500/35',
      'shadow-[0_28px_80px_-12px_rgba(79,70,229,0.3)]',
      'md:scale-[1.05] md:z-10',
    ].join(' '),
    label: 'text-slate-500',
    price: 'text-white',
    divider: 'bg-white/[0.07]',
    checkBg: 'bg-emerald-400/15',
    checkColor: 'text-emerald-400',
    featureText: 'text-slate-300',
    cta: 'bg-indigo-500 text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] hover:bg-indigo-400 hover:shadow-[0_4px_26px_rgba(99,102,241,0.5)]',
    badgeBg: 'bg-indigo-500/15 text-indigo-300',
    glowLine: true,
    scale: '',
  },
  {
    // Organization — near-black with emerald, enterprise feel
    card: [
      'bg-navy-900',
      'ring-1 ring-inset ring-emerald-500/20',
      'shadow-[0_16px_60px_-12px_rgba(16,185,129,0.1)]',
    ].join(' '),
    label: 'text-emerald-500',
    price: 'text-white',
    divider: 'bg-white/[0.05]',
    checkBg: 'bg-emerald-400/10',
    checkColor: 'text-emerald-400',
    featureText: 'text-slate-300',
    cta: 'border border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400/55',
    badgeBg: '',
    glowLine: false,
    scale: '',
  },
] as const;

export function PricingCard({ name, price, period, badge, features, cta, index }: Props) {
  const s = SCHEMES[index] ?? SCHEMES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-32px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: EASE }}
      className={`relative flex flex-col rounded-2xl px-8 py-10 ${s.card}`}
    >
      {/* Pro top-edge glow line */}
      {s.glowLine && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-indigo-400/65 to-transparent"
        />
      )}

      {/* Badge */}
      {badge && (
        <div className={`mb-6 inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${s.badgeBg || 'bg-white/10 text-white/70'}`}>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.9)]" />
          {badge}
        </div>
      )}

      {/* Plan label */}
      <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${s.label}`}>
        {name}
      </p>

      {/* Price */}
      <div className="mt-3 flex items-end gap-1.5">
        <span className={`text-[2.75rem] font-black leading-none tracking-tight ${s.price}`}>
          {price}
        </span>
        {period && (
          <span className={`mb-1 text-sm font-medium ${index === 0 ? 'text-gray-400' : 'text-slate-500'}`}>
            /{period}
          </span>
        )}
      </div>

      {/* Divider */}
      <div aria-hidden className={`mt-7 mb-7 h-px ${s.divider}`} />

      {/* Features */}
      <ul className="flex-1 space-y-4">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${s.checkBg}`}>
              <Check className={`h-2.5 w-2.5 ${s.checkColor}`} strokeWidth={3.5} aria-hidden="true" />
            </span>
            <span className={`text-sm leading-relaxed ${s.featureText}`}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        to={cta === 'Contact sales' ? '/contact' : '/register'}
        className={`mt-9 block rounded-xl px-5 py-3.5 text-center text-sm font-bold transition-all duration-200 ${s.cta}`}
      >
        {cta}
      </Link>
    </motion.div>
  );
}
