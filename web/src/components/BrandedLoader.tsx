import { useEffect, useId, useState } from 'react';

const SIZES = {
  sm: { box: 48, stroke: 4, text: 'text-[11px]' },
  md: { box: 72, stroke: 5, text: 'text-sm' },
  lg: { box: 96, stroke: 6, text: 'text-base' },
} as const;

type LoaderSize = keyof typeof SIZES;

// Most operations here (API calls) don't report real progress, so this
// simulates it: ramps quickly, eases off, and holds just under 100% for as
// long as the caller keeps this mounted. The caller unmounting it (the real
// operation finishing) IS the completion signal — there's no fake "100%" flash.
function useSimulatedProgress(cap = 94): number {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPercent((p) => (p >= cap ? cap : p + (cap - p) * 0.12 + 0.4));
    }, 90);
    return () => clearInterval(id);
  }, [cap]);

  return Math.min(cap, Math.round(percent));
}

export function BrandedLoader({ size = 'md' }: { size?: LoaderSize }) {
  const percent = useSimulatedProgress();
  const gradientId = `branded-loader-gradient-${useId()}`;
  const { box, stroke, text } = SIZES[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: box, height: box }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading"
    >
      <svg width={box} height={box} className="-rotate-90">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-100"
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 90ms linear' }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`absolute font-bold tabular-nums tracking-tight text-indigo-700 ${text}`}>
        {percent}%
      </span>
    </div>
  );
}

export function BrandedLoaderBlock({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
}: {
  message?: string;
  size?: LoaderSize;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={
        fullScreen
          ? 'flex min-h-screen flex-col items-center justify-center gap-3'
          : 'mt-12 flex flex-col items-center gap-3'
      }
    >
      <BrandedLoader size={size} />
      {message && <p className="text-sm text-gray-400">{message}</p>}
    </div>
  );
}
