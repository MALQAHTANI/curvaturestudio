import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import projects from "@/data/projects.json";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Curvature Studio" },
      { name: "description", content: "Selected work from Curvature Studio — commercial, automotive, and cinematic productions." },
      { property: "og:title", content: "Portfolio — Curvature Studio" },
      { property: "og:description", content: "Selected work from Curvature Studio." },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const items = (projects as any[])
    .filter((p) => p.published && p.cover_image && !p.cover_image.includes("88e8419e"))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-40 pb-16">
        <p className="text-[11px] text-muted-foreground mb-6">PORTFOLIO</p>
        <h1 className="display-lg">SELECTED<br />WORK.</h1>
      </section>
      <section className="border-t border-border px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {items.map((p, i) => (
            <div key={p.id} className="group">
              <div className="aspect-[4/3] overflow-hidden bg-white/5">
                <img
                  src={p.cover_image}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex justify-between mt-4 text-[11px] gap-4">
                <div className="flex gap-3 min-w-0">
                  <span className="text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate">{p.title}</span>
                </div>
                {p.client && <span className="text-muted-foreground shrink-0 truncate">{p.client}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}