import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { isVideo, mediaSrc } from "@/lib/media";
import { Reveal, RevealLines } from "@/components/motion/primitives";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News — Curvature Studio" },
      {
        name: "description",
        content: "Latest releases, productions and studio updates from Curvature Studio in Jeddah.",
      },
      { property: "og:title", content: "News — Curvature Studio" },
      { property: "og:description", content: "Latest releases and studio updates from Curvature Studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsPage,
});

type Item = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_image: string | null;
  media_urls: string[];
  created_at: string;
};

function NewsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("projects")
      .select("id,title,description,category,cover_image,media_urls,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        setItems((data as Item[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-44 pb-16">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-6">NEWS</p>
        </Reveal>
        <RevealLines className="text-3xl md:text-5xl" lines={["Latest From", "The Studio"]} delay={0.15} />
      </section>

      <section className="border-t border-border px-6 md:px-12 py-20 md:py-32">
        {loading ? (
          <p className="text-[11px] text-muted-foreground">LOADING…</p>
        ) : items.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">NO NEWS YET.</p>
        ) : (
          <ul className="flex flex-col gap-16 md:gap-24">
            {items.map((it) => {
              const src = mediaSrc(it.cover_image ?? it.media_urls?.[0]);
              const date = new Date(it.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              return (
                <li key={it.id}>
                  <Link
                    to="/project/$projectId"
                    params={{ projectId: it.id }}
                    className="group grid gap-8 md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-center"
                  >
                    <div className="overflow-hidden rounded-[20px] bg-white/5">
                      {src ? (
                        isVideo(src) ? (
                          <video
                            src={src}
                            className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            muted
                            loop
                            playsInline
                            autoPlay
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={src}
                            alt={it.title}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )
                      ) : null}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {date} — {it.category || "PROJECT"}
                      </p>
                      <h2 className="mt-4 text-xl md:text-2xl">{it.title}</h2>
                      {it.description && (
                        <p
                          className="mt-4 max-w-xl text-muted-foreground normal-case tracking-normal line-clamp-3"
                          style={{ fontFamily: "Jost, sans-serif", fontSize: "14px", lineHeight: 1.7 }}
                        >
                          {it.description}
                        </p>
                      )}
                      <span className="mt-6 inline-block border-b border-foreground pb-1 text-[11px]">
                        READ MORE ↗
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}