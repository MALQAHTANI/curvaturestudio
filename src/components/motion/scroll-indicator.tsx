import { motion, useScroll, useTransform } from "motion/react";
import { useMotionEnabled } from "./use-motion-enabled";

/** Bottom-centred hero scroll cue that fades away on first scroll. */
export function ScrollIndicator() {
  const enabled = useMotionEnabled();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 180], [1, 0]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3"
      style={{ opacity }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.8 }}
    >
      <span className="text-[9px] tracking-[0.3em] text-muted-foreground">SCROLL</span>
      <span className="relative block h-10 w-[1px] overflow-hidden bg-foreground/15">
        <span className="scroll-hint-dot absolute inset-x-0 top-0 block h-4 bg-foreground/70" />
      </span>
    </motion.div>
  );
}
