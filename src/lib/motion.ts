import type { Transition, Variants } from "motion/react";

/** Premium easing used site-wide. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Unified timing scale: default / medium / large / hero. */
export const DUR: { fast: number; base: number; slow: number; hero: number } = {
  fast: 0.25,
  base: 0.45,
  slow: 0.7,
  hero: 0.9,
};

export const transition = (duration: number = DUR.base, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE,
});

/** Site-wide spring physics (stiffness 180 / damping 24 / mass 0.8). */
export const SPRING = { type: "spring", stiffness: 180, damping: 24, mass: 0.8 } as const;

/** Soft parallax spring used for scroll-linked drift. */
export const DRIFT_SPRING = { stiffness: 90, damping: 22, mass: 0.4 } as const;

/** Top-to-bottom clip mask reveal, paired with fade + rise. */
export const maskReveal: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.96, clipPath: "inset(100% 0% 0% 0%)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.9, ease: EASE },
  },
};

/** Fade + translateY reveal (GPU-only properties). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: transition(DUR.slow) },
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

/** Per-character mask reveal (20ms stagger applied by the parent). */
export const charUp: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: transition(DUR.slow) },
};

/** Card / tile entrance: opacity 0→1, y 50→0, scale .96→1 over 700ms. */
export const tileIn: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: transition(DUR.slow) },
};

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const viewportOnce = { once: true, amount: 0.2, margin: "0px 0px -10% 0px" } as const;