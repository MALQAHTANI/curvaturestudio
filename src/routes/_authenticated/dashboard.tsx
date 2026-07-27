import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { uploadMedia, isVideo, acceptedMime, mediaSrc, mediaThumb } from "@/lib/media";
import { Lightbox, type LightboxItem } from "@/components/lightbox";

// مصغّرة تظهر دائماً: مصغّرة الخدمة ← الملف الأصلي ← بديل نصي بالصيغة
function Thumb({ url, alt, width = 480 }: { url: string; alt?: string; width?: number }) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const ext = (url.toLowerCase().split("?")[0].split(".").pop() ?? "FILE").toUpperCase();

  if (isVideo(url)) {
    return stage === 2 ? (
      <Fallback label={ext} />
    ) : (
      <video
        src={mediaSrc(url)}
        className="w-full h-full object-cover"
        muted
        playsInline
        preload="metadata"
        onError={() => setStage(2)}
      />
    );
  }
  if (stage === 2) return <Fallback label={ext} />;
  return (
    <img
      src={stage === 0 ? mediaThumb(url, width) : mediaSrc(url)}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover"
      onError={() => setStage((s) => (s === 0 ? 1 : 2))}
    />
  );
}

function Fallback({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-[9px] tracking-[0.15em] text-muted-foreground">
      {label}
    </div>
  );
}

type Tab = "projects" | "studio" | "messages";
type Message = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  read: boolean;
  created_at: string;
};
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
              {(["projects", "studio", "messages"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-[11px] tracking-[0.15em] -mb-px border-b ${tab === t ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                  {t === "projects" ? "PROJECTS" : t === "studio" ? "STUDIO" : "MESSAGES"}
                </button>
              ))}
            </div>
            {tab === "messages" ? (
              <MessagesPanel />
            ) : (
              <SectionEditor
                key={tab}
                table={tab === "projects" ? "projects" : "studio_items"}
                label={tab === "projects" ? "مشروع" : "عنصر استديو"}
              />
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function MessagesPanel() {
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages").select("*").order("created_at", { ascending: false });
    setRows((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function toggleRead(m: Message) {
    await supabase.from("contact_messages").update({ read: !m.read }).eq("id", m.id);
    refresh();
  }
  async function remove(id: string) {
    if (!confirm("حذف هذه الرسالة؟")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    refresh();
  }

  const unread = rows.filter((r) => !r.read).length;

  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-6">
        {rows.length} MESSAGES · {unread} UNREAD
      </p>
      {loading ? (
        <p className="text-[11px] text-muted-foreground">LOADING…</p>
      ) : rows.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">لا توجد رسائل بعد.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((m) => (
            <li key={m.id} className={`border p-5 ${m.read ? "border-border" : "border-foreground"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
                  <div className="text-[14px]">{m.name}</div>
                  <a href={`mailto:${m.email}`} className="text-[12px] text-muted-foreground hover:text-foreground">{m.email}</a>
                  {m.company && <div className="text-[12px] text-muted-foreground">{m.company}</div>}
                </div>
                <div className="text-[10px] text-muted-foreground tracking-[0.15em]">
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
              <p
                className="mt-4 text-[13px] whitespace-pre-wrap normal-case tracking-normal"
                style={{ fontFamily: "Jost, sans-serif", lineHeight: 1.6 }}
              >
                {m.message}
              </p>
              <div className="mt-4 flex gap-6 text-[10px] tracking-[0.15em]">
                <button onClick={() => toggleRead(m)} className="hover:opacity-70">
                  {m.read ? "MARK UNREAD ↗" : "MARK READ ↗"}
                </button>
                <button onClick={() => remove(m.id)} className="text-destructive hover:opacity-70">DELETE ↗</button>
              </div>
            </li>
          ))}
        </ul>
      )}
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
                {(() => {
                  const raw = it.cover_image ?? it.media_urls[0] ?? null;
                  if (!raw) return null;
                  return <Thumb url={raw} alt={it.title} width={640} />;
                })()}
              </div>
              {it.media_urls.length > 1 && (
                <div className="flex gap-1 overflow-x-auto p-1 border-t border-border">
                  {it.media_urls.map((m) => (
                    <div key={m} className="w-12 h-12 shrink-0 bg-white/5 overflow-hidden">
                      <Thumb url={m} width={128} />
                    </div>
                  ))}
                </div>
              )}
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
  const [previews, setPreviews] = useState<{ url: string; video: boolean; name: string }[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    const ok: File[] = []; const bad: File[] = [];
    for (const f of list) { if (acceptedMime(f)) ok.push(f); else bad.push(f); }
    setFiles(ok);
    setRejected(bad.map((f) => f.name));
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return ok.map((f) => ({
        url: URL.createObjectURL(f),
        video: f.type.startsWith("video/") || isVideo(f.name),
        name: f.name,
      }));
    });
  }

  useEffect(() => () => { previews.forEach((p) => URL.revokeObjectURL(p.url)); }, [previews]);

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
          type="file"
          accept="image/*,video/*,.mp4,.mov,.m4v,.webm,.mkv,.avi,.ogv,.3gp,.heic,.heif"
          multiple onChange={onPick}
          className="block w-full text-[11px] normal-case tracking-normal file:mr-3 file:px-3 file:py-2 file:border file:border-border file:bg-transparent file:text-foreground file:text-[10px] file:tracking-[0.15em] file:cursor-pointer"
          style={{ fontFamily: "Jost, sans-serif" }}
        />
        {files.length > 0 && (
          <p className="mt-2 text-[10px] text-muted-foreground">{files.length} ملف مقبول</p>
        )}
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
            {previews.map((p, i) => (
              <div key={p.url} className="relative aspect-square bg-white/5 overflow-hidden border border-border">
                {p.video ? (
                  <video src={p.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                )}
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-background/80 text-[8px] tracking-[0.15em] text-center py-0.5">COVER</span>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground">الحد الأقصى 50 ميجابايت للملف الواحد</p>
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