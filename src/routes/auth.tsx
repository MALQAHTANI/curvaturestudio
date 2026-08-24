import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { db as supabase } from "@/lib/db";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "دخول الموظفين — Curvature Studio" },
      { name: "description", content: "بوابة دخول الموظفين إلى لوحة التحكم." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setNotice(null); setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) throw error;
        setNotice("تم إنشاء الحساب. يمكنك تسجيل الدخول الآن.");
        setMode("signin");
      }
    } catch (err: any) {
      setError(err?.message ?? "حدث خطأ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-16">
        <div className="w-full max-w-md">
          <p className="text-[11px] text-muted-foreground mb-4">EMPLOYEE ACCESS</p>
          <h1 className="text-3xl md:text-4xl mb-8" style={{ fontFamily: "Jost, sans-serif", letterSpacing: "-0.02em" }}>
            {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
          </h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-2">EMAIL</label>
              <input
                type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-border px-3 py-2 text-sm normal-case tracking-normal focus:outline-none focus:border-foreground"
                style={{ fontFamily: "Jost, sans-serif" }}
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-2">PASSWORD</label>
              <input
                type="password" required minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-border px-3 py-2 text-sm normal-case tracking-normal focus:outline-none focus:border-foreground"
                style={{ fontFamily: "Jost, sans-serif" }}
              />
            </div>
            {error && <p className="text-[11px] text-destructive normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>{error}</p>}
            {notice && <p className="text-[11px] text-foreground normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>{notice}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full border border-foreground text-foreground px-4 py-3 text-[11px] tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
            >
              {loading ? "..." : mode === "signin" ? "SIGN IN ↗" : "CREATE ACCOUNT ↗"}
            </button>
          </form>
          <button
            type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setNotice(null); }}
            className="mt-6 text-[10px] text-muted-foreground hover:text-foreground tracking-[0.15em]"
          >
            {mode === "signin" ? "CREATE AN ACCOUNT ↗" : "BACK TO SIGN IN ↗"}
          </button>
          <div className="mt-8"><Link to="/" className="text-[10px] text-muted-foreground hover:text-foreground tracking-[0.15em]">← BACK HOME</Link></div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}