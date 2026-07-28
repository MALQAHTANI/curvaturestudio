import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { mediaSrc } from "@/lib/media";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { ProjectColumns, type ColumnProject } from "@/components/project-columns";

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

  const columns: ColumnProject[] = tiles.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category ?? "PROJECT",
    cover: t.coverImage,
  }));
  const rows: ColumnProject[][] = [];
  for (let i = 0; i < columns.length; i += 6) rows.push(columns.slice(i, i + 6));

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
        <div className="space-y-6 lg:space-y-[3px]">
          {rows.map((row, r) => (
            <ProjectColumns key={r} items={row} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}