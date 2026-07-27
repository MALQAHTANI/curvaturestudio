import { motion, useScroll, useSpring } from "motion/react";
import { useMotionEnabled } from "./use-motion-enabled";

/** Thin top progress bar tracking document scroll. */
export function ScrollProgress() {
  const enabled = useMotionEnabled();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-[9998] h-[2px] w-full origin-left bg-foreground/70"
      style={{ scaleX, willChange: "transform" }}
    />
  );
}