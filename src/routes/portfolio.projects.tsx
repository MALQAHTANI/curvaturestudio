import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { isVideo, mediaSrc } from "@/lib/media";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { EASE } from "@/lib/motion";

export const Route = createFileRoute("/portfolio/projects")({
  head: () => ({
    meta: [
      { title: "Selected Work — Curvature Studio" },
      { name: "description", content: "Selected work from Curvature Studio — commercial, automotive, and cinematic productions." },
      { property: "og:title", content: "Selected Work — Curvature Studio" },
      { property: "og:description", content: "Selected work from Curvature Studio." },
    ],
  }),
  component: ProjectsGallery,
});

type Tile = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  coverImage: string;
  images: string[];
};

function ProjectsGallery() {
  const [dbItems, setDbItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("projects").select("id,title,description,category,cover_image,media_urls,sort_order,created_at")
      .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false })
      .then(({ data }) => setDbItems((data as any[])?.map(d => ({ ...d, cover_image: d.cover_image ?? d.media_urls?.[0] })) ?? []));
  }, []);
  const dbTiles: Tile[] = dbItems
    .map((it) => {
      const cover = mediaSrc(it.cover_image ?? it.media_urls?.[0]) || null;
      const images: string[] = Array.from(
        new Set(
          [cover, ...((it.media_urls as string[]) ?? []).map((u) => mediaSrc(u))].filter(
            Boolean,
          ) as string[],
        ),
      );
      return {
        id: it.id,
        title: it.title,
        category: it.category || "PROJECT",
        description: it.description ?? undefined,
        coverImage: cover as string,
        images,
      };
    })
    .filter((t) => !!t.coverImage);
  const tiles: Tile[] = dbTiles;


  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-48 pb-20 md:pb-28">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-6">PORTFOLIO / SELECTED WORK</p>
        </Reveal>
        <RevealLines
          className="text-3xl md:text-5xl"
          lines={["Selected Work"]}
          delay={0.15}
        />
      </section>
      <section className="border-t border-border px-6 md:px-12 py-24 md:py-48">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-10 md:gap-16 [column-fill:_balance]">
          {tiles.map((t, i) => (
            <motion.div
              key={t.id}
              className="mb-10 md:mb-16 break-inside-avoid"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: EASE, delay: (i % 3) * 0.08 }}
            >
              <Link
                to="/project/$projectId"
                params={{ projectId: t.id }}

                className="group relative block overflow-hidden rounded-[22px] bg-white/5"
                aria-label={t.title}
              >
                {isVideo(t.coverImage) ? (
                  <video
                    src={t.coverImage}
                    className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={t.coverImage}
                    alt={t.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  />
                )}
                <span className="pointer-events-none absolute inset-0 bg-background/0 transition-colors duration-500 group-hover:bg-background/45" />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 p-6 opacity-0 translate-y-3 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                  <span
                    className="block text-sm text-foreground normal-case tracking-normal"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    {t.title}
                  </span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {t.category}
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}