import type { Transition, Variants } from "motion/react";

/** Premium easing used site-wide. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DUR: { fast: number; base: number; slow: number } = {
  fast: 0.5,
  base: 0.65,
  slow: 0.8,
};

export const transition = (duration: number = DUR.base, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE,
});

/** Fade + translateY reveal (GPU-only properties). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: transition(DUR.base) },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition(DUR.base) },
};

/** Line-by-line heading reveal (used with a clipping wrapper). */
export const lineUp: Variants = {
  hidden: { opacity: 0, y: "110%" },
  visible: { opacity: 1, y: "0%", transition: transition(DUR.slow) },
};

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const viewportOnce = { once: true, amount: 0.2, margin: "0px 0px -10% 0px" } as const;