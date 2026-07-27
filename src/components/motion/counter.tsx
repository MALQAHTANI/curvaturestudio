import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useMotionEnabled } from "./use-motion-enabled";

/** Counts from 0 to `value` once the element becomes visible. */
export function Counter({
  value,
  duration = 1.4,
  className,
  suffix = "",
  prefix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const enabled = useMotionEnabled();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (!enabled) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, enabled, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}