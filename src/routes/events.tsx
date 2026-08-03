import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { Reveal, RevealLines } from "@/components/motion/primitives";
import { MotionButton } from "@/components/motion/button";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Event Registration — Curvature Studio" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private event registration for Curvature Studio guests." },
      { property: "og:title", content: "Event Registration — Curvature Studio" },
      { property: "og:description", content: "Register your attendance." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formStyle = { fontFamily: "Jost, sans-serif", textTransform: "none" as const };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const eventName = String(fd.get("event_name") ?? "").trim();
    const note = String(fd.get("note") ?? "").trim();
    if (!name || !email) {
      setError("Please enter your name and email.");
      return;
    }
    setError(null);
    setSending(true);
    const { error: err } = await (supabase.from("event_registrations" as never) as any).insert({
      name: name.slice(0, 120),
      email: email.slice(0, 255),
      phone: phone ? phone.slice(0, 40) : null,
      event_name: eventName ? eventName.slice(0, 200) : null,
      note: note ? note.slice(0, 2000) : null,
    });
    setSending(false);
    if (err) {
      setError("Couldn't submit your registration. Please try again.");
      return;
    }
    setSent(true);
    form.reset();
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-foreground/[0.03] px-4 py-3 text-[14px] transition-colors focus:border-foreground/60 focus:outline-none";
  const labelCls = "block text-[11px] uppercase tracking-[0.1em] text-muted-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="px-6 md:px-12 pt-44 pb-12 md:pb-20">
        <Reveal>
          <p className="mb-6 text-[11px] text-muted-foreground">EVENTS / REGISTRATION</p>
        </Reveal>
        <RevealLines className="text-3xl md:text-5xl" lines={["Event Registration"]} delay={0.15} />
        <Reveal delay={0.3}>
          <p
            className="mt-8 max-w-xl text-muted-foreground normal-case tracking-normal"
            style={{ ...formStyle, fontSize: "14px", lineHeight: 1.7 }}
          >
            Leave your name and contact details and our team will confirm your place.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-border px-6 md:px-12 py-20 md:py-32">
        <Reveal className="mx-auto w-full max-w-2xl rounded-[24px] border border-white/10 bg-foreground/[0.04] p-8 md:p-12 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-8" style={formStyle}>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>Full name</label>
                <input name="name" type="text" required className={field} />
              </div>
              <div className="space-y-2">
                <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>Email</label>
                <input name="email" type="email" required className={field} />
              </div>
              <div className="space-y-2">
                <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>Phone</label>
                <input name="phone" type="tel" className={field} />
              </div>
              <div className="space-y-2">
                <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>Event</label>
                <input name="event_name" type="text" className={field} />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>Note</label>
              <textarea name="note" rows={4} className={`${field} resize-none`} />
            </div>
            <MotionButton
              type="submit"
              disabled={sending}
              className="w-full rounded-full border border-white/15 bg-foreground/10 px-10 py-5 text-[12px] uppercase tracking-[0.2em] backdrop-blur-md transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {sending ? "SENDING…" : "Register ↗"}
            </MotionButton>
            {error && (
              <p className="text-[11px] text-destructive normal-case tracking-normal" style={formStyle}>{error}</p>
            )}
            {sent && (
              <p className="text-[11px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                THANKS — YOUR REGISTRATION IS RECEIVED.
              </p>
            )}
          </form>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}