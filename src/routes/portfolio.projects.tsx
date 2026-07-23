import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { isVideo } from "@/lib/media";

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

const REFERENCE_TILES = [
  { id: "mb-snd-2025", title: "MB SND 2025", src: "https://static.wixstatic.com/media/f3dbf9_b0d653724924428e8536d3a37763bbd2~mv2.jpg/v1/fill/w_1200,q_90,enc_avif,quality_auto/f3dbf9_b0d653724924428e8536d3a37763bbd2~mv2.jpg" },
  { id: "mb-cla-concept", title: "MB - THE CONCEPT CLA", src: "https://static.wixstatic.com/media/f3dbf9_6665de1f31d548468531414b0d766fdd~mv2.jpg/v1/fill/w_1200,q_90,enc_avif,quality_auto/f3dbf9_6665de1f31d548468531414b0d766fdd~mv2.jpg" },
  { id: "mb-eqg-alula", title: "MB EQG Landing in AlUla", src: "https://static.wixstatic.com/media/f3dbf9_5bb37d25ad1440fdbeb267de61a953d9~mv2.jpg/v1/fill/w_1200,q_90,enc_avif,quality_auto/f3dbf9_5bb37d25ad1440fdbeb267de61a953d9~mv2.jpg" },
  { id: "mb-snd-2022", title: "MB SND 2022", src: "https://static.wixstatic.com/media/f3dbf9_30a49fabe45d450e82ac9038dc06c6f4~mv2.jpg/v1/fill/w_1200,q_90,enc_avif,quality_auto/f3dbf9_30a49fabe45d450e82ac9038dc06c6f4~mv2.jpg" },
  { id: "cle-ludovic-ballouard", title: "CLE — Ludovic Ballouard", src: "https://static.wixstatic.com/media/f3dbf9_1e6bd2c4d5974321bbe95d2a2b49d993~mv2.jpg/v1/fill/w_1200,q_90,enc_avif,quality_auto/f3dbf9_1e6bd2c4d5974321bbe95d2a2b49d993~mv2.jpg" },
  { id: "porsche-green-roof-alula", title: "Porsche Green Roof AlUla", src: "https://static.wixstatic.com/media/f3dbf9_530f9dbd54714b13b28d30d8b190ad69~mv2.jpg/v1/fill/w_1200,q_90,enc_avif,quality_auto/f3dbf9_530f9dbd54714b13b28d30d8b190ad69~mv2.jpg" },
];

function ProjectsGallery() {
  const [dbItems, setDbItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("projects").select("id,title,cover_image,media_urls,sort_order,created_at")
      .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false })
      .then(({ data }) => setDbItems((data as any[])?.map(d => ({ ...d, cover_image: d.cover_image ?? d.media_urls?.[0] })) ?? []));
  }, []);
  const dbTiles = dbItems
    .map((it) => ({ id: it.id, title: it.title, src: it.cover_image ?? it.media_urls?.[0] ?? null }))
    .filter((t) => !!t.src) as { id: string; title: string; src: string }[];
  const tiles = [...dbTiles, ...REFERENCE_TILES];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-40 pb-10">
        <p className="text-[11px] text-muted-foreground mb-4">PORTFOLIO / SELECTED WORK</p>
        <h1 className="text-3xl md:text-5xl" style={{ fontFamily: "Jost, sans-serif", letterSpacing: "-0.02em" }}>
          Selected Work
        </h1>
      </section>
      <section className="border-t border-border px-6 md:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {tiles.map((t) => (
            <div key={t.id} className="aspect-square overflow-hidden bg-white/5 group">
              {isVideo(t.src) ? (
                <video src={t.src} className="w-full h-full object-cover" muted loop playsInline autoPlay />
              ) : (
                <img src={t.src} alt={t.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              )}
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}