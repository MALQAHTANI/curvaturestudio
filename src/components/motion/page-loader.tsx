import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import logoSrc from "@/assets/logo.png";

/**
 * First-load curtain: logo fades in, a hairline progress rule grows
 * beneath it, then the logo scales down as the background fades away.
 */
export function PageLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6 bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          aria-hidden
        >
          <motion.img
            src={logoSrc}
            alt=""
            width={896}
            height={220}
            className="h-8 w-auto mix-blend-screen md:h-10"
            initial={{ opacity: 0, y: 12, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.9, ease: EASE }}
            style={{ willChange: "transform, opacity" }}
          />
          <span className="block h-[1px] w-[140px] overflow-hidden bg-foreground/15">
            <motion.span
              className="block h-full w-full origin-left bg-foreground/80"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: EASE }}
              style={{ willChange: "transform" }}
            />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}