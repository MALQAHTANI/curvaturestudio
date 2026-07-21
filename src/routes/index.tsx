import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import projects from "@/data/projects.json";
import services from "@/data/services.json";
import { supabase } from "@/integrations/supabase/client";
import { isVideo } from "@/lib/media";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const staticFeatured = (projects as any[])
    .filter((p) => p.published && p.cover_image && !p.cover_image.includes("88e8419e"))
    .slice(0, 6);
  const [dbItems, setDbItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("projects").select("id,title,cover_image,media_urls,sort_order,created_at")
      .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => setDbItems((data as any[])?.map(d => ({ ...d, cover_image: d.cover_image ?? d.media_urls?.[0] })) ?? []));
  }, []);
  const featured = [...dbItems, ...staticFeatured].slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="min-h-[92vh] flex flex-col justify-end px-6 md:px-12 pt-40 pb-16">
        <p className="text-[11px] text-muted-foreground mb-6">CREATIVE MEDIA PRODUCTION — EST. 2016</p>
        <h1 className="display-xl">
          CINEMATIC<br />STORIES,<br />CRAFTED.
        </h1>
        <p className="mt-10 max-w-xl text-muted-foreground normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif", textTransform: "none", fontSize: "14px", lineHeight: 1.6 }}>
          Curvature Studio is a creative media production studio based in Saudi Arabia — crafting visually compelling content for global and regional brands.
        </p>
      </section>

      {/* Featured work */}
      <section className="border-t border-border px-6 md:px-12 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <p className="text-[11px] text-muted-foreground">SELECTED WORK</p>
          <Link to="/portfolio" className="text-[11px] border-b border-foreground pb-0.5">VIEW ALL ↗</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {featured.map((p, i) => (
            <div key={p.id} className="group">
              <div className="aspect-[4/3] overflow-hidden bg-white/5">
                {p.cover_image && (isVideo(p.cover_image)
                  ? <video src={p.cover_image} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                  : <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                )}
              </div>
              <div className="flex justify-between mt-4 text-[11px] gap-4">
                <div className="flex gap-3 min-w-0">
                  <span className="text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate">{p.title}</span>
                </div>
                <span className="text-muted-foreground shrink-0">{p.year ?? ""}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="border-t border-border px-6 md:px-12 py-16">
        <p className="text-[11px] text-muted-foreground mb-10">SERVICES</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {(services as any[]).filter((s) => s.published).map((s, i) => (
            <li key={s.id}>
              <span className="text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display-md mt-3">{s.title}</h3>
              {s.description && (
                <p className="mt-4 text-muted-foreground normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif", textTransform: "none", fontSize: "13px", lineHeight: 1.6 }}>
                  {s.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 md:px-12 py-40 text-center">
        <h2 className="display-lg">LET'S BUILD<br />SOMETHING.</h2>
        <Link to="/contact" className="inline-block mt-12 text-[11px] border-b border-foreground pb-1">
          START A PROJECT ↗
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
