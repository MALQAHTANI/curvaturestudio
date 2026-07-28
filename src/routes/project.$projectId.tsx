import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { isVideo, mediaSrc } from "@/lib/media";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { Lightbox, type LightboxItem } from "@/components/lightbox";
import { DUR, EASE } from "@/lib/motion";

export const Route = createFileRoute("/project/$projectId")({
  head: () => ({
    meta: [
      { title: "Project — Curvature Studio" },
      { name: "description", content: "A closer look at a Curvature Studio production — story, craft and frames." },
      { property: "og:title", content: "Project — Curvature Studio" },
      { property: "og:description", content: "A closer look at a Curvature Studio production." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-12 text-[12px] text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-12 text-[12px] text-muted-foreground">PROJECT NOT FOUND.</div>,
});

type Project = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  client: string | null;
  year: string | null;
  services: string[] | null;
  tools: string[] | null;
  cover_image: string | null;
  media_urls: string[];
  created_at: string;
};

function Media({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return isVideo(src) ? (
    <video src={src} className={className} muted loop playsInline autoPlay preload="metadata" />
  ) : (
    <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />
  );
}

function Meta({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p
        className="mt-2 text-[14px] normal-case tracking-normal"
        style={{ fontFamily: "Jost, sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<LightboxItem | null>(null);

  useEffect(() => {
    let alive = true;
    supabase
      .from("projects")
      .select("id,title,description,category,client,year,services,tools,cover_image,media_urls,created_at")
      .eq("id", projectId)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setProject((data as Project) ?? null);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const gallery = Array.from(
    new Set(((project?.media_urls ?? []) as string[]).map((u) => mediaSrc(u)).filter(Boolean)),
  );
  const hero = mediaSrc(project?.cover_image ?? project?.media_urls?.[0]) || "";
  const year = project?.year ?? (project ? new Date(project.created_at).getFullYear().toString() : null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero media — full width, full height */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        {hero && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
            style={{ willChange: "transform, opacity" }}
          >
            <Media src={hero} alt={project?.title ?? ""} className="h-full w-full object-cover" />
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
            {project?.category || "PROJECT"}
          </motion.p>
          <RevealLines className="display-lg" lines={[project?.title ?? (loading ? "LOADING…" : "PROJECT")]} delay={0.45} />
        </div>
      </section>

      {/* About this project */}
      <section className="border-t border-border px-6 md:px-12 py-24 md:py-36">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-10">ABOUT THIS PROJECT</p>
        </Reveal>
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Reveal delay={0.1}>
            <h2 className="text-2xl md:text-3xl">{project?.title}</h2>
            {project?.description && (
              <p
                className="mt-8 max-w-2xl text-muted-foreground normal-case tracking-normal"
                style={{ fontFamily: "Jost, sans-serif", fontSize: "15px", lineHeight: 1.75 }}
              >
                {project.description}
              </p>
            )}
          </Reveal>
          <Reveal delay={0.2} className="grid grid-cols-2 gap-x-8 gap-y-10">
            <Meta label="Client" value={project?.client} />
            <Meta label="Year" value={year} />
            <Meta label="Category" value={project?.category || "Project"} />
            <Meta label="Services" value={project?.services?.length ? project.services.join(", ") : null} />
            <Meta label="Tools" value={project?.tools?.length ? project.tools.join(", ") : null} />
          </Reveal>
        </div>
      </section>

      {/* Editorial gallery */}
      <section className="border-t border-border px-6 md:px-12 py-24 md:py-40">
        <div className="flex flex-col gap-28 md:gap-48">
          {gallery.map((src, i) => {
            const mod = i % 3;
            const width = mod === 0 ? "w-full" : mod === 1 ? "w-full md:w-[62%]" : "w-full md:w-[78%] md:ml-auto";
            return (
              <motion.button
                key={src + i}
                type="button"
                data-cursor="Zoom"
                onClick={() => setActive({ title: project?.title ?? "", category: project?.category ?? "PROJECT", images: gallery, index: i } as LightboxItem)}
                className={`${width} block overflow-hidden rounded-[22px] text-left`}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <Media src={src} alt={`${project?.title ?? "Project"} — frame ${i + 1}`} className="w-full h-auto object-cover bg-white/5" />
              </motion.button>
            );
          })}
        </div>
        <Reveal className="mt-32 text-center">
          <Link to="/portfolio" className="text-[11px] border-b border-foreground pb-1">
            BACK TO PORTFOLIO ↗
          </Link>
        </Reveal>
      </section>

      <Lightbox item={active} onClose={() => setActive(null)} />
      <SiteFooter />
    </div>
  );
}