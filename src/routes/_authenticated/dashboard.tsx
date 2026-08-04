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

type Tab = "projects" | "studio" | "clients" | "events" | "messages" | "backgrounds";
const TAB_LABELS: Record<Tab, string> = {
  projects: "PROJECTS",
  studio: "STUDIO",
  clients: "CLIENTS",
  events: "EVENTS",
  messages: "MESSAGES",
  backgrounds: "BACKGROUNDS",
};
type Registration = {
  id: string;
  event_name: string | null;
  name: string;
  email: string;
  phone: string | null;
  note: string | null;
  read: boolean;
  created_at: string;
};
type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  cover_image: string | null;
  sort_order: number;
  published: boolean;
};
type ClientRow = {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  sort_order: number;
  published: boolean;
};
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
  category?: string | null;
  client?: string | null;
  year?: string | null;
  services?: string[] | null;
  tools?: string[] | null;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Curvature Studio" },
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
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground tracking-[0.15em]">
            <span className="normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>{email}</span>
            <button onClick={signOut} className="hover:text-foreground">SIGN OUT ↗</button>
          </div>
        </div>

        {isEmployee === false && (
          <div className="border border-border p-6 text-[11px] tracking-normal normal-case" style={{ fontFamily: "Jost, sans-serif" }}>
            Your account does not have employee access. Contact an administrator to grant permission.
          </div>
        )}

        {isEmployee && (
          <>
            <div className="flex flex-wrap gap-2 border-b border-border mb-8">
              {(["projects", "studio", "clients", "events", "messages", "backgrounds"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-[11px] tracking-[0.15em] -mb-px border-b ${tab === t ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>
            {tab === "backgrounds" ? (
              <BackgroundsPanel />
            ) : tab === "messages" ? (
              <MessagesPanel />
            ) : tab === "events" ? (
              <EventsPanel />
            ) : tab === "clients" ? (
              <ClientsPanel />
            ) : (
              <SectionEditor
                key={tab}
                table={tab === "projects" ? "projects" : "studio_items"}
                label={tab === "projects" ? "Project" : "Studio item"}
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
    if (!confirm("Delete this message?")) return;
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
        <p className="text-[11px] text-muted-foreground">No messages yet.</p>
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

function EventsPanel() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [evName, setEvName] = useState("");
  const [evDate, setEvDate] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evFile, setEvFile] = useState<File | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [reg, setReg] = useState({ name: "", email: "", phone: "", event_name: "", note: "" });
  const [savingReg, setSavingReg] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const { data } = await (supabase.from("event_registrations" as never) as any)
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as Registration[]) ?? []);
    const { data: ev } = await (supabase.from("events" as never) as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setEvents((ev as EventRow[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  function resetEventForm() {
    setEditingEvent(null);
    setEvName("");
    setEvDate("");
    setEvDesc("");
    setEvFile(null);
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!evName.trim()) { setErr("Event name is required."); return; }
    setErr(null);
    setSavingEvent(true);
    try {
      let cover: string | null = null;
      if (evFile) cover = await uploadMedia(evFile);
      const payload: Record<string, unknown> = {
        name: evName.trim().slice(0, 200),
        event_date: evDate || null,
        description: evDesc.trim() ? evDesc.trim().slice(0, 2000) : null,
      };
      if (cover) payload.cover_image = cover;
      const table = supabase.from("events" as never) as any;
      const { error } = editingEvent
        ? await table.update(payload).eq("id", editingEvent)
        : await table.insert(payload);
      if (error) throw error;
      resetEventForm();
      await refresh();
    } catch (e2: any) {
      setErr(e2?.message ?? "Couldn't save the event.");
    }
    setSavingEvent(false);
  }

  async function toggleEventPublished(ev: EventRow) {
    await (supabase.from("events" as never) as any).update({ published: !ev.published }).eq("id", ev.id);
    refresh();
  }
  async function removeEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await (supabase.from("events" as never) as any).delete().eq("id", id);
    refresh();
  }
  function startEdit(ev: EventRow) {
    setEditingEvent(ev.id);
    setEvName(ev.name);
    setEvDate(ev.event_date ?? "");
    setEvDesc(ev.description ?? "");
    setEvFile(null);
  }

  async function addRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!reg.name.trim() || !reg.email.trim()) { setErr("Name and email are required."); return; }
    setErr(null);
    setSavingReg(true);
    const { error } = await (supabase.from("event_registrations" as never) as any).insert({
      name: reg.name.trim().slice(0, 120),
      email: reg.email.trim().slice(0, 255),
      phone: reg.phone.trim() ? reg.phone.trim().slice(0, 40) : null,
      event_name: reg.event_name.trim() ? reg.event_name.trim().slice(0, 200) : null,
      note: reg.note.trim() ? reg.note.trim().slice(0, 2000) : null,
    });
    setSavingReg(false);
    if (error) { setErr("Couldn't add the registration."); return; }
    setReg({ name: "", email: "", phone: "", event_name: "", note: "" });
    setShowRegForm(false);
    refresh();
  }

  async function toggleRead(r: Registration) {
    await (supabase.from("event_registrations" as never) as any).update({ read: !r.read }).eq("id", r.id);
    refresh();
  }
  async function remove(id: string) {
    if (!confirm("Delete this registration?")) return;
    await (supabase.from("event_registrations" as never) as any).delete().eq("id", id);
    refresh();
  }

  const unread = rows.filter((r) => !r.read).length;
  const field =
    "w-full border border-border bg-transparent px-3 py-2 text-[12px] normal-case tracking-normal focus:border-foreground focus:outline-none";
  const labelCls = "block mb-2 text-[10px] tracking-[0.15em] text-muted-foreground";

  return (
    <div>
      {err && <p className="mb-6 text-[11px] text-destructive">{err}</p>}

      {/* ---- EVENTS ---- */}
      <h3 className="mb-4 text-[11px] tracking-[0.2em]">EVENTS · {events.length}</h3>
      <form
        onSubmit={saveEvent}
        className="mb-8 grid gap-4 border border-border p-5 md:grid-cols-2"
        style={{ fontFamily: "Jost, sans-serif" }}
      >
        <div>
          <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>EVENT NAME</label>
          <input className={field} value={evName} onChange={(e) => setEvName(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>DATE</label>
          <input type="date" className={field} value={evDate} onChange={(e) => setEvDate(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>DESCRIPTION</label>
          <textarea rows={2} className={`${field} resize-none`} value={evDesc} onChange={(e) => setEvDesc(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>COVER (IMAGE OR VIDEO)</label>
          <input
            type="file"
            accept="image/*,video/*"
            className="text-[11px]"
            onChange={(e) => setEvFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="flex gap-6 text-[10px] tracking-[0.15em] md:col-span-2">
          <button type="submit" disabled={savingEvent} className="hover:opacity-70 disabled:opacity-40">
            {savingEvent ? "SAVING…" : editingEvent ? "UPDATE EVENT ↗" : "ADD EVENT ↗"}
          </button>
          {editingEvent && (
            <button type="button" onClick={resetEventForm} className="text-muted-foreground hover:opacity-70">
              CANCEL ↗
            </button>
          )}
        </div>
      </form>

      {events.length > 0 && (
        <ul className="mb-12 space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="flex flex-wrap items-center gap-4 border border-border p-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden bg-foreground/5">
                {ev.cover_image ? <Thumb url={ev.cover_image} alt={ev.name} width={160} /> : <Fallback label="—" />}
              </div>
              <div className="min-w-0 flex-1 normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
                <div className="truncate text-[14px]">{ev.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {ev.event_date ?? "No date"} · {ev.published ? "Published" : "Hidden"}
                </div>
              </div>
              <div className="flex gap-5 text-[10px] tracking-[0.15em]">
                <button onClick={() => startEdit(ev)} className="hover:opacity-70">EDIT ↗</button>
                <button onClick={() => toggleEventPublished(ev)} className="hover:opacity-70">
                  {ev.published ? "HIDE ↗" : "PUBLISH ↗"}
                </button>
                <button onClick={() => removeEvent(ev.id)} className="text-destructive hover:opacity-70">DELETE ↗</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ---- REGISTRATIONS ---- */}
      <p className="text-[11px] text-muted-foreground mb-6">
        {rows.length} REGISTRATIONS · {unread} NEW · FORM AT /events
      </p>
      <div className="mb-6 text-[10px] tracking-[0.15em]">
        <button onClick={() => setShowRegForm((v) => !v)} className="hover:opacity-70">
          {showRegForm ? "CLOSE FORM ↗" : "ADD REGISTRATION ↗"}
        </button>
      </div>
      {showRegForm && (
        <form
          onSubmit={addRegistration}
          className="mb-8 grid gap-4 border border-border p-5 md:grid-cols-2"
          style={{ fontFamily: "Jost, sans-serif" }}
        >
          <div>
            <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>FULL NAME</label>
            <input className={field} value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>EMAIL</label>
            <input type="email" className={field} value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>PHONE</label>
            <input className={field} value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>EVENT</label>
            <select
              className={field}
              value={reg.event_name}
              onChange={(e) => setReg({ ...reg, event_name: e.target.value })}
            >
              <option value="">—</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.name}>{ev.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} style={{ fontFamily: "JetBrains Mono, monospace" }}>NOTE</label>
            <textarea rows={2} className={`${field} resize-none`} value={reg.note} onChange={(e) => setReg({ ...reg, note: e.target.value })} />
          </div>
          <div className="md:col-span-2 text-[10px] tracking-[0.15em]">
            <button type="submit" disabled={savingReg} className="hover:opacity-70 disabled:opacity-40">
              {savingReg ? "SAVING…" : "SAVE REGISTRATION ↗"}
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <p className="text-[11px] text-muted-foreground">LOADING…</p>
      ) : rows.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No registrations yet.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id} className={`border p-5 ${r.read ? "border-border" : "border-foreground"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
                  <div className="text-[14px]">{r.name}</div>
                  <a href={`mailto:${r.email}`} className="text-[12px] text-muted-foreground hover:text-foreground">{r.email}</a>
                  {r.phone && <div className="text-[12px] text-muted-foreground">{r.phone}</div>}
                  {r.event_name && <div className="text-[12px] text-muted-foreground">{r.event_name}</div>}
                </div>
                <div className="text-[10px] text-muted-foreground tracking-[0.15em]">
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              {r.note && (
                <p
                  className="mt-4 text-[13px] whitespace-pre-wrap normal-case tracking-normal"
                  style={{ fontFamily: "Jost, sans-serif", lineHeight: 1.6 }}
                >
                  {r.note}
                </p>
              )}
              <div className="mt-4 flex gap-6 text-[10px] tracking-[0.15em]">
                <button onClick={() => toggleRead(r)} className="hover:opacity-70">
                  {r.read ? "MARK NEW ↗" : "MARK HANDLED ↗"}
                </button>
                <button onClick={() => remove(r.id)} className="text-destructive hover:opacity-70">DELETE ↗</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClientsPanel() {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const table = () => supabase.from("clients" as never) as any;

  async function refresh() {
    setLoading(true);
    const { data } = await table().select("*").order("sort_order", { ascending: true });
    setRows((data as ClientRow[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Client name is required."); return; }
    setError(null); setBusy(true);
    try {
      let logo_url: string | null = null;
      if (logo) {
        if (!acceptedMime(logo)) throw new Error("Unsupported logo format.");
        logo_url = await uploadMedia(logo);
      }
      const { error: err } = await table().insert({
        name: name.trim(),
        website: website.trim() || null,
        logo_url,
        sort_order: rows.length,
      });
      if (err) throw new Error(err.message);
      setName(""); setWebsite(""); setLogo(null);
      refresh();
    } catch (e: any) {
      setError(e?.message ?? "Couldn't save the client.");
    } finally {
      setBusy(false);
    }
  }

  async function replaceLogo(id: string, file: File) {
    setError(null); setBusy(true);
    try {
      if (!acceptedMime(file)) throw new Error("Unsupported logo format.");
      const url = await uploadMedia(file);
      await table().update({ logo_url: url }).eq("id", id);
      refresh();
    } catch (e: any) {
      setError(e?.message ?? "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(c: ClientRow) {
    await table().update({ published: !c.published }).eq("id", c.id);
    refresh();
  }
  async function remove(id: string) {
    if (!confirm("Delete this client?")) return;
    await table().delete().eq("id", id);
    refresh();
  }

  const input =
    "w-full border border-border bg-transparent px-3 py-2 text-[13px] normal-case tracking-normal focus:border-foreground focus:outline-none";

  return (
    <div>
      <form onSubmit={add} className="mb-10 grid gap-4 border border-border p-5 md:grid-cols-4" style={{ fontFamily: "Jost, sans-serif" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" className={input} />
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website (optional)" className={input} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
          className="text-[11px] text-muted-foreground"
        />
        <button type="submit" disabled={busy} className="border border-foreground px-4 py-2 text-[10px] tracking-[0.15em] disabled:opacity-50">
          {busy ? "SAVING…" : "ADD CLIENT ↗"}
        </button>
      </form>
      {error && <p className="mb-6 text-[11px] text-destructive">{error}</p>}

      {loading ? (
        <p className="text-[11px] text-muted-foreground">LOADING…</p>
      ) : rows.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No clients yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <li key={c.id} className="border border-border p-4">
              <div className="flex h-24 items-center justify-center overflow-hidden bg-white/5">
                {c.logo_url ? (
                  <img src={mediaThumb(c.logo_url, 320)} alt={c.name} className="max-h-20 max-w-[80%] object-contain" />
                ) : (
                  <span className="text-[10px] tracking-[0.15em] text-muted-foreground">NO LOGO</span>
                )}
              </div>
              <p className="mt-3 text-[13px] normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>{c.name}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] tracking-[0.15em]">
                <label className="cursor-pointer hover:opacity-70">
                  {c.logo_url ? "REPLACE LOGO ↗" : "UPLOAD LOGO ↗"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) replaceLogo(c.id, f); }}
                  />
                </label>
                <button onClick={() => togglePublished(c)} className="hover:opacity-70">
                  {c.published ? "PUBLISHED" : "HIDDEN"}
                </button>
                <button onClick={() => remove(c.id)} className="text-destructive hover:opacity-70">DELETE ↗</button>
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
  const [editing, setEditing] = useState<Item | null>(null);
  const [viewer, setViewer] = useState<{ item: LightboxItem; index: number } | null>(null);

  function openViewer(it: Item, index: number) {
    setViewer({
      item: {
        title: it.title,
        description: it.description ?? undefined,
        images: it.media_urls.map((m) => mediaSrc(m)),
      },
      index,
    });
  }

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    if (!error) setItems((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, [table]);

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { alert(error.message); return; }
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[11px] text-muted-foreground">{items.length} ITEMS</p>
        <button
          onClick={() => { setEditing(null); setShowForm((v) => !v); }}
          className="text-[11px] border-b border-foreground pb-0.5"
        >
          {showForm ? "CLOSE" : `+ ADD ${label.toUpperCase()}`}
        </button>
      </div>

      {showForm && (
        <div className="border border-border p-6 mb-8">
          <ItemForm table={table} onDone={() => { setShowForm(false); refresh(); }} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editing && (
        <div className="border border-foreground p-6 mb-8">
          <p className="text-[11px] text-muted-foreground mb-4">EDITING · {editing.title}</p>
          <ItemForm
            key={editing.id}
            table={table}
            item={editing}
            onDone={() => { setEditing(null); refresh(); }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-[11px] text-muted-foreground">LOADING…</p>
      ) : items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No items yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <li key={it.id} className="border border-border">
              {(() => {
                const raw = it.cover_image ?? it.media_urls[0] ?? null;
                const coverIndex = raw ? Math.max(0, it.media_urls.indexOf(raw)) : 0;
                return (
                  <button
                    type="button"
                    onClick={() => raw && openViewer(it, coverIndex)}
                    aria-label={`Preview ${it.title}`}
                    className="block w-full aspect-[4/3] bg-white/5 overflow-hidden cursor-zoom-in"
                  >
                    {raw ? <Thumb url={raw} alt={it.title} width={640} /> : null}
                  </button>
                );
              })()}
              {it.media_urls.length > 1 && (
                <div className="flex gap-1 overflow-x-auto p-1 border-t border-border">
                  {it.media_urls.map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => openViewer(it, i)}
                      aria-label={`Preview media ${i + 1}`}
                      className="w-12 h-12 shrink-0 bg-white/5 overflow-hidden cursor-zoom-in"
                    >
                      <Thumb url={m} width={128} />
                    </button>
                  ))}
                </div>
              )}
              <div className="p-4">
                <div className="text-[12px] normal-case tracking-normal truncate" style={{ fontFamily: "Jost, sans-serif" }}>{it.title}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {it.media_urls.length} MEDIA · {it.published ? "PUBLISHED" : "DRAFT"}
                </div>
                <div className="mt-3 flex justify-between text-[10px] tracking-[0.15em]">
                  <button
                    onClick={() => { setShowForm(false); setEditing(it); }}
                    className="hover:opacity-70"
                  >
                    EDIT ↗
                  </button>
                  <button onClick={() => remove(it.id)} className="text-destructive hover:opacity-70">DELETE ↗</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Lightbox item={viewer?.item ?? null} startIndex={viewer?.index ?? 0} onClose={() => setViewer(null)} />
    </div>
  );
}

function ItemForm({
  table,
  item,
  onDone,
  onCancel,
}: {
  table: "projects" | "studio_items";
  item?: Item;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const isEdit = !!item;
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [client, setClient] = useState(item?.client ?? "");
  const [year, setYear] = useState(item?.year ?? "");
  const [services, setServices] = useState((item?.services ?? []).join(", "));
  const [tools, setTools] = useState((item?.tools ?? []).join(", "));
  const [existing, setExisting] = useState<string[]>(item?.media_urls ?? []);
  const [cover, setCover] = useState<string | null>(item?.cover_image ?? item?.media_urls[0] ?? null);
  const [published, setPublished] = useState<boolean>(item?.published ?? true);
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
    if (!title.trim()) { setError("Title is required."); return; }
    if (files.length === 0 && existing.length === 0) { setError("Add at least one image or video."); return; }
    setError(null); setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1}/${files.length}…`);
        urls.push(await uploadMedia(files[i]));
      }
      setProgress("Saving…");
      const media = [...existing, ...urls];
      const coverUrl = cover && media.includes(cover) ? cover : media[0];
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        cover_image: coverUrl,
        media_urls: media,
        published,
      };
      const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);
      const fullPayload =
        table === "projects"
          ? {
              ...payload,
              category: category.trim() || null,
              client: client.trim() || null,
              year: year.trim() || null,
              services: csv(services),
              tools: csv(tools),
            }
          : payload;
      const { error } = isEdit
        ? await supabase.from(table).update(fullPayload as never).eq("id", item!.id)
        : await supabase.from(table).insert(fullPayload as never);
      if (error) throw error;
      onDone();
    } catch (err: any) {
      setError(err?.message ?? "Upload failed.");
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
      {table === "projects" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "CATEGORY", value: category, set: setCategory, ph: "Commercial" },
            { label: "CLIENT", value: client, set: setClient, ph: "Client name" },
            { label: "YEAR", value: year, set: setYear, ph: "2026" },
            { label: "SERVICES (COMMA SEPARATED)", value: services, set: setServices, ph: "Direction, Production" },
            { label: "TOOLS (COMMA SEPARATED)", value: tools, set: setTools, ph: "RED Komodo, DaVinci" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[11px] text-muted-foreground mb-2">{f.label}</label>
              <input
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.ph}
                maxLength={300}
                className="w-full bg-transparent border border-border px-3 py-2 text-sm normal-case tracking-normal focus:outline-none focus:border-foreground"
                style={{ fontFamily: "Jost, sans-serif" }}
              />
            </div>
          ))}
        </div>
      )}
      <div>
        <label className="block text-[11px] text-muted-foreground mb-2">MEDIA (IMAGES / VIDEOS)</label>
        {existing.length > 0 && (
          <div className="mb-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
            {existing.map((m) => (
              <div key={m} className="relative aspect-square bg-white/5 overflow-hidden border border-border">
                <Thumb url={m} width={128} />
                <button
                  type="button"
                  onClick={() => {
                    setExisting((prev) => prev.filter((x) => x !== m));
                    setCover((c) => (c === m ? null : c));
                  }}
                  aria-label="Remove media"
                  className="absolute top-0 right-0 bg-background/80 text-destructive text-[10px] px-1 leading-4"
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={() => setCover(m)}
                  className={`absolute bottom-0 left-0 right-0 text-[8px] tracking-[0.15em] text-center py-0.5 ${
                    cover === m ? "bg-foreground text-background" : "bg-background/80 text-muted-foreground"
                  }`}
                >
                  {cover === m ? "COVER" : "SET COVER"}
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*,video/*,.mp4,.mov,.m4v,.webm,.mkv,.avi,.ogv,.3gp,.heic,.heif"
          multiple onChange={onPick}
          className="block w-full text-[11px] normal-case tracking-normal file:mr-3 file:px-3 file:py-2 file:border file:border-border file:bg-transparent file:text-foreground file:text-[10px] file:tracking-[0.15em] file:cursor-pointer"
          style={{ fontFamily: "Jost, sans-serif" }}
        />
        {files.length > 0 && (
          <p className="mt-2 text-[10px] text-muted-foreground">{files.length} file(s) accepted</p>
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
        <p className="mt-1 text-[10px] text-muted-foreground">Maximum 50 MB per file</p>
        {rejected.length > 0 && (
          <p className="mt-1 text-[10px] text-destructive normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
            Rejected (unsupported format): {rejected.join(", ")}
          </p>
        )}
      </div>
      {error && <p className="text-[11px] text-destructive normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>{error}</p>}
      {progress && <p className="text-[11px] text-muted-foreground">{progress}</p>}
      <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        PUBLISHED
      </label>
      <div className="flex items-center gap-6">
        <button
          type="submit" disabled={uploading}
          className="border border-foreground text-foreground px-6 py-2 text-[11px] tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
        >
          {uploading ? "..." : isEdit ? "UPDATE ↗" : "SAVE ↗"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-[10px] tracking-[0.15em] text-muted-foreground hover:text-foreground">
            CANCEL
          </button>
        )}
      </div>
    </form>
  );
}
type BackgroundRow = {
  id: string;
  slot: string;
  label: string;
  media_url: string | null;
};

/** Manage the image/video backgrounds used across the site (add / replace / delete). */
function BackgroundsPanel() {
  const [rows, setRows] = useState<BackgroundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newSlot, setNewSlot] = useState("");

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from("site_media")
      .select("id, slot, label, media_url")
      .order("label", { ascending: true });
    setRows((data as BackgroundRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function upload(row: BackgroundRow, file: File) {
    setError(null);
    if (!acceptedMime(file)) {
      setError("Unsupported file format. Only images and videos are accepted.");
      return;
    }
    setBusy(row.id);
    try {
      const url = await uploadMedia(file);
      const { error: err } = await supabase.from("site_media").update({ media_url: url }).eq("id", row.id);
      if (err) throw new Error(err.message);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    }
    setBusy(null);
  }

  async function clearMedia(row: BackgroundRow) {
    if (!confirm(`Remove the media from "${row.label}"? The default background will be used.`)) return;
    setBusy(row.id);
    await supabase.from("site_media").update({ media_url: null }).eq("id", row.id);
    await refresh();
    setBusy(null);
  }

  async function removeSlot(row: BackgroundRow) {
    if (!confirm(`Delete the background slot "${row.label}"?`)) return;
    setBusy(row.id);
    await supabase.from("site_media").delete().eq("id", row.id);
    await refresh();
    setBusy(null);
  }

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const label = newLabel.trim();
    const slot = newSlot.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
    if (!label || !slot) {
      setError("Enter a name and a slot key.");
      return;
    }
    setBusy("new");
    const { error: err } = await supabase.from("site_media").insert({ label, slot });
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setNewLabel("");
    setNewSlot("");
    refresh();
  }

  const field =
    "w-full border border-border bg-transparent px-3 py-2 text-[12px] normal-case tracking-normal focus:border-foreground focus:outline-none";

  return (
    <div className="space-y-8">
      <form
        onSubmit={addSlot}
        className="flex flex-wrap items-end gap-3 border border-border p-5"
        style={{ fontFamily: "Jost, sans-serif" }}
      >
        <div className="min-w-[180px] flex-1 space-y-2">
          <label className="block text-[10px] tracking-[0.15em] text-muted-foreground">NAME</label>
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className={field} placeholder="About page background" />
        </div>
        <div className="min-w-[180px] flex-1 space-y-2">
          <label className="block text-[10px] tracking-[0.15em] text-muted-foreground">SLOT KEY</label>
          <input value={newSlot} onChange={(e) => setNewSlot(e.target.value)} className={field} placeholder="about_hero" />
        </div>
        <button
          type="submit"
          disabled={busy === "new"}
          className="border border-border px-5 py-2 text-[10px] tracking-[0.15em] hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          {busy === "new" ? "ADDING…" : "ADD SLOT"}
        </button>
      </form>

      {error && (
        <p className="text-[11px] normal-case tracking-normal text-destructive" style={{ fontFamily: "Jost, sans-serif" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[11px] text-muted-foreground">LOADING…</p>
      ) : rows.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">NO BACKGROUND SLOTS YET</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div key={row.id} className="border border-border">
              <div className="aspect-video w-full overflow-hidden bg-foreground/5">
                {row.media_url ? (
                  <Thumb url={row.media_url} alt={row.label} />
                ) : (
                  <Fallback label="DEFAULT" />
                )}
              </div>
              <div className="space-y-3 p-4">
                <p className="text-[12px] normal-case tracking-normal" style={{ fontFamily: "Jost, sans-serif" }}>
                  {row.label}
                </p>
                <p className="text-[9px] tracking-[0.15em] text-muted-foreground">{row.slot}</p>
                <div className="flex flex-wrap gap-3 text-[10px] tracking-[0.15em]">
                  <label className="cursor-pointer border border-border px-3 py-2 hover:bg-foreground hover:text-background">
                    {busy === row.id ? "WORKING…" : row.media_url ? "REPLACE" : "UPLOAD"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) upload(row, f);
                      }}
                    />
                  </label>
                  {row.media_url && (
                    <button onClick={() => clearMedia(row)} className="border border-border px-3 py-2 hover:bg-foreground hover:text-background">
                      REMOVE MEDIA
                    </button>
                  )}
                  <button onClick={() => removeSlot(row)} className="px-3 py-2 text-destructive hover:underline">
                    DELETE SLOT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
