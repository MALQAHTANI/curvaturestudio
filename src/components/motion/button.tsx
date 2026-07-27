import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { DUR, transition } from "@/lib/motion";
import { useMotionEnabled } from "./use-motion-enabled";

const MotionLink = motion.create(Link);

function useMagnetic(strength: number, enabled: boolean) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.3 });
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(((e.clientX - (r.left + r.width / 2)) / r.width) * strength);
    y.set(((e.clientY - (r.top + r.height / 2)) / r.height) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, style: { x: sx, y: sy }, onMove, onLeave };
}

type Common = {
  children: ReactNode;
  className?: string;
  magnetic?: boolean;
  strength?: number;
};

/** Magnetic, scale-on-hover link styled by the caller. */
export function MotionNavLink({
  to,
  children,
  className,
  magnetic = true,
  strength = 18,
  ...rest
}: Common & { to: string } & Record<string, unknown>) {
  const enabled = useMotionEnabled();
  const m = useMagnetic(strength, enabled && magnetic);

  if (!enabled) {
    return (
      <Link to={to} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <MotionLink
      to={to}
      ref={m.ref as never}
      className={cn("cursor-pointer", className)}
      onMouseMove={m.onMove}
      onMouseLeave={m.onLeave}
      style={{ ...m.style, willChange: "transform" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={transition(DUR.fast)}
      {...rest}
    >
      {children}
    </MotionLink>
  );
}

/** Magnetic, scale-on-hover button. */
export function MotionButton({
  children,
  className,
  magnetic = true,
  strength = 14,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const enabled = useMotionEnabled();
  const m = useMagnetic(strength, enabled && magnetic);

  if (!enabled) {
    return (
      <button className={className} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={m.ref as never}
      className={cn("cursor-pointer", className)}
      onMouseMove={m.onMove}
      onMouseLeave={m.onLeave}
      style={{ ...m.style, willChange: "transform" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={transition(DUR.fast)}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}