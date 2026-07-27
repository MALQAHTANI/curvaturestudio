import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/portfolio")({
  beforeLoad: ({ location }) => {
    if (location.pathname.replace(/\/$/, "") === "/portfolio") {
      throw redirect({ to: "/portfolio/projects" });
    }
  },
  head: () => ({
    meta: [
      { title: "Portfolio — Curvature Studio" },
      { name: "description", content: "Selected work by Curvature Studio." },
      { property: "og:title", content: "Portfolio — Curvature Studio" },
      { property: "og:description", content: "Selected work by Curvature Studio." },
    ],
  }),
  component: PortfolioLayout,
});

function PortfolioLayout() {
  return <Outlet />;
}