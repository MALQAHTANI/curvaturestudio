import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";

/** Brief branded loading veil — under one second, fades in and out. */
export function PageLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 850);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          aria-hidden
        >
          <motion.span
            className="text-[15px] font-medium tracking-tight text-foreground"
            style={{ fontFamily: "Jost, sans-serif", letterSpacing: "-0.01em" }}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: [0, 1, 1], y: [10, 0, 0], scale: [0.96, 1, 1.04] }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.8, ease: EASE, times: [0, 0.35, 1] }}
          >
            Curvature Studio
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}