import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { DUR, transition, viewportOnce } from "@/lib/motion";
import { useMotionEnabled } from "./use-motion-enabled";

/** Gentle parallax container driven by scroll progress. */
export function Parallax({
  children,
  className,
  distance = 40,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useMotionEnabled();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(raw, { stiffness: 90, damping: 22, mass: 0.4 });

  return (
    <div ref={ref} className={className} style={style}>
      <motion.div style={enabled ? { y, willChange: "transform" } : undefined}>{children}</motion.div>
    </div>
  );
}

/**
 * Image that fades + scales in on scroll, drifts gently with parallax
 * and zooms subtly on hover.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  distance = 24,
  hoverZoom = 1.05,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  distance?: number;
  hoverZoom?: number;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useMotionEnabled();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(raw, { stiffness: 90, damping: 22, mass: 0.4 });

  if (!enabled) {
    return (
      <div ref={ref} className={cn("overflow-hidden", className)}>
        <img src={src} alt={alt} loading="lazy" decoding="async" className={imgClassName} />
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewportOnce}
      transition={transition(DUR.slow)}
      whileHover="hovered"
      style={{ willChange: "transform, opacity" }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={imgClassName}
        style={{ y, willChange: "transform" }}
        variants={{ hovered: { scale: hoverZoom } }}
        transition={transition(DUR.slow)}
      />
      {children}
    </motion.div>
  );
}