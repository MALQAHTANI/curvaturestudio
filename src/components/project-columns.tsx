import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { DUR, EASE, tileIn } from "@/lib/motion";
import { viewportOnce } from "@/lib/motion";
import { isVideo } from "@/lib/media";
import { useMotionEnabled } from "@/components/motion/use-motion-enabled";

export type ColumnProject = {
  id: string;
  title: string;
  category?: string | null;
  cover: string;
};

function Media({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return isVideo(src) ? (
    <motion.video
      src={src}
      className={className}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DUR.slow, ease: EASE }}
    />
  ) : (
    <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />
  );
}

/**
 * Six very narrow vertical columns on desktop. Hovering one expands it
 * horizontally while its neighbours shrink; tablet/mobile falls back to
 * stacked cards.
 */
export function ProjectColumns({ items }: { items: ColumnProject[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const enabled = useMotionEnabled();

  return (
    <>
      {/* Desktop: expanding columns */}
      <div
        className="hidden lg:flex h-[72vh] w-full gap-[3px]"
        onMouseLeave={() => setHovered(null)}
      >
        {items.map((p, i) => {
          const isOn = hovered === i;
          const grow = hovered === null ? 1 : isOn ? 3.2 : 0.78;
          return (
            <motion.div
              key={p.id}
              className="relative min-w-0 overflow-hidden rounded-[18px]"
              onMouseEnter={() => setHovered(i)}
              initial={enabled ? { opacity: 0, y: 50, scale: 0.96 } : false}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={viewportOnce}
              animate={{ flexGrow: grow }}
              transition={{
                duration: DUR.slow,
                ease: EASE,
                delay: enabled ? 0.06 + i * 0.08 : 0,
                flexGrow: { duration: DUR.slow, ease: EASE, delay: 0 },
              }}
              style={{ flexBasis: 0, flexGrow: 1, willChange: "flex-grow" }}
            >
              <Link
                to="/project/$projectId"
                params={{ projectId: p.id }}
                data-cursor="View"
                className="group block h-full w-full"
                aria-label={p.title}
              >
                <motion.div
                  className="h-full w-full"
                  animate={{ scale: isOn ? 1.06 : 1 }}
                  transition={{ duration: DUR.slow, ease: EASE }}
                  style={{ willChange: "transform" }}
                >
                  <Media src={p.cover} alt={p.title} className="h-full w-full object-cover bg-white/5" />
                </motion.div>
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent"
                  animate={{ opacity: isOn ? 1 : 0.35 }}
                  transition={{ duration: DUR.medium ?? DUR.base, ease: EASE }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-x-0 bottom-0 p-6"
                  animate={enabled ? { opacity: isOn ? 1 : 0, y: isOn ? 0 : 20 } : { opacity: 1 }}
                  transition={{ duration: DUR.base, ease: EASE }}
                >
                  <p
                    className="truncate text-sm text-foreground normal-case tracking-normal"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    {p.title}
                  </p>
                  <motion.p
                    className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                    animate={enabled ? { opacity: isOn ? 1 : 0 } : { opacity: 1 }}
                    transition={{ duration: DUR.base, ease: EASE, delay: isOn ? 0.15 : 0 }}
                  >
                    {p.category || "PROJECT"}
                  </motion.p>
                </motion.div>
                {/* Vertical label while collapsed */}
                <motion.span
                  className="pointer-events-none absolute bottom-6 left-1/2 origin-bottom -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.25em] text-foreground/80"
                  style={{ writingMode: "vertical-rl", rotate: "180deg" }}
                  animate={{ opacity: isOn ? 0 : 1 }}
                  transition={{ duration: DUR.base, ease: EASE }}
                >
                  {p.title}
                </motion.span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Tablet / mobile: stacked cards */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:hidden">
        {items.map((p) => (
          <Link
            key={p.id}
            to="/project/$projectId"
            params={{ projectId: p.id }}
            className="group block overflow-hidden rounded-[18px]"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Media
                src={p.cover}
                alt={p.title}
                className="h-full w-full object-cover bg-white/5 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="truncate text-sm normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
                  {p.title}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {p.category || "PROJECT"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}