import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import projects from "@/data/projects.json";
import services from "@/data/services.json";
import { supabase } from "@/integrations/supabase/client";
import { mediaSrc } from "@/lib/media";
import { Reveal, RevealLines, Stagger, StaggerItem } from "@/components/motion/primitives";
import { GalleryTile } from "@/components/motion/gallery-tile";
import { Parallax } from "@/components/motion/parallax";
import { MotionNavLink } from "@/components/motion/button";
import { DUR, EASE } from "@/lib/motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Curvature Studio — Cinematic Media Production" },
      {
        name: "description",
        content:
          "Curvature Studio is a creative media production studio in Saudi Arabia crafting cinematic content for global and regional brands.",
      },
      { property: "og:title", content: "Curvature Studio — Cinematic Media Production" },
      {
        property: "og:description",
        content: "Creative media production studio in Saudi Arabia — cinematic stories, crafted.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const staticFeatured = (projects as any[])
    .filter((p) => p.published && p.cover_image && !p.cover_image.includes("88e8419e"))
    .slice(0, 6);
  const [dbItems, setDbItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("projects").select("id,title,cover_image,media_urls,sort_order,created_at")
      .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => setDbItems((data as any[])?.map(d => ({ ...d, cover_image: mediaSrc(d.cover_image ?? d.media_urls?.[0]) || null })) ?? []));
  }, []);
  const featured = [...dbItems, ...staticFeatured].slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <motion.section
        className="relative isolate overflow-hidden min-h-[100svh] flex flex-col justify-end px-6 md:px-12 pt-44 pb-24 md:pb-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.slow, ease: EASE, delay: 0.5 }}
      >
        <Parallax className="absolute inset-0 -z-10" distance={60}>
          <div aria-hidden className="hero-bg" />
          <div aria-hidden className="hero-globe" />
          <div aria-hidden className="hero-sweep" />
        </Parallax>
        <motion.p
          className="relative text-[11px] text-muted-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base, ease: EASE, delay: 0.65 }}
        >
          CREATIVE MEDIA PRODUCTION — EST. 2016
        </motion.p>
        <RevealLines
          className="relative display-xl"
          lines={["CINEMATIC", "STORIES,", "CRAFTED."]}
          delay={0.8}
          stagger={0.1}
        />
        <motion.p
          className="relative mt-10 max-w-xl text-muted-foreground normal-case tracking-normal"
          style={{ fontFamily: "Jost, sans-serif", textTransform: "none", fontSize: "14px", lineHeight: 1.6 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base, ease: EASE, delay: 1.25 }}
        >
          Curvature Studio is a creative media production studio based in Saudi Arabia — crafting visually compelling content for global and regional brands.
        </motion.p>
        <motion.div
          className="relative mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base, ease: EASE, delay: 1.5 }}
        >
          <MotionNavLink to="/portfolio" className="inline-block text-[11px] border-b border-foreground pb-1">
            VIEW OUR WORK ↗
          </MotionNavLink>
        </motion.div>
      </motion.section>

      {/* Featured work — editorial rhythm, sticky index column */}
      <section className="border-t border-border px-6 md:px-12 py-28 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] gap-y-12 lg:gap-x-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal className="flex items-baseline justify-between lg:block">
              <p className="text-[11px] text-muted-foreground">SELECTED WORK</p>
              <MotionNavLink to="/portfolio" className="text-[11px] border-b border-foreground pb-0.5 lg:mt-6 lg:inline-block">
                VIEW ALL ↗
              </MotionNavLink>
            </Reveal>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-24 md:gap-y-32" stagger={0.09}>
            {featured.map((p, i) => {
              const offset = i % 4 === 1 ? "sm:mt-24" : i % 4 === 2 ? "sm:-mt-8" : i % 4 === 3 ? "sm:mt-16" : "";
              const ratio = i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-[16/11]" : "aspect-square";
              return (
                <StaggerItem key={p.id} className={offset}>
                  <div className="group">
                    {p.cover_image && (
                      <GalleryTile
                        src={p.cover_image}
                        title={p.title}
                        category="PROJECT"
                        index={i}
                        onOpen={() => navigate({ to: "/portfolio/projects" })}
                        className="block w-full text-left"
                        mediaClassName={`${ratio} w-full h-full object-cover bg-white/5`}
                      />
                    )}
                    <div className="flex justify-between mt-6 text-[11px] gap-4 transition-colors duration-500 group-hover:text-foreground">
                      <div className="flex gap-3 min-w-0">
                        <span className="text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <span className="truncate">{p.title}</span>
                      </div>
                      <span className="text-muted-foreground shrink-0">{p.year ?? ""}</span>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Services */}
      <section className="border-t border-border px-6 md:px-12 py-28 md:py-40">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-16">SERVICES</p>
        </Reveal>
        <Stagger as="ul" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20" stagger={0.07}>
          {(services as any[]).filter((s) => s.published).map((s, i) => (
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

      {/* CTA */}
      <section className="border-t border-border px-6 md:px-12 py-48 md:py-64 text-center">
        <RevealLines as="h2" className="display-lg" lines={["LET'S BUILD", "SOMETHING."]} inView />
        <Reveal className="mt-12" delay={0.2}>
          <MotionNavLink to="/contact" className="inline-block text-[11px] border-b border-foreground pb-1">
            START A PROJECT ↗
          </MotionNavLink>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
