import { useEffect, useState } from "react";
import { db as supabase } from "@/lib/db";
import { mediaSrc } from "@/lib/media";

/** خلفية موضع معيّن (صورة أو فيديو) تُدار من لوحة التحكم، مع بديل ثابت. */
export function useSiteMedia(slot: string, fallback: string): string {
  const [url, setUrl] = useState(fallback);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("site_media")
        .select("media_url")
        .eq("slot", slot)
        .maybeSingle();
      if (alive && data?.media_url) setUrl(mediaSrc(data.media_url));
    })();
    return () => {
      alive = false;
    };
  }, [slot]);

  return url;
}
