import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

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
  const formStyle = { fontFamily: "Jost, sans-serif", textTransform: "none" as const };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-40 pb-16">
        <p className="text-[11px] text-muted-foreground mb-6">CONTACT</p>
        <h1 className="display-lg">LET'S<br />TALK.</h1>
        <p className="mt-8 max-w-lg text-muted-foreground normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px", lineHeight: 1.6 }}>
          Tell us about your project. We reply within 48 hours.
        </p>
      </section>

      <section className="border-t border-border px-6 md:px-12 py-16">
        <div className="grid md:grid-cols-2 gap-16 max-w-5xl">
          <form
            className="space-y-6"
            style={formStyle}
            onSubmit={(e) => { e.preventDefault(); setSent(true); (e.currentTarget as HTMLFormElement).reset(); }}
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
            <button
              type="submit"
              className="text-[11px] uppercase tracking-[0.15em] border border-border px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              Send Message ↗
            </button>
            {sent && (
              <p className="text-[11px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                THANKS — WE'LL BE IN TOUCH.
              </p>
            )}
          </form>

          <div className="space-y-8 text-[11px]">
            <div>
              <p className="text-muted-foreground mb-2">EMAIL</p>
              <a href="mailto:info@curvaturestudio.com" className="hover:text-muted-foreground normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px" }}>
                info@curvaturestudio.com
              </a>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">PHONE</p>
              <p className="normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px" }}>+966 54 555 3889</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">LOCATION</p>
              <p className="normal-case tracking-normal" style={{ ...formStyle, fontSize: "14px" }}>Saudi Arabia — Jeddah</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}