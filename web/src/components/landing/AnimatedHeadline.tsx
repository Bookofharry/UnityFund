import { motion, type Variants } from 'framer-motion';

const CHAR_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const STAGGER = 0.022;
const BASE_DELAY = 0.05;

const charVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 46,
    rotateX: -100,
    scale: 0.4,
    filter: 'blur(14px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      delay: BASE_DELAY + i * STAGGER,
      duration: 0.65,
      ease: CHAR_EASE,
    },
  }),
};

function AnimatedChars({
  text,
  startIndex,
  className,
}: {
  text: string;
  startIndex: number;
  className?: string;
}) {
  return (
    <>
      {text.split('').map((char, i) =>
        char === ' ' ? (
          <span key={startIndex + i}> </span>
        ) : (
          <motion.span
            key={startIndex + i}
            custom={startIndex + i}
            variants={charVariants}
            initial="hidden"
            animate="visible"
            className={className}
            style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
          >
            {char}
          </motion.span>
        )
      )}
    </>
  );
}

export function AnimatedHeadline({
  lines,
  className,
  accentClassName,
}: {
  lines: [string, string];
  className?: string;
  accentClassName?: string;
}) {
  const [line1, line2] = lines;
  const lastSpace = line2.lastIndexOf(' ');
  const line2Head = line2.slice(0, lastSpace);
  const line2Tail = line2.slice(lastSpace + 1);

  return (
    <h1 aria-label={`${line1} ${line2}`} className={className} style={{ perspective: 900 }}>
      <span aria-hidden="true" style={{ transformStyle: 'preserve-3d' }}>
        <AnimatedChars text={line1} startIndex={0} />
        <br />
        <AnimatedChars text={line2Head} startIndex={line1.length} className={accentClassName} />
        <span> </span>
        <br className="sm:hidden" />
        <AnimatedChars
          text={line2Tail}
          startIndex={line1.length + line2Head.length + 1}
          className={accentClassName}
        />
      </span>
    </h1>
  );
}
