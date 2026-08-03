import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { isVideo } from "@/lib/media";
import { DUR, EASE, viewportOnce } from "@/lib/motion";
import { useMotionEnabled } from "@/components/motion/use-motion-enabled";

export type GridTile = {
  id: string;
  title: string;
  category?: string | null;
  cover: string;
};

function Media({ src, alt }: { src: string; alt: string }) {
  const cls = "h-full w-full object-cover bg-white/5";
  return isVideo(src) ? (
    <video src={src} className={cls} muted loop playsInline autoPlay preload="metadata" />
  ) : (
    <img src={src} alt={alt} loading="lazy" decoding="async" className={cls} />
  );
}

/**
 * Calm editorial grid of full squares — every tile is the same size and
 * nothing scales or shrinks on hover. Shared by Portfolio and Studio.
 */
export function MediaGrid({
  items,
  onSelect,
}: {
  items: GridTile[];
  onSelect?: (item: GridTile, index: number) => void;
}) {
  const enabled = useMotionEnabled();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-10">
      {items.map((p, i) => {
        const inner = (
          <div className="relative aspect-square w-full overflow-hidden rounded-[22px]">
            <Media src={p.cover} alt={p.title} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <p
                className="line-clamp-2 text-sm normal-case tracking-normal md:text-base"
                style={{ fontFamily: "Jost, sans-serif", textShadow: "0 1px 10px rgba(0,0,0,0.75)" }}
              >
                {p.title}
              </p>
              <p
                className="mt-1 truncate text-[10px] uppercase tracking-[0.2em] text-foreground/70"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}
              >
                {p.category || "PROJECT"}
              </p>
            </div>
          </div>
        );

        return (
          <motion.div
            key={p.id}
            initial={enabled ? { opacity: 0, y: 40 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: DUR.slow, ease: EASE, delay: (i % 3) * 0.08 }}
            style={{ willChange: "transform, opacity" }}
          >
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(p, i)}
                aria-label={p.title}
                className="block w-full text-left"
              >
                {inner}
              </button>
            ) : (
              <Link
                to="/project/$projectId"
                params={{ projectId: p.id }}
                aria-label={p.title}
                className="block w-full"
              >
                {inner}
              </Link>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}