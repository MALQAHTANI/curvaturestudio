import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { isVideo, mediaSrc } from "@/lib/media";
import { HoverCard, Reveal, RevealLines, Stagger, StaggerItem } from "@/components/motion/primitives";

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
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-6">STUDIO</p>
        </Reveal>
        <RevealLines className="display-lg" lines={["FROM THE", "STUDIO."]} delay={0.15} />
      </section>
      <section className="border-t border-border px-6 md:px-12 py-16">
        {loading ? (
          <p className="text-[11px] text-muted-foreground">LOADING…</p>
        ) : items.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">NO STUDIO CONTENT YET.</p>
        ) : (
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12" stagger={0.08}>
            {items.map((p, i) => {
              const media = mediaSrc(p.cover_image ?? p.media_urls[0]) || null;
              return (
                <StaggerItem key={p.id}>
                  <HoverCard className="group rounded-sm transition-shadow duration-500 hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.95)]">
                  <div className="aspect-[4/3] overflow-hidden bg-white/5">
                    {media && (isVideo(media)
                      ? <video src={media} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                      : <img src={media} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-cover will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]" />
                    )}
                  </div>
                  <div className="flex justify-between mt-4 text-[11px] gap-4">
                    <div className="flex gap-3 min-w-0">
                      <span className="text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <span className="truncate">{p.title}</span>
                    </div>
                  </div>
                  </HoverCard>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}