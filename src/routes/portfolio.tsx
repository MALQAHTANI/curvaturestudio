import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { DUR, EASE } from "@/lib/motion";

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

const MotionLink = motion.create(Link);

function Tile({ to, label, delay = 0 }: { to: string; label: string; delay?: number }) {
  return (
    <MotionLink
      to={to}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.slow, ease: EASE, delay }}
      whileHover="hovered"
      whileTap={{ scale: 0.995 }}
      className="group relative flex items-center justify-center aspect-square md:aspect-auto md:h-[calc(100vh-6rem)] bg-white/[0.03] overflow-hidden"
    >
      <motion.span
        className="relative z-10 text-[8vw] md:text-[4.5vw] leading-none tracking-[-0.02em] text-foreground/85 will-change-transform"
        variants={{ hovered: { scale: 1.04, y: -6 } }}
        transition={{ duration: DUR.slow, ease: EASE }}
        style={{ fontFamily: "Jost, sans-serif", fontWeight: 500 }}
      >
        {label}
      </motion.span>
      <motion.span
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/[0.06]"
        initial={{ opacity: 0 }}
        variants={{ hovered: { opacity: 1 } }}
        transition={{ duration: DUR.fast, ease: EASE }}
      />
    </MotionLink>
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
          <Tile to="/studio" label="THE STUDIO" delay={0.1} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}