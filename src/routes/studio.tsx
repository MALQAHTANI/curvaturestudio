import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { mediaSrc } from "@/lib/media";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { GalleryTile } from "@/components/motion/gallery-tile";

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

  useEffect(() => {
    supabase.from("studio_items").select("id,title,cover_image,media_urls,published,sort_order")
      .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data as any) ?? []); setLoading(false); });
  }, []);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 md:gap-x-16 gap-y-24 md:gap-y-32">
            {items.map((p, i) => {
              const media = mediaSrc(p.cover_image ?? p.media_urls[0]) || null;
              if (!media) return null;
              const offset = i % 3 === 1 ? "sm:mt-16" : i % 3 === 2 ? "lg:mt-28" : "";
              const ratio = i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-square";
              return (
                <div key={p.id} className={offset}>
                  <GalleryTile
                    src={media}
                    title={p.title}
                    index={i}
                    className="block w-full text-left"
                    mediaClassName={`${ratio} w-full h-full object-cover bg-white/5`}
                  />
                  <div className="flex justify-between mt-6 text-[11px] gap-4">
                    <div className="flex gap-3 min-w-0">
                      <span className="text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <span className="truncate">{p.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}