import { useEffect } from "react";
import Lenis from "lenis";
import { useMotionEnabled } from "./use-motion-enabled";

/**
 * Inertial smooth scrolling (momentum + eased wheel) applied to the window.
 * Disabled entirely when reduced motion is requested.
 */
export function SmoothScroll() {
  const enabled = useMotionEnabled();

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);

  return null;
}