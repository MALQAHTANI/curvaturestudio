import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { isVideo } from "@/lib/media";

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
      <section className="px-6 md:px-12 pt-40 pb-16">
        <p className="text-[11px] text-muted-foreground mb-6">STUDIO</p>
        <h1 className="display-lg">FROM THE<br />STUDIO.</h1>
      </section>
      <section className="border-t border-border px-6 md:px-12 py-16">
        {loading ? (
          <p className="text-[11px] text-muted-foreground">LOADING…</p>
        ) : items.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">NO STUDIO CONTENT YET.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {items.map((p, i) => {
              const media = p.cover_image ?? p.media_urls[0];
              return (
                <div key={p.id} className="group">
                  <div className="aspect-[4/3] overflow-hidden bg-white/5">
                    {media && (isVideo(media)
                      ? <video src={media} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                      : <img src={media} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    )}
                  </div>
                  <div className="flex justify-between mt-4 text-[11px] gap-4">
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