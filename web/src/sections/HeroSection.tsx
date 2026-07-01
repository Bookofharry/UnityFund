import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, TrendingUp } from 'lucide-react';
import { hero } from '../data/landing';
import { DashboardMockup } from '../components/landing/DashboardMockup';
import { AnimatedHeadline } from '../components/landing/AnimatedHeadline';
import { FloatingLetters } from '../components/landing/FloatingLetters';

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

function StatCard({ value, label, index }: { value: string; label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.9 + index * 0.12, ease: EASE }}
      className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-card"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
        <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
      </div>
      <div>
        <p className="text-base font-bold text-navy-800 leading-none">{value}</p>
        <p className="mt-0.5 text-xs text-gray-400">{label}</p>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden bg-[#f5f7ff] pt-36 pb-20 md:pt-44 md:pb-28"
    >
      <FloatingLetters />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">

          {/* Left: Copy */}
          <div className="lg:col-span-6">
            {/* Badge */}
            <motion.div {...fadeUp(0)}>
              <motion.div
                animate={{ rotate: [-15, 15, -15] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-wide text-indigo-700">
                  {hero.badge}
                </span>
              </motion.div>
            </motion.div>

            {/* Headline */}
            <AnimatedHeadline
              lines={hero.headline as [string, string]}
              className="text-3xl font-black text-navy-800 sm:text-display-xl"
              accentClassName="text-indigo-600"
            />

            {/* Subheadline */}
            <motion.p
              {...fadeUp(0.22)}
              className="mt-5 text-lg leading-relaxed text-gray-500"
            >
              {hero.subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.34)} className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {hero.ctaPrimary}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                {hero.ctaSecondary}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div {...fadeUp(0.46)} className="mt-8 flex flex-col gap-3 sm:flex-row">
              {hero.stats.map((stat, i) => (
                <StatCard key={stat.label} {...stat} index={i} />
              ))}
            </motion.div>
          </div>

          {/* Right: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            className="relative lg:col-span-6"
            aria-hidden="true"
          >
            <DashboardMockup />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
