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

export type BlogInput = {
  title: string;
  slug?: string;
  cover_image?: string | null;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  tags: string[];
  is_published: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  author?: string | null;
};

export async function createBlogPost(input: BlogInput) {
  await requireAdmin();
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);

  const { error } = await supabase.from("blog_posts").insert({ ...input, slug });
  if (error) return { error: error.message };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/");
  return { success: true };
}

export async function updateBlogPost(id: string, input: BlogInput) {
  await requireAdmin();
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);

  const { error } = await supabase
    .from("blog_posts")
    .update({ ...input, slug })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/");
  return { success: true };
}