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

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // حد الرفع في التخزين

function extOf(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

// بعض المتصفحات لا ترسل MIME للفيديوهات (مثل .mov / .mkv) لذلك نتحقق من الامتداد أيضاً
export function acceptedMime(file: File) {
  if (file.type.startsWith("image/") || file.type.startsWith("video/")) return true;
  const ext = extOf(file.name);
  return IMAGE_EXT.includes(ext) || VIDEO_EXT.includes(ext);
}

const MIME_BY_EXT: Record<string, string> = {
  mp4: "video/mp4", m4v: "video/mp4", mov: "video/quicktime", webm: "video/webm",
  mkv: "video/x-matroska", avi: "video/x-msvideo", ogv: "video/ogg", "3gp": "video/3gpp",
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  gif: "image/gif", avif: "image/avif", svg: "image/svg+xml", heic: "image/heic",
  heif: "image/heif", bmp: "image/bmp", tiff: "image/tiff",
};

export async function uploadMedia(file: File): Promise<string> {
  if (!acceptedMime(file)) {
    throw new Error("صيغة الملف غير مدعومة. يُقبل فقط الصور والفيديوهات.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `حجم الملف "${file.name}" كبير جداً (${(file.size / 1024 / 1024).toFixed(1)} ميجابايت). الحد الأقصى 50 ميجابايت للملف الواحد — الرجاء ضغط الفيديو أو تقسيمه.`,
    );
  }
  const ext = extOf(file.name) || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || MIME_BY_EXT[ext] || "application/octet-stream",
  });
  if (error) throw new Error(`فشل رفع "${file.name}": ${error.message}`);
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}