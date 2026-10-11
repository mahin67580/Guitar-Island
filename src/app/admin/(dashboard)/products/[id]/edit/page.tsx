import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/helpers";
import { getAllCategories } from "@/lib/admin/categories";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  await requireAdmin();
  const supabase = await createClient();

  const [categories, { data: product }] = await Promise.all([
    getAllCategories(),
    supabase.from("products").select("*").eq("id", id).single(),
  ]);

  if (!product) notFound();

  const p = product as Product;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-brass transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
        <h1 className="font-display text-3xl text-ink">Edit Product</h1>
        <p className="text-ink/60 text-sm">
          Editing: <strong>{p.name}</strong>
        </p>
      </div>

      <ProductForm categories={categories} initialProduct={p} />
    </div>
  );
}