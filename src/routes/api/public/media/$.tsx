import { createFileRoute } from "@tanstack/react-router";

// Serves private storage media to visitors via a short-lived signed URL.
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }
        const url = new URL(request.url);
        const w = Number(url.searchParams.get("w") ?? "");
        const wantThumb = Number.isFinite(w) && w >= 32 && w <= 2000;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const sign = (transform?: { width: number; resize: "cover" }) =>
          supabaseAdmin.storage.from("media").createSignedUrl(path, 60 * 60, transform ? { transform } : undefined);

        let signedUrl: string | null = null;
        if (wantThumb) {
          const { data } = await sign({ width: Math.round(w), resize: "cover" });
          signedUrl = data?.signedUrl ?? null;
        }
        if (!signedUrl) {
          const { data } = await sign();
          signedUrl = data?.signedUrl ?? null;
        }
        if (!signedUrl) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(null, {
          status: 302,
          headers: { Location: signedUrl, "Cache-Control": "public, max-age=1800" },
        });
      },
    },
  },
});
