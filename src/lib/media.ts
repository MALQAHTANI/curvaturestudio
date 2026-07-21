import { supabase } from "@/integrations/supabase/client";

export const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif", "avif", "svg", "heic", "heif", "bmp", "tiff"];
export const VIDEO_EXT = ["mp4", "mov", "webm", "mkv", "avi", "m4v", "ogv", "3gp"];

export function isImage(url: string) {
  const u = url.toLowerCase().split("?")[0];
  return IMAGE_EXT.some((e) => u.endsWith("." + e)) || u.startsWith("data:image/");
}

export function isVideo(url: string) {
  const u = url.toLowerCase().split("?")[0];
  return VIDEO_EXT.some((e) => u.endsWith("." + e));
}

export function acceptedMime(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

export async function uploadMedia(file: File): Promise<string> {
  if (!acceptedMime(file)) {
    throw new Error("صيغة الملف غير مدعومة. يُقبل فقط الصور والفيديوهات.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}