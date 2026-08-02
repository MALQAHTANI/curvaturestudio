import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { Lightbox, type LightboxItem } from "@/components/lightbox";
import { isVideo } from "@/lib/media";
import { DUR, EASE } from "@/lib/motion";
import { useClientProjects } from "@/lib/use-client-projects";

export const Route = createFileRoute("/clients/$clientId")({
  head: () => ({
    meta: [
      { title: "Client Case Study — Curvature Studio" },
      {
        name: "description",
        content:
          "Inside a Curvature Studio client collaboration — the brief, the challenge, our solution and the results.",
      },
      { property: "og:title", content: "Client Case Study — Curvature Studio" },
      {
        property: "og:description",
        content: "The brief, the challenge, our solution and the results of a Curvature Studio production.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientCaseStudy,
  notFoundComponent: () => (
    <div className="p-12 text-[12px] text-muted-foreground">CLIENT NOT FOUND.</div>
  ),
});

function Media({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return isVideo(src) ? (
    <video src={src} className={className} muted loop playsInline autoPlay preload="metadata" />
  ) : (
    <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div
        className="mt-4 text-muted-foreground normal-case tracking-normal"
        style={{ fontFamily: "Jost, sans-serif", fontSize: "15px", lineHeight: 1.75 }}
      >
        {children}
      </div>
    </div>
  );
}

function ClientCaseStudy() {
  const { clientId } = Route.useParams();
  const { items, loading } = useClientProjects();
  const project = useMemo(() => items.find((p) => p.id === clientId), [items, clientId]);
  const [active, setActive] = useState<LightboxItem | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  const gallery = (project?.media ?? []).filter((m) => m !== project?.cover);
  const service = project?.services?.length ? project.services.join(", ") : project?.category || "Production";
  const name = project?.client || project?.title || (loading ? "LOADING…" : "CLIENT");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Large cover */}
      <section className="relative h-[86svh] w-full overflow-hidden">
        {project?.cover && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
            style={{ willChange: "transform, opacity" }}
          >
            <Media src={project.cover} alt={project.title} className="h-full w-full object-cover" />
          </motion.div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/60" />
        <div className="absolute inset-x-0 bottom-0 px-6 md:px-12 pb-16 md:pb-24">
          <motion.p
            className="mb-5 text-[11px] text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.base, ease: EASE, delay: 0.3 }}
          >
            {project?.category || "CLIENT"}
          </motion.p>
          <RevealLines className="text-3xl md:text-5xl" lines={[name]} delay={0.45} />
        </div>
      </section>

      {/* Case study */}
      <section className="border-t border-border px-6 md:px-12 py-24 md:py-36">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-10">CASE STUDY</p>
        </Reveal>
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="space-y-12">
            <Reveal>
              <Block label="About the client">
                <p className="max-w-2xl">
                  {project?.description ||
                    `${name} partnered with Curvature Studio to translate their brand into moving image.`}
                </p>
              </Block>
            </Reveal>
            <Reveal delay={0.08}>
              <Block label="The challenge">
                <p className="max-w-2xl">
                  Deliver a {(project?.category || "brand").toLowerCase()} story that reads instantly on
                  screen — a tight production window, a single visual language, and frames strong enough
                  to carry the brand across every channel.
                </p>
              </Block>
            </Reveal>
            <Reveal delay={0.16}>
              <Block label="Our solution">
                <p className="max-w-2xl">
                  Full in-house production: art direction, {service.toLowerCase()}, and a controlled
                  grade that keeps contrast, texture and motion consistent from the first frame to the
                  final cut.
                </p>
              </Block>
            </Reveal>
            <Reveal delay={0.24}>
              <Block label="Results">
                <p className="max-w-2xl">
                  A complete, channel-ready library of {project?.media.length ?? 0} finished assets —
                  delivered on schedule and reused across campaign, social and retail placements.
                </p>
              </Block>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="grid grid-cols-2 gap-x-8 gap-y-10 self-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Client</p>
              <p className="mt-2 text-[14px] normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
                {name}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Project</p>
              <p className="mt-2 text-[14px] normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
                {project?.title || "—"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Services used</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(project?.services?.length ? project.services : [project?.category || "Production"]).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            {!!project?.tools?.length && (
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tools</p>
                <p className="mt-2 text-[14px] normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
                  {project.tools.join(", ")}
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="border-t border-border px-6 md:px-12 py-24 md:py-36">
          <Reveal>
            <p className="text-[11px] text-muted-foreground mb-12">GALLERY</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {gallery.map((src, i) => (
              <motion.button
                key={src + i}
                type="button"
                onClick={() => {
                  setStartIndex(i);
                  setActive({
                    title: name,
                    category: project?.category ?? "CLIENT",
                    images: gallery,
                  });
                }}
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[22px] bg-foreground/[0.04] text-left"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
                transition={{ duration: DUR.slow, ease: EASE, delay: (i % 3) * 0.08 }}
                style={{ willChange: "transform, opacity" }}
              >
                <Media
                  src={src}
                  alt={`${name} — frame ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-border px-6 md:px-12 py-24 text-center">
        <Reveal>
          <Link to="/clients" className="text-[11px] border-b border-foreground pb-1">
            ALL CLIENTS & PROJECTS ↗
          </Link>
        </Reveal>
      </section>

      <Lightbox item={active} startIndex={startIndex} onClose={() => setActive(null)} />
      <SiteFooter />
    </div>
  );
}