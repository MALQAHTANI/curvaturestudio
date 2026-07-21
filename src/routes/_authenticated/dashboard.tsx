import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { uploadMedia, isVideo, acceptedMime } from "@/lib/media";

type Tab = "projects" | "studio";
type Item = {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  media_urls: string[];
  published: boolean;
  sort_order: number;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — Curvature Studio" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [tab, setTab] = useState<Tab>("projects");
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setEmail(u.user?.email ?? "");
      const { data } = await supabase
        .from("user_roles").select("role").eq("user_id", u.user!.id).eq("role", "employee").maybeSingle();
      setIsEmployee(!!data);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 md:px-12 pt-32 pb-16">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-[11px] text-muted-foreground mb-2">DASHBOARD</p>
            <h1 className="text-2xl md:text-3xl" style={{ fontFamily: "Jost, sans-serif", letterSpacing: "-0.02em" }}>
              لوحة التحكم
            </h1>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground tracking-[0.15em]">
            <span className="normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>{email}</span>
            <button onClick={signOut} className="hover:text-foreground">SIGN OUT ↗</button>
          </div>
        </div>

        {isEmployee === false && (
          <div className="border border-border p-6 text-[11px] tracking-normal normal-case" style={{ fontFamily: "Jost, sans-serif" }}>
            حسابك ليس لديه صلاحية موظف. تواصل مع الموظف المسؤول لمنحك الصلاحية.
          </div>
        )}

        {isEmployee && (
          <>
            <div className="flex gap-2 border-b border-border mb-8">
              {(["projects", "studio"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-[11px] tracking-[0.15em] -mb-px border-b ${tab === t ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                  {t === "projects" ? "PROJECTS" : "STUDIO"}
                </button>
              ))}
            </div>
            <SectionEditor
              key={tab}
              table={tab === "projects" ? "projects" : "studio_items"}
              label={tab === "projects" ? "مشروع" : "عنصر استديو"}
            />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function SectionEditor({ table, label }: { table: "projects" | "studio_items"; label: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    if (!error) setItems((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, [table]);

  async function remove(id: string) {
    if (!confirm("حذف هذا العنصر؟")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { alert(error.message); return; }
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[11px] text-muted-foreground">{items.length} ITEMS</p>
        <button onClick={() => setShowForm((v) => !v)} className="text-[11px] border-b border-foreground pb-0.5">
          {showForm ? "إغلاق" : `+ إضافة ${label}`}
        </button>
      </div>

      {showForm && (
        <div className="border border-border p-6 mb-8">
          <ItemForm table={table} onDone={() => { setShowForm(false); refresh(); }} />
        </div>
      )}

      {loading ? (
        <p className="text-[11px] text-muted-foreground">LOADING…</p>
      ) : items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">لا توجد عناصر بعد.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <li key={it.id} className="border border-border">
              <div className="aspect-[4/3] bg-white/5 overflow-hidden">
                {it.cover_image ? (
                  isVideo(it.cover_image) ? (
                    <video src={it.cover_image} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={it.cover_image} alt={it.title} className="w-full h-full object-cover" />
                  )
                ) : it.media_urls[0] ? (
                  isVideo(it.media_urls[0])
                    ? <video src={it.media_urls[0]} className="w-full h-full object-cover" muted />
                    : <img src={it.media_urls[0]} alt={it.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="p-4">
                <div className="text-[12px] normal-case tracking-normal truncate" style={{ fontFamily: "Jost, sans-serif" }}>{it.title}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {it.media_urls.length} MEDIA · {it.published ? "PUBLISHED" : "DRAFT"}
                </div>
                <div className="mt-3 flex justify-between text-[10px] tracking-[0.15em]">
                  <button onClick={() => remove(it.id)} className="text-destructive hover:opacity-70">DELETE ↗</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemForm({ table, onDone }: { table: "projects" | "studio_items"; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    const ok: File[] = []; const bad: string[] = [];
    for (const f of list) (acceptedMime(f) ? ok : bad).push(f as File);
    setFiles(ok);
    setRejected(bad.map((f: any) => f.name));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("العنوان مطلوب."); return; }
    if (files.length === 0) { setError("أضف صورة أو فيديو واحد على الأقل."); return; }
    setError(null); setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setProgress(`رفع ${i + 1}/${files.length}…`);
        urls.push(await uploadMedia(files[i]));
      }
      setProgress("حفظ…");
      const { error } = await supabase.from(table).insert({
        title: title.trim(),
        description: description.trim() || null,
        cover_image: urls[0],
        media_urls: urls,
      });
      if (error) throw error;
      onDone();
    } catch (err: any) {
      setError(err?.message ?? "فشل الرفع.");
    } finally {
      setUploading(false); setProgress("");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-[11px] text-muted-foreground mb-2">TITLE</label>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200}
          className="w-full bg-transparent border border-border px-3 py-2 text-sm normal-case tracking-normal focus:outline-none focus:border-foreground"
          style={{ fontFamily: "Jost, sans-serif" }}
        />
      </div>
      <div>
        <label className="block text-[11px] text-muted-foreground mb-2">DESCRIPTION</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000}
          className="w-full bg-transparent border border-border px-3 py-2 text-sm normal-case tracking-normal focus:outline-none focus:border-foreground"
          style={{ fontFamily: "Jost, sans-serif" }}
        />
      </div>
      <div>
        <label className="block text-[11px] text-muted-foreground mb-2">MEDIA (صور / فيديوهات)</label>
        <input
          type="file" accept="image/*,video/*" multiple onChange={onPick}
          className="block w-full text-[11px] normal-case tracking-normal file:mr-3 file:px-3 file:py-2 file:border file:border-border file:bg-transparent file:text-foreground file:text-[10px] file:tracking-[0.15em] file:cursor-pointer"
          style={{ fontFamily: "Jost, sans-serif" }}
        />
        {files.length > 0 && (
          <p className="mt-2 text-[10px] text-muted-foreground">{files.length} ملف مقبول</p>
        )}
        {rejected.length > 0 && (
          <p className="mt-1 text-[10px] text-destructive normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
            رُفض (صيغة غير مدعومة): {rejected.join(", ")}
          </p>
        )}
      </div>
      {error && <p className="text-[11px] text-destructive normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>{error}</p>}
      {progress && <p className="text-[11px] text-muted-foreground">{progress}</p>}
      <button
        type="submit" disabled={uploading}
        className="border border-foreground text-foreground px-6 py-2 text-[11px] tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
      >
        {uploading ? "..." : "حفظ ↗"}
      </button>
    </form>
  );
}