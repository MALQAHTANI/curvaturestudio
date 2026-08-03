import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { mediaSrc } from "@/lib/media";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { DUR, EASE, viewportOnce } from "@/lib/motion";

export const Route = createFileRoute("/clients/")({
  head: () => ({
    meta: [
      { title: "Clients — Curvature Studio" },
      {
        name: "description",
        content:
          "The brands and organisations Curvature Studio partners with across commercial, automotive and cinematic production.",
      },
      { property: "og:title", content: "Clients — Curvature Studio" },
      {
        property: "og:description",
        content: "The brands we partner with at Curvature Studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsIndex,
});

type ClientRow = { id: string; name: string; logo_url: string | null; website: string | null };

function ClientsIndex() {
  const [items, setItems] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase.from("clients" as never) as any)
      .select("id,name,logo_url,website,sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }: any) => {
        setItems((data as ClientRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="px-6 md:px-12 pt-44 pb-16 md:pb-24">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-6">CLIENTS</p>
        </Reveal>
        <RevealLines className="text-3xl md:text-5xl" lines={["Our Clients"]} delay={0.15} />
        <Reveal delay={0.3}>
          <p
            className="mt-8 max-w-xl text-muted-foreground normal-case tracking-normal"
            style={{ fontFamily: "Jost, sans-serif", fontSize: "14px", lineHeight: 1.7 }}
          >
            The brands and organisations we are trusted by.
          </p>
        </Reveal>
      </section>

      <section className="px-6 md:px-12 pb-32 md:pb-48">
        {loading && <p className="text-[11px] text-muted-foreground">LOADING…</p>}
        {!loading && items.length === 0 && (
          <p className="text-[11px] text-muted-foreground">NO CLIENTS PUBLISHED YET.</p>
        )}
        <div className="grid grid-cols-2 gap-[1px] border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {items.map((c, i) => {
            const logo = mediaSrc(c.logo_url);
            const inner = logo ? (
              <img
                src={logo}
                alt={`${c.name} logo`}
                loading="lazy"
                decoding="async"
                className="max-h-[64px] w-auto max-w-[70%] object-contain opacity-70 transition-opacity duration-500 group-hover:opacity-100"
              />
            ) : (
              <span
                className="px-4 text-center text-[13px] uppercase tracking-[0.14em] text-foreground/60 transition-colors duration-500 group-hover:text-foreground md:text-[15px]"
                style={{ fontFamily: "Jost, sans-serif", fontWeight: 500 }}
              >
                {c.name}
              </span>
            );
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: DUR.slow, ease: EASE, delay: (i % 4) * 0.06 }}
                className="group flex aspect-[3/2] items-center justify-center bg-background"
              >
                {c.website ? (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex h-full w-full items-center justify-center"
                    aria-label={c.name}
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}