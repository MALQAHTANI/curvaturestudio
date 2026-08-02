import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mediaSrc } from "@/lib/media";

export type ClientProject = {
  id: string;
  title: string;
  client: string | null;
  description: string | null;
  category: string | null;
  services: string[] | null;
  tools: string[] | null;
  cover: string;
  media: string[];
};

/** Published projects, normalised for the Clients / Projects experience. */
export function useClientProjects(limit?: number) {
  const [items, setItems] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let query = supabase
      .from("projects")
      .select("id,title,client,description,category,services,tools,cover_image,media_urls,sort_order,created_at")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    query.then(({ data }) => {
      if (!alive) return;
      const rows = ((data as any[]) ?? []).map((d) => {
        const cover = mediaSrc(d.cover_image ?? d.media_urls?.[0]) || "";
        const media = Array.from(
          new Set(
            [cover, ...(((d.media_urls as string[]) ?? []).map((u) => mediaSrc(u)))].filter(Boolean) as string[],
          ),
        );
        return {
          id: d.id as string,
          title: d.title as string,
          client: (d.client as string) ?? null,
          description: (d.description as string) ?? null,
          category: (d.category as string) ?? null,
          services: (d.services as string[]) ?? null,
          tools: (d.tools as string[]) ?? null,
          cover,
          media,
        } satisfies ClientProject;
      });
      setItems(rows.filter((r) => !!r.cover));
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [limit]);

  return { items, loading };
}