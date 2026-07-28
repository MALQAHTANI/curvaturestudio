import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { DUR, EASE, fadeUp, staggerParent, viewportOnce } from "@/lib/motion";
import { useMotionEnabled } from "@/components/motion/use-motion-enabled";
import logoSrc from "@/assets/logo.png";

const NAV = [
  { to: "/studio", label: "STUDIO" },
  { to: "/portfolio", label: "PORTFOLIO" },
  { to: "/news", label: "NEWS" },
  { to: "/contact", label: "CONTACT" },
] as const;

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const enabled = useMotionEnabled();
  const [mounted, setMounted] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
    <motion.header
      className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-between px-6 md:px-12 border-b"
      initial={false}
      animate={{
        paddingTop: scrolled ? 12 : 20,
        paddingBottom: scrolled ? 12 : 20,
        backgroundColor: scrolled && !menuOpen ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
        backdropFilter: scrolled && !menuOpen ? "blur(14px)" : "blur(0px)",
        boxShadow: scrolled ? "0 10px 30px -18px rgba(0,0,0,0.9)" : "0 0px 0px 0px rgba(0,0,0,0)",
        borderColor: scrolled && !menuOpen ? "var(--border)" : "rgba(0,0,0,0)",
      }}
      transition={{ duration: DUR.fast, ease: EASE }}
      style={{ willChange: "transform, opacity" }}
    >
      <motion.div
        initial={enabled ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.hero, ease: EASE, delay: 0.1 }}
        className="shrink-0"
      >
      <Link
        to="/"
        onClick={() => setMenuOpen(false)}
        className="block shrink-0"
        aria-label="Curvature Studio"
      >
        <span
          className="block select-none bg-transparent text-foreground text-[15px] leading-none tracking-[0.02em] md:text-[18px]"
          style={{ fontFamily: "Jost, sans-serif", fontWeight: 600, textTransform: "uppercase" }}
        >
          Curvature Studio
        </span>
      </Link>
      </motion.div>

      <nav className="hidden sm:flex gap-6 md:gap-8 text-[11px]">
        {NAV.map((n, i) => (
          <motion.span
            key={n.to}
            initial={enabled ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE, delay: 0.2 + i * 0.06 }}
            style={{ willChange: "transform, opacity" }}
          >
            <Link
              to={n.to}
              className="nav-underline"
              activeProps={{ className: "text-foreground is-active" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground transition-colors" }}
            >
              {n.label}
            </Link>
          </motion.span>
        ))}
      </nav>

      <span className="block w-7 sm:w-[1px]" aria-hidden />
    </motion.header>

    {mounted &&
      createPortal(
      <>
      <motion.button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        className="fixed right-6 z-[75] flex h-6 w-7 flex-col items-end justify-center gap-[6px] text-foreground sm:hidden"
        initial={false}
        animate={{ top: scrolled ? 18 : 26 }}
        transition={{ duration: DUR.fast, ease: EASE }}
      >
        <motion.span
          className="block h-[1.5px] w-7 origin-center bg-foreground"
          animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 3.75 : 0 }}
          transition={{ duration: DUR.fast, ease: EASE }}
        />
        <motion.span
          className="block h-[1.5px] origin-center bg-foreground"
          animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -3.75 : 0, width: menuOpen ? 28 : 20 }}
          transition={{ duration: DUR.fast, ease: EASE }}
        />
      </motion.button>
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col justify-center gap-2 bg-background/95 px-8 text-foreground backdrop-blur-xl sm:hidden"
          initial={enabled ? { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" } : false}
          animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: DUR.base, ease: EASE }}
        >
          {NAV.map((n, i) => (
            <div key={n.to} className="overflow-hidden py-1">
              <motion.div
                initial={enabled ? { y: "110%", opacity: 0 } : false}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "60%", opacity: 0 }}
                transition={{ duration: DUR.slow, ease: EASE, delay: 0.08 + i * 0.07 }}
              >
                <Link
                  to={n.to}
                  onClick={() => setMenuOpen(false)}
                  className="block text-[13vw] leading-[1.05] tracking-[-0.02em] text-foreground/90"
                  style={{ fontFamily: "Jost, sans-serif", fontWeight: 500 }}
                >
                  {n.label}
                </Link>
              </motion.div>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
      </>,
        document.body,
      )}
    </>
  );
}

export function SiteFooter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useMotionEnabled();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <motion.footer
      className="border-t border-border px-6 md:px-12 py-10 flex flex-col md:flex-row md:justify-between gap-4 text-[10px] text-muted-foreground tracking-[0.15em]"
      initial={enabled ? "hidden" : false}
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerParent(0.1)}
    >
      <motion.p variants={fadeUp}>© CURVATURE STUDIO — ALL RIGHTS RESERVED</motion.p>
      <motion.p variants={fadeUp}>SAUDI ARABIA — JEDDAH</motion.p>
      <motion.div className="relative" ref={ref} variants={fadeUp}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="hover:text-foreground transition-colors tracking-[0.15em]"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          PROFILE ↗
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: DUR.fast, ease: EASE }}
              className="absolute right-0 bottom-full mb-2 min-w-[180px] border border-border bg-background/95 backdrop-blur-md text-[10px] tracking-[0.15em] origin-bottom-right"
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.footer>
  );
}