import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const AVATAR_BUCKET = "profile-avatars";
export const PROJECT_BUCKET = "project-media";
export const SITE_BUCKET = "site-media";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Turns an arbitrary filename into a safe storage object name. */
export function safeFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > -1 ? name.slice(dot + 1).toLowerCase() : "jpg";
  const safeExt = /^[a-z0-9]{2,5}$/.test(ext) ? ext : "jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
}

/** Buckets are private, so media is read through short-lived signed URLs. */
export async function resolveMediaUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export function useMediaUrl(bucket: string, path: string | null | undefined) {
  const query = useQuery({
    queryKey: ["media-url", bucket, path ?? null],
    queryFn: () => resolveMediaUrl(bucket, path),
    enabled: Boolean(path),
    staleTime: 30 * 60 * 1000,
  });
  return query.data ?? null;
}

export function useMediaUrls(bucket: string, paths: string[] | null | undefined) {
  const list = paths ?? [];
  const query = useQuery({
    queryKey: ["media-urls", bucket, list],
    queryFn: async () => {
      const resolved = await Promise.all(list.map((p) => resolveMediaUrl(bucket, p)));
      return resolved.filter((url): url is string => Boolean(url));
    },
    enabled: list.length > 0,
    staleTime: 30 * 60 * 1000,
  });
  return query.data ?? [];
}

export type ImageValidation = { ok: true } | { ok: false; reason: "type" | "size" };

export function validateImage(file: File): ImageValidation {
  if (!file.type.startsWith("image/")) return { ok: false, reason: "type" };
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return { ok: false, reason: "type" };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, reason: "size" };
  return { ok: true };
}
