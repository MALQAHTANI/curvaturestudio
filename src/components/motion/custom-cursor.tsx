import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { EASE } from "@/lib/motion";
import { useMotionEnabled } from "./use-motion-enabled";

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary, [data-cursor], img, video';

export function CustomCursor() {
  const enabled = useMotionEnabled();
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Outer ring trails the dot slightly.
  const sx = useSpring(x, { stiffness: 300, damping: 32, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 300, damping: 32, mass: 0.5 });

  useEffect(() => {
    setSupported(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!supported || !enabled) return;
    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = e.target as HTMLElement | null;
      const target = el?.closest?.(INTERACTIVE) as HTMLElement | null;
      const labelled = el?.closest?.("[data-cursor]") as HTMLElement | null;
      setActive(!!target);
      setLabel(labelled?.dataset?.cursor ?? null);
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [supported, enabled, x, y]);

  if (!supported || !enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <motion.div
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-foreground/70 backdrop-blur-[2px]"
        style={{
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
          width: 26,
          height: 26,
        }}
        animate={{
          scale: (label ? 3.4 : active ? 1.3 : 1) * (pressed ? 0.82 : 1),
          opacity: visible ? 1 : 0,
          borderColor: active || label ? "var(--foreground)" : "color-mix(in oklab, var(--foreground) 45%, transparent)",
          backgroundColor: label
            ? "color-mix(in oklab, var(--background) 78%, transparent)"
            : "color-mix(in oklab, var(--foreground) 6%, transparent)",
        }}
        transition={{ duration: 0.25, ease: EASE }}
      >
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 flex w-28 items-center justify-center"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%", willChange: "transform" }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="text-center text-[10px] uppercase leading-[1.4] tracking-[0.24em] text-foreground"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 h-1 w-1 rounded-full bg-foreground"
        style={{ x, y, translateX: "-50%", translateY: "-50%", willChange: "transform" }}
        animate={{ opacity: visible && !label ? 1 : 0, scale: pressed ? 0.6 : 1 }}
        transition={{ duration: 0.2, ease: EASE }}
      />
    </div>
  );
}