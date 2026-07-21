import { Link } from "@tanstack/react-router";

// External employee login URL — update via VITE_EMPLOYEE_LOGIN_URL when known.
const EMPLOYEE_LOGIN_URL =
  (import.meta.env.VITE_EMPLOYEE_LOGIN_URL as string | undefined) ?? "#";

const NAV = [
  { to: "/", label: "HOME" },
  { to: "/portfolio", label: "PORTFOLIO" },
  { to: "/about", label: "ABOUT" },
  { to: "/contact", label: "CONTACT" },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-background/70 backdrop-blur-md border-b border-border">
      <Link
        to="/"
        className="text-[15px] font-medium tracking-tight normal-case"
        style={{ fontFamily: "Jost, sans-serif", letterSpacing: "-0.01em" }}
        aria-label="Curvature Studio"
      >
        Curvature Studio
      </Link>

      <nav className="hidden sm:flex gap-6 md:gap-8 text-[11px]">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground transition-colors" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <span className="w-[1px]" aria-hidden />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 md:px-12 py-10 flex flex-col md:flex-row md:justify-between gap-4 text-[10px] text-muted-foreground tracking-[0.15em]">
      <p>© CURVATURE STUDIO — ALL RIGHTS RESERVED</p>
      <p>SAUDI ARABIA — JEDDAH</p>
      <a
        href={EMPLOYEE_LOGIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        دخول الموظفين ↗
      </a>
    </footer>
  );
}