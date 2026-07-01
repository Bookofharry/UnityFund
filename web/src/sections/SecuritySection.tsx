import { motion } from 'framer-motion';
import { security } from '../data/landing';
import { getIcon } from '../components/landing/iconRegistry';

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

function ShieldMark() {
  return (
    <svg width="52" height="62" viewBox="0 0 52 62" fill="none" aria-hidden="true">
      <path
        d="M26 2L3 11v21c0 17.6 10 34.3 23 40 13-5.7 23-22.4 23-40V11L26 2z"
        fill="rgba(79,70,229,0.12)"
        stroke="rgba(99,102,241,0.45)"
        strokeWidth="1.5"
      />
      <path
        d="M26 10L9 17.5v14.7c0 12.2 6.9 23.6 17 27.6 10.1-4 17-15.4 17-27.6V17.5L26 10z"
        fill="rgba(79,70,229,0.07)"
        stroke="rgba(99,102,241,0.2)"
        strokeWidth="1"
      />
      <path
        d="M17 31l7 7 11-11"
        stroke="#818cf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SecuritySection() {
  return (
    <section id="security" aria-label="Security" className="relative overflow-hidden bg-[#060c1a] py-28 md:py-40">

      {/* Atmospheric glow blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[700px] w-[1000px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-indigo-900/20 blur-[160px]" />
        <div className="absolute -bottom-32 right-[-8%] h-[450px] w-[550px] rounded-full bg-violet-900/12 blur-[130px]" />
        <div className="absolute -bottom-20 left-[-5%] h-[300px] w-[400px] rounded-full bg-indigo-800/10 blur-[100px]" />
      </div>

      {/* Faint engineering grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Shield */}
          <div className="mb-7 flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <ShieldMark />
            </motion.div>
          </div>

          {/* Eyebrow */}
          <p className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-indigo-400">
            Security Architecture
          </p>

          <h2 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Your members' money demands{' '}
            <span className="text-indigo-400">serious software.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            UnityFund is built with the security standards that financial operations require —
            not as an afterthought, but as a foundation.
          </p>

          {/* Trust seals */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {security.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/[0.08] px-5 py-2 text-sm font-semibold text-indigo-300 backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-20 flex items-center gap-5"
          aria-hidden
        >
          <div className="h-px flex-1 bg-white/[0.05]" />
          <span className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-white/20">
            Protected by design
          </span>
          <div className="h-px flex-1 bg-white/[0.05]" />
        </motion.div>

        {/* Bento feature grid */}
        <div className="mt-8 grid auto-rows-auto gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {security.features.map(({ icon, title, body }, i) => {
            const IconComponent = getIcon(icon);
            const num = String(i + 1).padStart(2, '0');
            const isFeatured = i === 0;

            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-32px' }}
                transition={{ duration: 0.55, delay: i * 0.075, ease: EASE }}
                className={[
                  'group relative overflow-hidden rounded-2xl p-7',
                  'border border-white/[0.07] bg-white/[0.025]',
                  'transition-all duration-300',
                  'hover:border-indigo-500/35 hover:bg-indigo-950/25',
                  'hover:shadow-[0_0_40px_-8px_rgba(79,70,229,0.15)]',
                  isFeatured ? 'sm:col-span-2 lg:col-span-2' : '',
                ].join(' ')}
              >
                {/* Top-edge highlight shimmer */}
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Number watermark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-5 top-4 select-none font-mono text-[4.5rem] font-black leading-none text-white/[0.035] transition-colors duration-300 group-hover:text-indigo-400/[0.07]"
                >
                  {num}
                </span>

                {/* Accent dot + extending line */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <div className="h-px w-5 bg-indigo-500/40 transition-all duration-500 ease-out group-hover:w-14 group-hover:bg-indigo-400/60" />
                </div>

                {/* Icon */}
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 transition-all duration-300 group-hover:border-indigo-400/35 group-hover:bg-indigo-500/18 group-hover:text-indigo-300">
                  <IconComponent className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </div>

                <h3 className="mb-2.5 text-base font-semibold leading-snug text-white">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {body}
                </p>

                {/* Featured card corner accent */}
                {isFeatured && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-tl-[2rem] border-l border-t border-indigo-500/[0.12] transition-colors duration-300 group-hover:border-indigo-400/20"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
