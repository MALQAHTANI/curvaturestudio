import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { Reveal, RevealLines, Stagger, StaggerItem } from "@/components/motion/primitives";
import { MotionButton } from "@/components/motion/button";
import contactVideo from "@/assets/contact-bg.mp4.asset.json";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Curvature Studio" },
      { name: "description", content: "Get in touch with Curvature Studio — Jeddah, Saudi Arabia." },
      { property: "og:title", content: "Contact — Curvature Studio" },
      { property: "og:description", content: "Tell us about your project." },
    ],
  }),
  component: Contact,
});

function Contact() {
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
    const subject = String(fd.get("subject") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    if (!name || !email || !message) { setError("Please fill in the required fields."); return; }
    setError(null); setSending(true);
    const { error: err } = await supabase.from("contact_messages").insert({
      name: name.slice(0, 100),
      email: email.slice(0, 255),
      company: subject ? subject.slice(0, 200) : null,
      message: message.slice(0, 5000),
    });
    setSending(false);
    if (err) { setError("Couldn't send your message. Please try again."); return; }
    setSent(true);
    form.reset();
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Full-screen looping background video */}
      <section className="relative flex h-[100svh] items-center justify-center overflow-hidden px-6 text-center">
        <motion.video
          className="absolute inset-0 h-full w-full object-cover"
          src={contactVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.04 }}
          transition={{
            opacity: { duration: 1.2, ease: "easeOut" },
            scale: { duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" },
          }}
          style={{ willChange: "transform, opacity" }}
        />
        <div aria-hidden className="absolute inset-0 bg-background/70" />
        <div className="relative">
          <Reveal>
            <p className="mb-6 text-[11px] text-muted-foreground">CONTACT</p>
          </Reveal>
          <RevealLines className="display-lg" lines={["LET'S", "TALK."]} delay={0.15} />
          <Reveal delay={0.35} className="mx-auto mt-8 max-w-lg">
            <p className="text-muted-foreground normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px", lineHeight: 1.6 }}>
              Tell us about your project. We reply within 48 hours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Details */}
      <section className="border-t border-border px-6 md:px-12 py-20 md:py-28">
        <Stagger className="grid gap-14 md:grid-cols-3" stagger={0.1}>
          <StaggerItem className="space-y-8 text-[11px]">
            <p className="text-muted-foreground">CONTACT</p>
            <div>
              <p className="text-muted-foreground mb-2">EMAIL</p>
              <a href="mailto:info@curvaturestudio.com" className="normal-case tracking-normal nav-underline" style={{ ...formStyle, fontSize: "14px" }}>
                info@curvaturestudio.com
              </a>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">PHONE</p>
              <a href="tel:+966545553889" className="normal-case tracking-normal nav-underline" style={{ ...formStyle, fontSize: "14px" }}>+966 54 555 3889</a>
            </div>
          </StaggerItem>
          <StaggerItem className="space-y-8 text-[11px]">
            <p className="text-muted-foreground">OFFICE</p>
            <p className="normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px", lineHeight: 1.7 }}>
              Saudi Arabia — Jeddah
            </p>
            <div>
              <p className="text-muted-foreground mb-2">CAREERS</p>
              <a href="mailto:careers@curvaturestudio.com" className="normal-case tracking-normal nav-underline" style={{ ...formStyle, fontSize: "14px" }}>
                careers@curvaturestudio.com
              </a>
            </div>
          </StaggerItem>
          <StaggerItem className="space-y-8 text-[11px]">
            <p className="text-muted-foreground">SOCIAL MEDIA</p>
            <ul className="space-y-3">
              {[
                { label: "INSTAGRAM", href: "https://instagram.com/curvaturestudio" },
                { label: "BEHANCE", href: "https://behance.net/curvaturestudio" },
                { label: "LINKEDIN", href: "https://linkedin.com/company/curvaturestudio" },
                { label: "DRIBBBLE", href: "https://dribbble.com/curvaturestudio" },
              ].map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="nav-underline text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </Stagger>
      </section>

      {/* Glass contact form */}
      <section className="border-t border-border px-6 md:px-12 py-24 md:py-36">
        <Reveal className="mx-auto w-full max-w-3xl rounded-[24px] border border-white/10 bg-foreground/[0.04] p-8 md:p-12 backdrop-blur-xl shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)]">
          <p className="mb-10 text-[11px] text-muted-foreground">START A PROJECT</p>
          <form onSubmit={handleSubmit} className="space-y-8" style={formStyle}>
            <div className="grid gap-8 md:grid-cols-2">
              {[
                { name: "name", label: "Name", type: "text", required: true },
                { name: "email", label: "Email", type: "email", required: true },
              ].map((f) => (
                <div key={f.name} className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{f.label}</label>
                  <input
                    name={f.name}
                    type={f.type}
                    required={f.required}
                    className="w-full rounded-xl border border-white/10 bg-foreground/[0.03] px-4 py-3 text-[14px] transition-colors focus:border-foreground/60 focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>Subject</label>
              <input
                name="subject"
                type="text"
                className="w-full rounded-xl border border-white/10 bg-foreground/[0.03] px-4 py-3 text-[14px] transition-colors focus:border-foreground/60 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>Message</label>
              <textarea
                name="message"
                required
                rows={6}
                className="w-full resize-none rounded-xl border border-white/10 bg-foreground/[0.03] px-4 py-3 text-[14px] transition-colors focus:border-foreground/60 focus:outline-none"
              />
            </div>
            <MotionButton
              type="submit"
              disabled={sending}
              className="w-full rounded-full border border-white/15 bg-foreground/10 px-10 py-5 text-[12px] uppercase tracking-[0.2em] backdrop-blur-md transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {sending ? "SENDING…" : "Send Message ↗"}
            </MotionButton>
            {error && (
              <p className="text-[11px] text-destructive normal-case tracking-normal" style={formStyle}>{error}</p>
            )}
            {sent && (
              <p className="text-[11px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                THANKS — WE'LL BE IN TOUCH.
              </p>
            )}
          </form>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}