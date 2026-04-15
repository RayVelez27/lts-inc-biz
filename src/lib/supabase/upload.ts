"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Uploads a customer-supplied design to the `designs` Supabase Storage bucket
 * and returns its public URL.
 *
 * Path convention: designs/<user_id_or_session>/<timestamp>-<sanitized_name>.
 * Anonymous users get a session id persisted in localStorage so repeat uploads
 * from the same browser land in one folder.
 */
export async function uploadDesign(file: File): Promise<{ url: string; path: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const scope = user?.id ?? getAnonSessionId();
  const sanitized = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-80);
  const path = `${scope}/${Date.now()}-${sanitized}`;

  const { error } = await supabase.storage
    .from("designs")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from("designs").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

function getAnonSessionId(): string {
  const KEY = "lts-anon-session-id";
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
