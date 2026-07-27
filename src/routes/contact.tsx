import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { Reveal, RevealLines, Stagger, StaggerItem } from "@/components/motion/primitives";
import { MotionButton } from "@/components/motion/button";

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
    const company = String(fd.get("company") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    if (!name || !email || !message) { setError("Please fill in the required fields."); return; }
    setError(null); setSending(true);
    const { error: err } = await supabase.from("contact_messages").insert({
      name: name.slice(0, 100),
      email: email.slice(0, 255),
      company: company ? company.slice(0, 200) : null,
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
      <section className="px-6 md:px-12 pt-40 pb-16">
        <Reveal>
          <p className="text-[11px] text-muted-foreground mb-6">CONTACT</p>
        </Reveal>
        <RevealLines className="display-lg" lines={["LET'S", "TALK."]} delay={0.15} />
        <Reveal delay={0.35} className="mt-8 max-w-lg">
          <p className="text-muted-foreground normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px", lineHeight: 1.6 }}>
            Tell us about your project. We reply within 48 hours.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-border px-6 md:px-12 py-16">
        <Stagger className="grid md:grid-cols-2 gap-16 max-w-5xl" stagger={0.12}>
          <StaggerItem
            as="form"
            className="space-y-6"
            style={formStyle}
            onSubmit={handleSubmit as never}
          >
            {[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "company", label: "Company", type: "text", required: false },
            ].map((f) => (
              <div key={f.name} className="space-y-2">
                <label className="block text-[11px] uppercase tracking-[0.1em] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{f.label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  required={f.required}
                  className="w-full bg-transparent border-b border-border py-3 text-[14px] focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>Message</label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full bg-transparent border-b border-border py-3 text-[14px] focus:outline-none focus:border-foreground transition-colors resize-none"
              />
            </div>
            <MotionButton
              type="submit"
              disabled={sending}
              className="text-[11px] uppercase tracking-[0.15em] border border-border px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
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
          </StaggerItem>

          <StaggerItem className="space-y-8 text-[11px]">
            <div>
              <p className="text-muted-foreground mb-2">EMAIL</p>
              <p className="normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px" }}>
                info@curvaturestudio.com
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">PHONE</p>
              <p className="normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px" }}>+966 54 555 3889</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">LOCATION</p>
              <p className="normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px" }}>Saudi Arabia — Jeddah</p>
            </div>
          </StaggerItem>
        </Stagger>
      </section>

      <SiteFooter />
    </div>
  );
}