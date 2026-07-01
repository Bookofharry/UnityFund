import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Shield, CheckCircle2, ClipboardList, LockKeyhole } from 'lucide-react';

export const authInputClass =
  'mt-1.5 block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export const authLabelClass = 'block text-sm font-medium text-navy-800';

export const authButtonClass =
  'w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const TRUST_POINTS = [
  { icon: Shield, label: 'Bank-grade security' },
  { icon: CheckCircle2, label: 'Nomba-verified payments' },
  { icon: ClipboardList, label: 'Full audit trails' },
];

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="10" cy="14" r="8" fill="#4f46e5" />
      <circle cx="18" cy="14" r="8" fill="#1a2b6e" />
      <circle cx="14" cy="14" r="5" fill="#818cf8" />
    </svg>
  );
}

const CHAR_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const charVariants: Variants = {
  hidden: { opacity: 0, y: 26, rotateX: -100, scale: 0.5, filter: 'blur(10px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { delay: i * 0.035, duration: 0.55, ease: CHAR_EASE },
  }),
};

function CinematicLabel({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-label={text} className={className} style={{ perspective: 700, display: 'inline-block' }}>
      <span aria-hidden="true" style={{ transformStyle: 'preserve-3d' }}>
        {text.split('').map((char, i) =>
          char === ' ' ? (
            <span key={i}> </span>
          ) : (
            <motion.span
              key={i}
              custom={i}
              variants={charVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
            >
              {char}
            </motion.span>
          )
        )}
      </span>
    </span>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f5f7ff]">
      {/* Left: trust panel */}
      <div className="relative hidden overflow-hidden border-r-4 border-gold-900 bg-gradient-to-br from-[#FBDC77] via-[#F7C948] to-[#E5B336] shadow-[inset_0_2px_16px_rgba(92,61,27,0.14)] lg:block lg:w-[54%]">
        {/* Soft ambient light */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-[520px] w-[520px] rounded-full bg-white/25 blur-[140px]" />
          <div className="absolute -bottom-32 -right-16 h-[420px] w-[420px] rounded-full bg-gold-900/10 blur-[120px]" />
        </div>

        {/* Fine grain texture for material depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: NOISE_BG }}
        />

        {/* Giant watermark mark */}
        <LockKeyhole
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-16 h-[26rem] w-[26rem] text-gold-900/[0.06]"
          strokeWidth={0.75}
        />

        <div className="relative flex h-full flex-col justify-center px-16">
          <motion.div {...fadeUp(0)}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <LogoMark />
              <span className="text-xl font-bold text-gold-900">UnityFund</span>
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="mt-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-900/20 bg-white/25 px-3.5 py-1.5 backdrop-blur-sm">
              <LockKeyhole className="h-3 w-3 text-gold-900" strokeWidth={2.5} aria-hidden="true" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-gold-900">
                Secured by Nomba
              </span>
            </span>
          </motion.div>

          <motion.h2
            {...fadeUp(0.18)}
            className="mt-6 max-w-md text-3xl font-bold leading-tight tracking-tight text-gold-900"
          >
            Every payment verified. Every naira accounted for.
          </motion.h2>

          <motion.p {...fadeUp(0.26)} className="mt-4 max-w-sm leading-relaxed text-gold-900/70">
            UnityFund runs on Nomba's licensed payment infrastructure. Every transaction is
            confirmed through cryptographically signed webhooks before it ever touches your books.
          </motion.p>

          <motion.div {...fadeUp(0.34)} className="mt-9 flex flex-wrap items-center gap-3">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-gold-900/20 bg-white/30 px-4 py-2 text-xs font-semibold text-gold-900 shadow-sm backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-gold-900" strokeWidth={2} aria-hidden="true" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex w-full flex-col justify-center px-6 py-16 lg:w-[46%] lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <CinematicLabel
            text="Access Account"
            className="font-mono text-xs font-bold uppercase tracking-[0.32em] text-indigo-600"
          />

          <motion.div {...fadeUp(0.08)} className="mt-10">
            <h1 className="text-2xl font-bold text-navy-800">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          </motion.div>

          <motion.div
            {...fadeUp(0.16)}
            className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(12,18,50,0.04),0_16px_48px_-12px_rgba(12,18,50,0.14)]"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
