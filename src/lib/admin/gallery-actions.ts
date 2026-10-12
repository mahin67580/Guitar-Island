"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── ALBUMS ─────────────────────────────────────────

export type AlbumInput = {
  name: string;
  slug?: string;
  description?: string | null;
  cover_image?: string | null;
  sort_order: number;
  is_published: boolean;
};

export async function createAlbum(input: AlbumInput) {
  await requireAdmin();
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { data, error } = await supabase
    .from("gallery_albums")
    .insert({ ...input, slug })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true, id: data.id };
}

export async function updateAlbum(id: string, input: AlbumInput) {
  await requireAdmin();
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { error } = await supabase
    .from("gallery_albums")
    .update({ ...input, slug })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath(`/gallery/${slug}`);
  return { success: true };
}

export async function deleteAlbum(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("gallery_albums")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}

export async function toggleAlbumPublished(id: string, published: boolean) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("gallery_albums")
    .update({ is_published: published })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}

// ─── IMAGES ─────────────────────────────────────────

export async function addGalleryImages(
  albumId: string,
  imageUrls: string[],
  captions?: string[]
) {
  await requireAdmin();
  const supabase = await createClient();

  const rows = imageUrls.map((url, i) => ({
    album_id: albumId,
    image_url: url,
    caption: captions?.[i] || null,
    sort_order: i,
    is_published: true,
  }));

  const { error } = await supabase.from("gallery_images").insert(rows);

  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}

export async function updateGalleryImage(
  id: string,
  updates: { caption?: string | null; is_published?: boolean; sort_order?: number }
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("gallery_images")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}