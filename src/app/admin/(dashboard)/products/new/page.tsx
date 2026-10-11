import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/helpers";
import { getAllCategories } from "@/lib/admin/categories";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Add Product — Admin" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await getAllCategories();

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
        <h1 className="font-display text-3xl text-ink">Add New Product</h1>
        <p className="text-ink/60 text-sm">
          Fill in the details below. Only the name and price are required.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}