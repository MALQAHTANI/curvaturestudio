import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Motion is disabled when the OS asks for reduced motion or when the
 * site accessibility widget toggles `html.a11y-reduce-motion`.
 */
export function useMotionEnabled() {
  const prefersReduced = useReducedMotion();
  const [a11yReduced, setA11yReduced] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setA11yReduced(root.classList.contains("a11y-reduce-motion"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return !prefersReduced && !a11yReduced;
}