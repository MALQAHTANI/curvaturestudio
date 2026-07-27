import { useEffect, useState } from "react";
import { Accessibility, Minus, Plus, RotateCcw, X } from "lucide-react";

type A11yPrefs = {
  fontScale: number;
  contrast: boolean;
  underline: boolean;
  reduceMotion: boolean;
};

const DEFAULTS: A11yPrefs = {
  fontScale: 100,
  contrast: false,
  underline: false,
  reduceMotion: false,
};

const STORAGE_KEY = "cs-a11y";

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--a11y-font-scale", String(prefs.fontScale / 100));
    root.classList.toggle("a11y-contrast", prefs.contrast);
    root.classList.toggle("a11y-underline", prefs.underline);
    root.classList.toggle("a11y-reduce-motion", prefs.reduceMotion);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const set = <K extends keyof A11yPrefs>(k: K, v: A11yPrefs[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  const toggles: { key: keyof A11yPrefs; label: string }[] = [
    { key: "contrast", label: "HIGH CONTRAST" },
    { key: "underline", label: "UNDERLINE LINKS" },
    { key: "reduceMotion", label: "REDUCE MOTION" },
  ];

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] flex items-start">
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility options"
          className="mr-2 w-[240px] border border-border bg-background/95 backdrop-blur-md p-4 text-[10px] tracking-[0.15em]"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground">ACCESSIBILITY</span>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </div>

          <div className="flex items-center justify-between border border-border px-3 py-2 mb-3">
            <button
              type="button"
              aria-label="Decrease text size"
              onClick={() => set("fontScale", Math.max(85, prefs.fontScale - 10))}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-foreground">TEXT {prefs.fontScale}%</span>
            <button
              type="button"
              aria-label="Increase text size"
              onClick={() => set("fontScale", Math.min(150, prefs.fontScale + 10))}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {toggles.map((t) => {
              const active = Boolean(prefs[t.key]);
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set(t.key, !active as never)}
                  className={`flex items-center justify-between border border-border px-3 py-2 transition-colors ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{t.label}</span>
                  <span>{active ? "ON" : "OFF"}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setPrefs(DEFAULTS)}
            className="mt-4 flex w-full items-center justify-center gap-2 border border-border px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> RESET
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Accessibility options"
        title="Accessibility"
        className="flex h-11 w-11 items-center justify-center border border-border border-r-0 bg-background/90 backdrop-blur-md text-foreground hover:bg-foreground hover:text-background transition-colors"
      >
        <Accessibility className="h-5 w-5" />
      </button>
    </div>
  );
}