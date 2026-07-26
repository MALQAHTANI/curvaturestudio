import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { isVideo } from "@/lib/media";
import { Lightbox, type LightboxItem } from "@/components/lightbox";
import { REFERENCE_PROJECTS } from "@/data/portfolio-reference";

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

const wix = (id: string) =>
  `https://static.wixstatic.com/media/${id}/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/${id}`;

const wixFull = (id: string) =>
  `https://static.wixstatic.com/media/${id}/v1/fit/w_1600,h_1600,q_90,enc_avif,quality_auto/${id}`;

const REFERENCE_TILES = REFERENCE_PROJECTS.map((p) => ({
  id: p.id,
  title: p.title,
  src: wix(p.images[0]),
  images: p.images.map(wixFull),
}));

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
  const [active, setActive] = useState<LightboxItem | null>(null);
  useEffect(() => {
    supabase.from("projects").select("id,title,description,cover_image,media_urls,sort_order,created_at")
      .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false })
      .then(({ data }) => setDbItems((data as any[])?.map(d => ({ ...d, cover_image: d.cover_image ?? d.media_urls?.[0] })) ?? []));
  }, []);
  const dbTiles: Tile[] = dbItems
    .map((it) => {
      const cover = it.cover_image ?? it.media_urls?.[0] ?? null;
      const images: string[] = Array.from(
        new Set([cover, ...((it.media_urls as string[]) ?? [])].filter(Boolean) as string[]),
      );
      return {
        id: it.id,
        title: it.title,
        category: "PROJECT",
        description: it.description ?? undefined,
        coverImage: cover as string,
        images,
      };
    })
    .filter((t) => !!t.coverImage);
  const tiles: Tile[] = [
    ...dbTiles,
    ...REFERENCE_TILES.map((t) => ({
      id: t.id,
      title: t.title,
      category: "SELECTED WORK",
      coverImage: t.src,
      images: t.images,
    })),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-40 pb-10">
        <p className="text-[11px] text-muted-foreground mb-4">PORTFOLIO / SELECTED WORK</p>
        <h1 className="text-3xl md:text-5xl" style={{ fontFamily: "Jost, sans-serif", letterSpacing: "-0.02em" }}>
          Selected Work
        </h1>
      </section>
      <section className="border-t border-border px-6 md:px-12 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 md:gap-8 [column-fill:_balance]">
          {tiles.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setActive({ title: t.title, category: t.category, description: t.description, images: t.images })
              }
              aria-label={`Open gallery: ${t.title}`}
              className="group relative mb-5 md:mb-8 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-white/5 text-left shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] transition-shadow duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
            >
              {isVideo(t.coverImage) ? (
                <video src={t.coverImage} className="w-full h-auto object-contain" muted loop playsInline autoPlay />
              ) : (
                <img
                  src={t.coverImage}
                  alt={t.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.04]"
                />
              )}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-4 pb-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {t.category && (
                  <span className="mb-1 block text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    {t.category}
                  </span>
                )}
                <span className="block text-xs md:text-sm text-foreground" style={{ fontFamily: "Jost, sans-serif" }}>
                  {t.title}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <Lightbox item={active} onClose={() => setActive(null)} />
      <SiteFooter />
    </div>
  );
}