import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE } from "@/lib/motion";
import { useMotionEnabled } from "./use-motion-enabled";

/** Cross-fades route content so navigation never feels like a reload. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const enabled = useMotionEnabled();

  if (!enabled) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: DUR.fast, ease: EASE }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}