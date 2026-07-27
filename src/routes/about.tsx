import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import services from "@/data/services.json";
import clients from "@/data/clients.json";
import { Reveal, RevealLines, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Marquee } from "@/components/motion/marquee";
import { Counter } from "@/components/motion/counter";
import { GalleryTile } from "@/components/motion/gallery-tile";
import { Lightbox, type LightboxItem } from "@/components/lightbox";
import { supabase } from "@/integrations/supabase/client";
import { mediaSrc } from "@/lib/media";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Curvature Studio" },
      { name: "description", content: "Curvature Studio is a creative media production studio founded in 2016, based in Saudi Arabia." },
      { property: "og:title", content: "About — Curvature Studio" },
      { property: "og:description", content: "Creative media production studio founded in 2016." },
    ],
  }),
  component: About,
});

function About() {
  const svcs = (services as any[]).filter((s) => s.published);
  const cls = (clients as any[]).filter((c) => c.published);
  const [shots, setShots] = useState<{ id: string; title: string; src: string }[]>([]);
  const [active, setActive] = useState<LightboxItem | null>(null);

  useEffect(() => {
    supabase
      .from("projects")
      .select("id,title,cover_image,media_urls,sort_order,created_at")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) =>
        setShots(
          ((data as any[]) ?? [])
            .map((d) => ({ id: d.id, title: d.title, src: mediaSrc(d.cover_image ?? d.media_urls?.[0]) || "" }))
            .filter((d) => !!d.src),
        ),
      );
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-48 pb-24 md:pb-36 max-w-4xl">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-6">ABOUT</p>
        </Reveal>
        <RevealLines className="display-lg" lines={["WE ARE", "CURVATURE."]} delay={0.15} />
        <Stagger
          className="mt-10 space-y-6 text-muted-foreground normal-case tracking-normal"
          stagger={0.1}
          delayChildren={0.2}
          style={{ fontFamily: "Jost, sans-serif", textTransform: "none", fontSize: "14px", lineHeight: 1.7 }}
        >
          <StaggerItem as="p">Curvature Studio is a creative media production studio founded in 2016, based in Saudi Arabia. We craft visually compelling content for global and regional brands — commercial campaigns, behind-the-scenes storytelling, and visuals that resonate.</StaggerItem>
          <StaggerItem as="p">Over the years we've partnered with automotive icons, luxury brands, and cultural institutions across the region — building a body of work defined by craft, restraint, and cinematic intent.</StaggerItem>
        </Stagger>
        <Stagger className="mt-20 grid grid-cols-3 gap-8 max-w-xl" stagger={0.12}>
          {[
            { value: new Date().getFullYear() - 2016, suffix: "+", label: "YEARS" },
            { value: svcs.length, suffix: "", label: "SERVICES" },
            { value: cls.length, suffix: "+", label: "CLIENTS" },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <p className="display-md">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-[10px] tracking-[0.2em] text-muted-foreground">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-border px-6 md:px-12 py-28 md:py-40">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-16">SERVICES</p>
        </Reveal>
        <Stagger as="ul" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20" stagger={0.07}>
          {svcs.map((s, i) => (
            <StaggerItem as="li" key={s.id}>
              <span className="text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display-md mt-3">{s.title}</h3>
              {s.description && (
                <p className="mt-4 text-muted-foreground normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif", textTransform: "none", fontSize: "13px", lineHeight: 1.6 }}>
                  {s.description}
                </p>
              )}
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-border px-6 md:px-12 py-28 md:py-40">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-16">CLIENTS</p>
        </Reveal>
        <Reveal delay={0.1} className="border-y border-border py-6">
          <Marquee speed={45} className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            {cls.map((c) => (
              <span
                key={c.id}
                className="px-8 text-sm text-muted-foreground normal-case tracking-normal whitespace-nowrap transition-colors duration-500 hover:text-foreground"
                style={{ fontFamily: "Jost, sans-serif", textTransform: "none" }}
              >
                {c.name}
              </span>
            ))}
          </Marquee>
        </Reveal>
      </section>

      {shots.length > 0 && (
        <section className="border-t border-border px-6 md:px-12 py-28 md:py-40">
          <Reveal>
            <p className="text-[11px] text-muted-foreground mb-16">IN FRAME</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 md:gap-x-16 gap-y-20 md:gap-y-28">
            {shots.map((s, i) => (
              <div key={s.id} className={i % 3 === 1 ? "sm:mt-16" : i % 3 === 2 ? "lg:mt-28" : ""}>
                <GalleryTile
                  src={s.src}
                  title={s.title}
                  category="IN FRAME"
                  index={i}
                  onOpen={() =>
                    setActive({
                      title: s.title,
                      category: "IN FRAME",
                      images: shots.map((x) => x.src),
                    })
                  }
                  className="block w-full text-left"
                  mediaClassName={`${i % 2 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"} w-full h-full object-cover bg-white/5`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <Lightbox item={active} onClose={() => setActive(null)} />
      <SiteFooter />
    </div>
  );
}