import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "@/components/admin/CategoriesClient";
import type { Category } from "@/lib/types";

export const metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Categories</h1>
        <p className="text-ink/60 text-sm">
          Organize your products into categories.
        </p>
      </div>

      <CategoriesClient categories={(categories as Category[]) || []} />
    </div>
  );
}