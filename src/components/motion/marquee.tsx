import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMotionEnabled } from "./use-motion-enabled";

/** Seamless infinite horizontal marquee (transform-only). */
export function Marquee({
  children,
  speed = 40,
  className,
  itemClassName,
}: {
  children: ReactNode[];
  speed?: number;
  className?: string;
  itemClassName?: string;
}) {
  const enabled = useMotionEnabled();
  const track = (
    <div className={cn("flex shrink-0 items-center", itemClassName)} aria-hidden={false}>
      {children}
    </div>
  );

  if (!enabled) {
    return <div className={cn("flex overflow-hidden", className)}>{track}</div>;
  }

  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        style={{ willChange: "transform" }}
      >
        {track}
        <div className={cn("flex shrink-0 items-center", itemClassName)} aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}