import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Curvature Studio" },
      { name: "description", content: "Choose a section — Portfolio or The Studio." },
      { property: "og:title", content: "Portfolio — Curvature Studio" },
      { property: "og:description", content: "Choose a section — Portfolio or The Studio." },
    ],
  }),
  component: PortfolioChooser,
});

function Tile({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="group relative flex items-center justify-center aspect-square md:aspect-auto md:h-[calc(100vh-6rem)] bg-white/[0.03] overflow-hidden"
    >
      <span
        className="relative z-10 text-[8vw] md:text-[4.5vw] leading-none tracking-[-0.02em] text-foreground/85 transition-transform duration-700 group-hover:scale-[1.03]"
        style={{ fontFamily: "Jost, sans-serif", fontWeight: 500 }}
      >
        {label}
      </span>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  );
}

function PortfolioChooser() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/portfolio") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 px-2 md:px-3 pb-3">
          <Tile to="/portfolio/projects" label="PORTFOLIO" />
          <Tile to="/studio" label="THE STUDIO" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}