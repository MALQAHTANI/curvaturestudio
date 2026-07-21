import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import services from "@/data/services.json";
import clients from "@/data/clients.json";

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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-40 pb-16 max-w-4xl">
        <p className="text-[11px] text-muted-foreground mb-6">ABOUT</p>
        <h1 className="display-lg">WE ARE<br />CURVATURE.</h1>
        <div className="mt-10 space-y-6 text-muted-foreground normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif", textTransform: "none", fontSize: "14px", lineHeight: 1.7 }}>
          <p>Curvature Studio is a creative media production studio founded in 2016, based in Saudi Arabia. We craft visually compelling content for global and regional brands — commercial campaigns, behind-the-scenes storytelling, and visuals that resonate.</p>
          <p>Over the years we've partnered with automotive icons, luxury brands, and cultural institutions across the region — building a body of work defined by craft, restraint, and cinematic intent.</p>
        </div>
      </section>

      <section className="border-t border-border px-6 md:px-12 py-16">
        <p className="text-[11px] text-muted-foreground mb-10">SERVICES</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {svcs.map((s, i) => (
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

      <section className="border-t border-border px-6 md:px-12 py-16">
        <p className="text-[11px] text-muted-foreground mb-10">CLIENTS</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border border border-border">
          {cls.map((c) => (
            <div key={c.id} className="bg-background px-6 py-8 text-sm normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif", textTransform: "none" }}>
              {c.name}
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}