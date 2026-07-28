import { motion, useScroll, useSpring } from "motion/react";
import { useMotionEnabled } from "./use-motion-enabled";

/** Minimal vertical scroll-progress rail pinned to the bottom-left. */
export function ScrollRail() {
  const enabled = useMotionEnabled();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-10 left-6 z-[9998] hidden md:block"
    >
      <span className="block h-24 w-[1px] overflow-hidden bg-foreground/12">
        <motion.span
          className="block h-full w-full origin-top bg-foreground/70"
          style={{ scaleY, willChange: "transform" }}
        />
      </span>
    </div>
  );
}
