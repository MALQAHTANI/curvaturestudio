import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { ClientCard } from "@/components/client-card";
import { useClientProjects } from "@/lib/use-client-projects";

export const Route = createFileRoute("/clients/")({
  head: () => ({
    meta: [
      { title: "Clients & Projects — Curvature Studio" },
      {
        name: "description",
        content:
          "Every client collaboration and production by Curvature Studio — commercial, automotive and cinematic case studies.",
      },
      { property: "og:title", content: "Clients & Projects — Curvature Studio" },
      {
        property: "og:description",
        content: "Client collaborations and cinematic case studies by Curvature Studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsIndex,
});

const ASPECTS = ["aspect-[4/5]", "aspect-[4/3]", "aspect-[3/4]", "aspect-[1/1]", "aspect-[5/4]", "aspect-[3/2]"];

function ClientsIndex() {
  const { items, loading } = useClientProjects();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="px-6 md:px-12 pt-44 pb-16 md:pb-24">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-6">CLIENTS / PROJECTS</p>
        </Reveal>
        <RevealLines className="text-3xl md:text-5xl" lines={["Clients & Projects"]} delay={0.15} />
        <Reveal delay={0.3}>
          <p
            className="mt-8 max-w-xl text-muted-foreground normal-case tracking-normal"
            style={{ fontFamily: "Jost, sans-serif", fontSize: "14px", lineHeight: 1.7 }}
          >
            A complete archive of the brands we partner with — each entry opens a full case study with
            the challenge, our approach and the frames that came out of it.
          </p>
        </Reveal>
      </section>

      <section className="px-6 md:px-12 pb-32 md:pb-48">
        {loading && <p className="text-[11px] text-muted-foreground">LOADING…</p>}
        {!loading && items.length === 0 && (
          <p className="text-[11px] text-muted-foreground">NO PROJECTS PUBLISHED YET.</p>
        )}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-10 [column-fill:_balance]">
          {items.map((p, i) => (
            <div key={p.id} className="mb-6 md:mb-10 break-inside-avoid">
              <ClientCard project={p} index={i} aspect={ASPECTS[i % ASPECTS.length]} />
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}