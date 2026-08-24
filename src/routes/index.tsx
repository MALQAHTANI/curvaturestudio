import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

import services from "@/data/services.json";
import { db as supabase } from "@/lib/db";
import { isVideo, mediaSrc } from "@/lib/media";
import { Reveal, RevealLines, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Parallax } from "@/components/motion/parallax";
import { MotionNavLink } from "@/components/motion/button";
import { ScrollIndicator } from "@/components/motion/scroll-indicator";
import { ProjectColumns, type ColumnProject } from "@/components/project-columns";
import { DUR, EASE } from "@/lib/motion";
import ctaVideo from "@/assets/contact-bg.mp4.asset.json";
import { useSiteMedia } from "@/lib/use-site-media";

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
  const ctaMedia = useSiteMedia("home_cta", ctaVideo.url);
  const heroMedia = useSiteMedia("home_hero", "");
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(900);
  useEffect(() => {
    const read = () => setVh(window.innerHeight);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  const heroScale = useTransform(scrollY, [0, vh], [1, 0.94]);
  const heroOpacity = useTransform(scrollY, [0, vh * 0.85], [1, 0.25]);
  const [dbItems, setDbItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("projects").select("id,title,description,category,cover_image,media_urls,sort_order,created_at")
      .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false }).limit(6)
      .then(({ data }) =>
        setDbItems(
          (data as any[])?.map((d) => ({
            ...d,
            cover_image: mediaSrc(d.cover_image ?? d.media_urls?.[0]) || null,
            gallery: Array.from(
              new Set(
                [mediaSrc(d.cover_image ?? d.media_urls?.[0]), ...((d.media_urls as string[]) ?? []).map((u) => mediaSrc(u))].filter(
                  Boolean,
                ) as string[],
              ),
            ),
          })) ?? [],
        ),
      );
  }, []);
  const featured = [...dbItems, ...staticFeatured].slice(0, 6);
  const columns: ColumnProject[] = featured
    .filter((p) => p.cover_image)
    .map((p) => ({ id: p.id, title: p.title, category: p.category ?? "PROJECT", cover: p.cover_image }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero — stays pinned while the work section slides over it */}
      <div className="relative">
      <motion.section
        className="sticky top-0 z-0 isolate overflow-hidden h-[100svh] flex flex-col justify-end px-6 md:px-12 pt-44 pb-24 md:pb-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.hero, ease: EASE, delay: 1.5 }}
        style={{ scale: heroScale, opacity: heroOpacity, willChange: "transform, opacity" }}
      >
        <Parallax className="absolute inset-0 -z-10" distance={40}>
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 3, ease: EASE, delay: 0.3 }}
            style={{ willChange: "transform, opacity" }}
          >
            <div aria-hidden className="hero-bg" />
            <div aria-hidden className="hero-globe" />
            <div aria-hidden className="hero-sweep" />
            {heroMedia &&
              (isVideo(heroMedia) ? (
                <video
                  key={heroMedia}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={heroMedia}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden
                />
              ) : (
                <img
                  key={heroMedia}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={heroMedia}
                  alt=""
                  aria-hidden
                />
              ))}
            {heroMedia && <div aria-hidden className="absolute inset-0 bg-background/70" />}
          </motion.div>
        </Parallax>
        <motion.p
          className="relative text-[11px] text-muted-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.hero, ease: EASE, delay: 1.7 }}
        >
          CREATIVE MEDIA PRODUCTION — EST. 2016
        </motion.p>
        <RevealLines
          className="relative display-xl"
          lines={["CINEMATIC", "STORIES,", "CRAFTED."]}
          delay={1.85}
        />
        <motion.p
          className="relative mt-10 max-w-xl text-muted-foreground normal-case tracking-normal"
          style={{ fontFamily: "Jost, sans-serif", textTransform: "none", fontSize: "14px", lineHeight: 1.6 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.hero, ease: EASE, delay: 2.35 }}
        >
          Curvature Studio is a creative media production studio based in Saudi Arabia — crafting visually compelling content for global and regional brands.
        </motion.p>
        <motion.div
          className="relative mt-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DUR.slow, ease: EASE, delay: 2.6 }}
        >
          <MotionNavLink to="/portfolio" className="inline-block text-[11px] border-b border-foreground pb-1">
            VIEW OUR WORK ↗
          </MotionNavLink>
        </motion.div>
        <ScrollIndicator />
      </motion.section>

      {/* Everything below rides over the pinned hero as one continuous canvas */}
      <div className="relative z-10 bg-background rounded-t-[28px] shadow-[0_-40px_80px_-40px_rgba(0,0,0,0.9)]">
      <section className="px-6 md:px-12 py-24 md:py-36">
        <Reveal className="mb-12 flex items-baseline justify-between gap-6">
          <p className="text-[11px] text-muted-foreground">SELECTED WORK</p>
          <MotionNavLink to="/portfolio" className="text-[11px] border-b border-foreground pb-0.5">
            VIEW ALL ↗
          </MotionNavLink>
        </Reveal>
        <ProjectColumns items={columns} />
      </section>

      {/* Services */}
      <section className="border-t border-border px-6 md:px-12 py-32 md:py-52">
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

      {/* Clients live on their own dedicated page — linked from the header */}
      {/* CTA — background media slot: swap ctaMedia for any image or video asset */}
      <section className="relative isolate overflow-hidden border-t border-border px-6 md:px-12 py-48 md:py-64 text-center">
        {isVideo(ctaMedia) ? (
          <video
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            src={ctaMedia}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : (
          <img
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            src={ctaMedia}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden
          />
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-background/75" />
        <RevealLines as="h2" className="relative display-lg" lines={["LET'S BUILD", "SOMETHING."]} inView />
        <Reveal className="relative mt-12" delay={0.2}>
          <MotionNavLink to="/contact" className="inline-block text-[11px] border-b border-foreground pb-1">
            START A PROJECT ↗
          </MotionNavLink>
        </Reveal>
      </section>

      <SiteFooter />
      </div>
      </div>
    </div>
  );
}
