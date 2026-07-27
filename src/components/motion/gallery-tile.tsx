import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { isVideo } from "@/lib/media";
import { DRIFT_SPRING, EASE, SPRING } from "@/lib/motion";
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
  const y = useSpring(raw, DRIFT_SPRING);

  // Subtle 3D tilt following the pointer.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), SPRING);

  const onPointerMove = (e: React.MouseEvent) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - (r.left + r.width / 2)) / r.width);
    py.set((e.clientY - (r.top + r.height / 2)) / r.height);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

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
      className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-5 pb-5 pt-16 backdrop-blur-[1px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0 }}
      variants={{ hovered: { opacity: 1 } }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {category && (
        <motion.span
          className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0, y: 12 }}
          variants={{ hovered: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
        >
          {category}
        </motion.span>
      )}
      <motion.span
        className="block text-xs md:text-sm text-foreground"
        initial={{ y: 18, opacity: 0.85 }}
        animate={{ y: 18, opacity: 0.85 }}
        variants={{ hovered: { y: 0, opacity: 1 } }}
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
      onMouseMove={onPointerMove}
      onMouseLeave={onPointerLeave}
      className={className}
      initial={enabled ? { opacity: 0, y: 80, scale: 0.95, clipPath: "inset(100% 0% 0% 0%)" } : false}
      whileInView={
        enabled ? { opacity: 1, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" } : undefined
      }
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      whileHover={enabled ? "hovered" : undefined}
      animate={enabled ? undefined : { opacity: 1 }}
      style={{ willChange: "transform, opacity", perspective: 1200 }}
    >
      <motion.span
        className="relative block overflow-hidden rounded-[20px] bg-foreground/[0.04]"
        style={enabled ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
        variants={{
          hovered: {
            y: -10,
            boxShadow:
              "0 8px 20px -12px rgba(0,0,0,0.6), 0 30px 60px -24px rgba(0,0,0,0.75), 0 60px 120px -40px rgba(0,0,0,0.85)",
          },
        }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {media}
        {overlay}
      </motion.span>
    </motion.button>
  );
}
