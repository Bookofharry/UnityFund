import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';

type LetterConfig = {
  char: string;
  className: string;
  depth: number;
  floatDuration: number;
  floatDelay: number;
};

const LETTERS: LetterConfig[] = [
  { char: 'U', className: '-left-16 -top-10 text-[24rem] md:text-[32rem]', depth: 16, floatDuration: 9, floatDelay: 0 },
  { char: 'F', className: '-right-20 bottom-[-4rem] text-[20rem] md:text-[28rem]', depth: 26, floatDuration: 11, floatDelay: 1.4 },
];

function usePointer() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      x.set((e.clientX / window.innerWidth - 0.5) * 2);
      y.set((e.clientY / window.innerHeight - 0.5) * 2);
    }
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [x, y]);

  return { x, y };
}

function FloatingLetter({
  letter,
  pointer,
}: {
  letter: LetterConfig;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
}) {
  const px = useTransform(pointer.x, (v) => v * letter.depth);
  const py = useTransform(pointer.y, (v) => v * letter.depth);
  const springX = useSpring(px, { stiffness: 40, damping: 20, mass: 0.6 });
  const springY = useSpring(py, { stiffness: 40, damping: 20, mass: 0.6 });

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none font-black leading-none text-navy-900/[0.035] ${letter.className}`}
      style={{ x: springX, y: springY }}
    >
      <motion.span
        className="block"
        animate={{ y: [0, -20, 0], scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: letter.floatDuration,
          delay: letter.floatDelay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {letter.char}
      </motion.span>
    </motion.div>
  );
}

export function FloatingLetters() {
  const pointer = usePointer();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {LETTERS.map((letter) => (
        <FloatingLetter key={letter.char} letter={letter} pointer={pointer} />
      ))}
    </div>
  );
}
