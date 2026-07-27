import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import services from "@/data/services.json";
import clients from "@/data/clients.json";
import { Reveal, RevealLines, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Marquee } from "@/components/motion/marquee";
import { Counter } from "@/components/motion/counter";

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
        <Stagger className="mt-14 grid grid-cols-3 gap-6 max-w-xl" stagger={0.12}>
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

      <section className="border-t border-border px-6 md:px-12 py-16">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-10">SERVICES</p>
        </Reveal>
        <Stagger as="ul" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12" stagger={0.07}>
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

      <section className="border-t border-border px-6 md:px-12 py-16">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-10">CLIENTS</p>
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

      <SiteFooter />
    </div>
  );
}