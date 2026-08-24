// MySQL data client (Hostinger PHP API).
// Deliberately mirrors the small query-builder surface the app already uses,
// so every page keeps its existing call style while talking to /api/query.php.
//
// No credentials ever live here: the browser only sends a login token.

export const API_BASE = ((): string => {
  const configured = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  return (configured && configured.replace(/\/$/, "")) || "/api";
})();

const TOKEN_KEY = "curvature.auth.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export type ApiError = { message: string } | null;
export type Result<T> = { data: T; error: ApiError };

async function request<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const token = getToken();
    const headers = new Headers(init?.headers);
    if (!(init?.body instanceof FormData)) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${API_BASE}/${path}`, { ...init, headers });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || payload?.error) {
      return { data: null as T, error: { message: payload?.error?.message ?? `Request failed (${res.status})` } };
    }
    return { data: (payload?.data ?? payload) as T, error: null };
  } catch (e: any) {
    return { data: null as T, error: { message: e?.message ?? "Network error" } };
  }
}

type Filter = { column: string; op: "eq" | "in"; value: unknown };
type Order = { column: string; ascending: boolean };

class QueryBuilder<T = any> implements PromiseLike<Result<T>> {
  private table: string;
  private action: "select" | "insert" | "update" | "delete" = "select";
  private columns: string[] | null = null;
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private limitValue: number | null = null;
  private singleRow = false;
  private values: unknown = null;

  constructor(table: string) {
    this.table = table;
  }

  select(cols?: string) {
    this.action = this.action === "select" ? "select" : this.action;
    this.columns = cols && cols.trim() !== "*" ? cols.split(",").map((c) => c.trim()).filter(Boolean) : null;
    return this;
  }

  insert(values: unknown) {
    this.action = "insert";
    this.values = values;
    return this;
  }

  update(values: unknown) {
    this.action = "update";
    this.values = values;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, op: "eq", value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ column, op: "in", value });
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: opts?.ascending !== false });
    return this;
  }

  limit(n: number) {
    this.limitValue = n;
    return this;
  }

  maybeSingle() {
    this.singleRow = true;
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  private run(): Promise<Result<T>> {
    return request<T>("query.php", {
      method: "POST",
      body: JSON.stringify({
        table: this.table,
        action: this.action,
        columns: this.columns,
        filters: this.filters,
        order: this.orders,
        limit: this.limitValue,
        single: this.singleRow,
        values: this.values,
      }),
    });
  }

  then<R1 = Result<T>, R2 = never>(
    onfulfilled?: ((value: Result<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

export type AuthUser = { id: string; email: string; is_employee: boolean };

const auth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const res = await request<{ token: string; user: AuthUser }>("auth.php?action=login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.error) return { data: { user: null }, error: res.error };
    const payload = res.data as any;
    setToken(payload?.token ?? null);
    return { data: { user: payload?.user ?? null }, error: null as ApiError };
  },

  async signUp({ email, password }: { email: string; password: string }) {
    const res = await request<{ ok: boolean }>("auth.php?action=signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return { data: null, error: res.error };
  },

  async signOut() {
    setToken(null);
    return { error: null as ApiError };
  },

  async getUser() {
    if (!getToken()) return { data: { user: null as AuthUser | null }, error: null as ApiError };
    const res = await request<{ user: AuthUser | null }>("auth.php?action=me");
    const user = (res.data as any)?.user ?? null;
    if (!user) setToken(null);
    return { data: { user }, error: res.error };
  },

  async getSession() {
    const { data } = await auth.getUser();
    return {
      data: { session: data.user ? { user: data.user, access_token: getToken() } : null },
      error: null as ApiError,
    };
  },

  async changePassword(current_password: string, new_password: string) {
    return request<{ ok: boolean }>("auth.php?action=change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    });
  },
};

export const db = {
  from<T = any>(table: string) {
    return new QueryBuilder<T>(table);
  },
  auth,
  /** Uploads an image/video and returns its public URL. */
  async upload(file: File): Promise<{ url: string | null; error: ApiError }> {
    const form = new FormData();
    form.append("file", file);
    const res = await request<{ url: string }>("upload.php", { method: "POST", body: form });
    if (res.error) return { url: null, error: res.error };
    return { url: ((res.data as any)?.url as string) ?? null, error: null };
  },
};
