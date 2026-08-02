import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { isVideo } from "@/lib/media";
import { DUR, EASE, viewportOnce } from "@/lib/motion";
import { useMotionEnabled } from "@/components/motion/use-motion-enabled";
import type { ClientProject } from "@/lib/use-client-projects";

function Media({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return isVideo(src) ? (
    <video src={src} className={className} muted loop playsInline autoPlay preload="metadata" />
  ) : (
    <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />
  );
}

/**
 * Large editorial client card — cover media, client name, short brief and
 * the service delivered. Reveals on scroll, lifts and zooms on hover.
 */
export function ClientCard({
  project,
  index = 0,
  aspect = "aspect-[4/5]",
}: {
  project: ClientProject;
  index?: number;
  aspect?: string;
}) {
  const enabled = useMotionEnabled();
  const service = project.services?.[0] || project.category || "PRODUCTION";

  return (
    <motion.article
      initial={enabled ? { opacity: 0, y: 50, scale: 0.97 } : false}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={viewportOnce}
      transition={{ duration: DUR.slow, ease: EASE, delay: (index % 3) * 0.09 }}
      style={{ willChange: "transform, opacity" }}
      className="group"
    >
      <Link
        to="/clients/$clientId"
        params={{ clientId: project.id }}
        aria-label={`${project.client || project.title} — view case study`}
        className="block"
      >
        <div
          className={`relative w-full overflow-hidden rounded-[22px] bg-foreground/[0.04] ${aspect} transition-shadow duration-500 group-hover:shadow-[0_40px_90px_-40px_rgba(0,0,0,0.85)]`}
        >
          <Media
            src={project.cover}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
          <span className="absolute left-5 top-5 rounded-full border border-foreground/25 bg-background/40 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-foreground/85 backdrop-blur-sm">
            {service}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <p
              className="text-sm md:text-base normal-case tracking-normal line-clamp-1"
              style={{ fontFamily: "Jost, sans-serif", textShadow: "0 1px 10px rgba(0,0,0,0.75)" }}
            >
              {project.client || project.title}
            </p>
            {project.description && (
              <p
                className="mt-2 max-w-md text-[12px] normal-case tracking-normal text-foreground/75 line-clamp-2"
                style={{ fontFamily: "Jost, sans-serif", textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}
              >
                {project.description}
              </p>
            )}
            <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.22em] text-foreground/70 transition-colors duration-300 group-hover:text-foreground">
              View case study ↗
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}