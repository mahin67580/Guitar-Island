"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";

type ProductInput = {
  name: string;
  slug: string;
  sku?: string | null;
  category_id?: string | null;
  brand?: string | null;
  price: number;
  discount_price?: number | null;
  quantity: number;
  low_stock_threshold: number;
  condition: string;
  status: "active" | "draft" | "sold_out";
  short_description?: string | null;
  description?: string | null;
  specs: Record<string, string>;
  images: string[];
  tags: string[];
  is_featured: boolean;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createProduct(input: ProductInput) {
  await requireAdmin();
  const supabase = await createClient();

  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...input,
      slug,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/product/${slug}`);

  return { success: true, id: data.id, slug };
}

export async function updateProduct(id: string, input: ProductInput) {
  await requireAdmin();
  const supabase = await createClient();

  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const { error } = await supabase
    .from("products")
    .update({
      ...input,
      slug,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/product/${slug}`);

  return { success: true, slug };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProducts(ids: string[]) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().in("id", ids);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

export async function duplicateProduct(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: original, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return { error: fetchError?.message || "Product not found" };
  }

  const newName = `${original.name} (Copy)`;
  const newSlug = `${original.slug}-copy-${Date.now().toString(36)}`;

  const { data: created, error } = await supabase
    .from("products")
    .insert({
      name: newName,
      slug: newSlug,
      sku: original.sku ? `${original.sku}-COPY` : null,
      category_id: original.category_id,
      brand: original.brand,
      price: original.price,
      discount_price: original.discount_price,
      quantity: original.quantity,
      low_stock_threshold: original.low_stock_threshold,
      condition: original.condition,
      status: "draft",
      short_description: original.short_description,
      description: original.description,
      specs: original.specs,
      images: original.images,
      tags: original.tags,
      is_featured: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  return { success: true, id: created.id };
}

export async function toggleProductStatus(
  id: string,
  status: "active" | "draft" | "sold_out"
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function toggleFeatured(id: string, is_featured: boolean) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_featured, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}