import { useCallback, useEffect, useRef, useState } from "react";
import { isVideo } from "@/lib/media";

export type LightboxItem = {
  title: string;
  category?: string;
  description?: string;
  images: string[];
};

export function Lightbox({
  item,
  onClose,
  startIndex = 0,
}: {
  item: LightboxItem | null;
  onClose: () => void;
  startIndex?: number;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const touchX = useRef<number | null>(null);

  const total = item?.images.length ?? 0;

  const next = useCallback(() => setIndex((i) => (total ? (i + 1) % total : 0)), [total]);
  const prev = useCallback(() => setIndex((i) => (total ? (i - 1 + total) % total : 0)), [total]);

  useEffect(() => {
    if (!item) {
      setVisible(false);
      return;
    }
    setIndex(startIndex < (item.images.length ?? 0) ? startIndex : 0);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [item, startIndex]);

  useEffect(() => setZoomed(false), [index, item]);

  // preload neighbours
  useEffect(() => {
    if (!item || total < 2) return;
    [ (index + 1) % total, (index - 1 + total) % total ].forEach((i) => {
      const src = item.images[i];
      if (src && !isVideo(src)) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [item, index, total]);

  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose, next, prev]);

  if (!item) return null;
  const src = item.images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className={`fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div className="flex items-start justify-between gap-4 px-5 md:px-10 pt-6">
        <div className="min-w-0">
          {item.category && (
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{item.category}</p>
          )}
          <h2 className="truncate text-base md:text-xl" style={{ fontFamily: "Jost, sans-serif" }}>
            {item.title}
          </h2>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close gallery"
          className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ESC ✕
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-3 md:px-16 py-6"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 45) (dx < 0 ? next : prev)();
          touchX.current = null;
        }}
      >
        {total > 1 && (
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-2 md:left-5 z-10 h-11 w-11 rounded-full border border-border bg-background/60 text-foreground/80 shadow-lg backdrop-blur transition-colors hover:text-foreground"
          >
            ‹
          </button>
        )}
        <div
          key={src}
          className={`max-h-full max-w-full overflow-auto rounded-2xl transition-all duration-300 ${
            visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          style={{ touchAction: "pinch-zoom" }}
        >
          {isVideo(src) ? (
            <video src={src} controls autoPlay playsInline className="max-h-[68vh] max-w-full rounded-2xl" />
          ) : (
            <img
              src={src}
              alt={`${item.title} — ${index + 1}`}
              decoding="async"
              onDoubleClick={() => setZoomed((z) => !z)}
              className={`rounded-2xl object-contain transition-transform duration-300 ${
                zoomed ? "max-h-none max-w-none scale-100 cursor-zoom-out" : "max-h-[68vh] max-w-full cursor-zoom-in"
              }`}
              style={zoomed ? { height: "150vh" } : undefined}
            />
          )}
        </div>
        {total > 1 && (
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 md:right-5 z-10 h-11 w-11 rounded-full border border-border bg-background/60 text-foreground/80 shadow-lg backdrop-blur transition-colors hover:text-foreground"
          >
            ›
          </button>
        )}
      </div>

      <div className="px-5 md:px-10 pb-8 text-center" onClick={(e) => e.stopPropagation()}>
        {total > 1 && (
          <div className="mb-4 flex justify-center gap-2 overflow-x-auto px-1 py-1">
            {item.images.map((thumb, i) => (
              <button
                key={thumb + i}
                onClick={() => setIndex(i)}
                aria-label={`Image ${i + 1}`}
                className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border transition-opacity ${
                  i === index ? "border-foreground opacity-100" : "border-border opacity-50 hover:opacity-90"
                }`}
              >
                {isVideo(thumb) ? (
                  <video src={thumb} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <img src={thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
        {item.description && (
          <p className="mx-auto mb-3 max-w-2xl text-xs text-muted-foreground">{item.description}</p>
        )}
        <p className="font-mono text-[11px] text-muted-foreground">
          {index + 1} / {total}
        </p>
      </div>
    </div>
  );
}