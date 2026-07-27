import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { DUR, EASE } from "@/lib/motion";
import { useMotionEnabled } from "./use-motion-enabled";

/**
 * Cross-fades route content and sweeps a soft veil across the viewport
 * so navigation reads as a continuous scene change, never a reload.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  const enabled = useMotionEnabled();

  // Always land at the top of a new scene.
  useEffect(() => {
    if (!enabled) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="veil"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[9997] origin-bottom bg-background"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0, originY: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ willChange: "transform" }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } }}
          exit={{ opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.35, ease: EASE } }}
          transition={{ duration: DUR.fast, ease: EASE }}
          style={{ willChange: "transform, opacity" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}