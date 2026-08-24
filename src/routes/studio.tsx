import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { db } from "@/lib/db";
import { mediaSrc } from "@/lib/media";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { MediaGrid, type GridTile } from "@/components/media-grid";
import { Lightbox, type LightboxItem } from "@/components/lightbox";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — Curvature Studio" },
      { name: "description", content: "Inside the studio — moments and work from the Curvature team." },
      { property: "og:title", content: "Studio — Curvature Studio" },
      { property: "og:description", content: "Inside the studio — Curvature." },
    ],
  }),
  component: StudioPage,
});

type Item = { id: string; title: string; cover_image: string | null; media_urls: string[] };

function StudioPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<LightboxItem | null>(null);

  useEffect(() => {
    db.from("studio_items").select("id,title,cover_image,media_urls,published,sort_order")
      .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data as any) ?? []); setLoading(false); });
  }, []);

  const entries = items
    .map((p) => {
      const media = mediaSrc(p.cover_image ?? p.media_urls?.[0]) || null;
      if (!media) return null;
      const images = Array.from(
        new Set(
          [media, ...((p.media_urls as string[]) ?? []).map((u) => mediaSrc(u))].filter(
            Boolean,
          ) as string[],
        ),
      );
      return { col: { id: p.id, title: p.title, category: "STUDIO", cover: media } as GridTile, images, title: p.title };
    })
    .filter(Boolean) as { col: GridTile; images: string[]; title: string }[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-48 pb-20 md:pb-28">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-6">STUDIO</p>
        </Reveal>
        <RevealLines className="display-lg" lines={["FROM THE", "STUDIO."]} delay={0.15} />
      </section>
      <section className="border-t border-border px-6 md:px-12 py-20 md:py-32">
        {loading ? (
          <p className="text-[11px] text-muted-foreground">LOADING…</p>
        ) : items.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">NO STUDIO CONTENT YET.</p>
        ) : (
          <MediaGrid
            items={entries.map((e) => e.col)}
            onSelect={(_item, i) =>
              setActive({ title: entries[i].title, category: "STUDIO", images: entries[i].images })
            }
          />
        )}
      </section>
      <Lightbox item={active} onClose={() => setActive(null)} />
      <SiteFooter />
    </div>
  );
}