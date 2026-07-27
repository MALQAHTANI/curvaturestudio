import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { isVideo } from "@/lib/media";
import { EASE } from "@/lib/motion";
import { useMotionEnabled } from "./use-motion-enabled";

/**
 * Premium editorial gallery tile:
 * reveal (opacity 0→1, y 60→0, scale .95→1) once on scroll,
 * gentle parallax drift, hover zoom 1.08 + lift + soft shadow + overlay.
 * Transform/opacity only — GPU accelerated.
 */
export function GalleryTile({
  src,
  title,
  category,
  index = 0,
  onOpen,
  className,
  mediaClassName = "w-full h-auto object-contain",
  footer,
}: {
  src: string;
  title: string;
  category?: string;
  index?: number;
  onOpen?: () => void;
  className?: string;
  mediaClassName?: string;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const enabled = useMotionEnabled();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const y = useSpring(raw, { stiffness: 90, damping: 22, mass: 0.4 });

  const delay = Math.min(index % 6, 5) * 0.12; // 120ms stagger

  const media = isVideo(src) ? (
    <motion.video
      src={src}
      className={mediaClassName}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      style={enabled ? { y, willChange: "transform" } : undefined}
      variants={{ hovered: { scale: 1.08 } }}
      transition={{ duration: 0.7, ease: EASE }}
    />
  ) : (
    <motion.img
      src={src}
      alt={title}
      loading="lazy"
      decoding="async"
      className={mediaClassName}
      style={enabled ? { y, willChange: "transform" } : undefined}
      variants={{ hovered: { scale: 1.08 } }}
      transition={{ duration: 0.7, ease: EASE }}
    />
  );

  const overlay = (
    <motion.span
      className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-4 pb-4 pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0 }}
      variants={{ hovered: { opacity: 1 } }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {category && (
        <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{category}</span>
      )}
      <motion.span
        className="block text-xs md:text-sm text-foreground"
        initial={{ y: 8 }}
        animate={{ y: 8 }}
        variants={{ hovered: { y: 0 } }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ fontFamily: "Jost, sans-serif" }}
      >
        {title}
      </motion.span>
      {footer}
    </motion.span>
  );

  return (
    <motion.button
      ref={ref}
      type="button"
      data-cursor="View Project"
      aria-label={`Open gallery: ${title}`}
      onClick={onOpen}
      className={className}
      initial={enabled ? { opacity: 0, y: 60, scale: 0.95 } : false}
      whileInView={enabled ? { opacity: 1, y: 0, scale: 1 } : undefined}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      whileHover={enabled ? "hovered" : undefined}
      animate={enabled ? undefined : { opacity: 1 }}
      style={{ willChange: "transform, opacity" }}
    >
      <motion.span
        className="relative block overflow-hidden rounded-2xl"
        variants={{ hovered: { y: -8, boxShadow: "0 30px 70px -20px rgba(0,0,0,0.9)" } }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {media}
        {overlay}
      </motion.span>
    </motion.button>
  );
}
