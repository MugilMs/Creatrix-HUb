import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom' | 'left' | 'right';
  onAnimationComplete?: () => void;
  className?: string;
}

export default function BlurText({
  text,
  delay = 100,
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
  className = '',
}: BlurTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const getInitialPosition = () => {
    switch (direction) {
      case 'top':
        return { y: -20 };
      case 'bottom':
        return { y: 20 };
      case 'left':
        return { x: -20 };
      case 'right':
        return { x: 20 };
      default:
        return { y: -20 };
    }
  };

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timeout = setTimeout(() => {
        setHasAnimated(true);
        onAnimationComplete?.();
      }, elements.length * delay + 500);
      return () => clearTimeout(timeout);
    }
  }, [isInView, hasAnimated, elements.length, delay, onAnimationComplete]);

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((element, index) => (
        <motion.span
          key={index}
          initial={{
            opacity: 0,
            filter: 'blur(10px)',
            ...getInitialPosition(),
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  filter: 'blur(0px)',
                  x: 0,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.5,
            delay: index * (delay / 1000),
            ease: 'easeOut',
          }}
          className={animateBy === 'words' ? 'mr-2' : ''}
        >
          {element}
        </motion.span>
      ))}
    </div>
  );
}
