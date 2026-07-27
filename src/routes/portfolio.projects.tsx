import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { mediaSrc } from "@/lib/media";
import { Lightbox, type LightboxItem } from "@/components/lightbox";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { GalleryTile } from "@/components/motion/gallery-tile";

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
  const [active, setActive] = useState<LightboxItem | null>(null);
  useEffect(() => {
    supabase.from("projects").select("id,title,description,cover_image,media_urls,sort_order,created_at")
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
        category: "PROJECT",
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
      <section className="px-6 md:px-12 pt-40 pb-10">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-4">PORTFOLIO / SELECTED WORK</p>
        </Reveal>
        <RevealLines
          className="text-3xl md:text-5xl"
          lines={["Selected Work"]}
          delay={0.15}
        />
      </section>
      <section className="border-t border-border px-6 md:px-12 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 md:gap-8 [column-fill:_balance]">
          {tiles.map((t, i) => (
            <GalleryTile
              key={t.id}
              src={t.coverImage}
              title={t.title}
              category={t.category}
              index={i}
              onOpen={() =>
                setActive({ title: t.title, category: t.category, description: t.description, images: t.images })
              }
              className="mb-5 md:mb-8 block w-full break-inside-avoid text-left"
              mediaClassName="w-full h-auto object-contain bg-white/5"
            />
          ))}
        </div>
      </section>
      <Lightbox item={active} onClose={() => setActive(null)} />
      <SiteFooter />
    </div>
  );
}