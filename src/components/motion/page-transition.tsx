import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Always land at the top of a new scene.
  useEffect(() => {
    if (!enabled) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <>
      <AnimatePresence>
        {mounted && isLoading && (
          <motion.div
            key="veil"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[9997] bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.slow, ease: EASE }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, scale: 1.015, filter: "blur(10px)" }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: { duration: DUR.slow, ease: EASE },
          }}
          exit={{
            opacity: 0,
            scale: 0.985,
            filter: "blur(10px)",
            transition: { duration: DUR.slow, ease: EASE },
          }}
          style={{ willChange: "transform, opacity" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}