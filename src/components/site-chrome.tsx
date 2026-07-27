import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { DUR, EASE, fadeUp, staggerParent, viewportOnce } from "@/lib/motion";
import { useMotionEnabled } from "@/components/motion/use-motion-enabled";

const NAV = [
  { to: "/", label: "HOME" },
  { to: "/portfolio", label: "PORTFOLIO" },
  { to: "/about", label: "ABOUT" },
  { to: "/contact", label: "CONTACT" },
] as const;

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 border-b"
      initial={false}
      animate={{
        paddingTop: scrolled ? 12 : 20,
        paddingBottom: scrolled ? 12 : 20,
        backgroundColor: scrolled ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
        backdropFilter: scrolled ? "blur(14px)" : "blur(0px)",
        boxShadow: scrolled ? "0 10px 30px -18px rgba(0,0,0,0.9)" : "0 0px 0px 0px rgba(0,0,0,0)",
        borderColor: scrolled ? "var(--border)" : "rgba(0,0,0,0)",
      }}
      transition={{ duration: DUR.fast, ease: EASE }}
      style={{ willChange: "transform, opacity" }}
    >
      <Link
        to="/"
        className="nav-underline text-[15px] font-medium tracking-tight normal-case"
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
            className="nav-underline"
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground transition-colors" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <span className="w-[1px]" aria-hidden />
    </motion.header>
  );
}

export function SiteFooter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <footer className="border-t border-border px-6 md:px-12 py-10 flex flex-col md:flex-row md:justify-between gap-4 text-[10px] text-muted-foreground tracking-[0.15em]">
      <p>© CURVATURE STUDIO — ALL RIGHTS RESERVED</p>
      <p>SAUDI ARABIA — JEDDAH</p>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="hover:text-foreground transition-colors tracking-[0.15em]"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          PROFILE ↗
        </button>
        {open && (
          <div
            role="menu"
            className="absolute right-0 bottom-full mb-2 min-w-[180px] border border-border bg-background/95 backdrop-blur-md text-[10px] tracking-[0.15em]"
          >
            <Link
              to="/portfolio"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 border-b border-border"
            >
              PROJECTS
            </Link>
            <Link
              to="/studio"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 border-b border-border"
            >
              STUDIO
            </Link>
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              EMPLOYEE LOGIN
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
}