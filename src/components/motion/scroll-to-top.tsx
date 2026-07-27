import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { EASE, SPRING } from "@/lib/motion";
import { useMotionEnabled } from "./use-motion-enabled";

/** Appears past 600px of scroll and glides the page back to the top. */
export function ScrollToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  const enabled = useMotionEnabled();
  useMotionValueEvent(scrollY, "change", (v) => setShow(v > 600));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Scroll back to top"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: enabled ? "smooth" : "auto" })
          }
          className="fixed bottom-6 right-6 z-[80] grid h-11 w-11 place-items-center rounded-full border border-border bg-background/70 text-[11px] text-foreground backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 12 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          transition={enabled ? SPRING : { duration: 0.3, ease: EASE }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}
