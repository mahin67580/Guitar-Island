"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit, ImageIcon, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryInput,
} from "@/lib/admin/categories-actions";
import type { Category } from "@/lib/types";

type Props = { categories: Category[] };

const emptyForm: CategoryInput = {
  name: "",
  slug: "",
  description: "",
  image_url: null,
  sort_order: 0,
};

export default function CategoriesClient({ categories }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setShowForm(true);
  };

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image_url: cat.image_url || null,
      sort_order: cat.sort_order ?? 0,
    });
    setImages(cat.image_url ? [cat.image_url] : []);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSubmitting(true);
    const payload: CategoryInput = {
      ...form,
      image_url: images[0] || null,
    };

    const res = editing
      ? await updateCategory(editing.id, payload)
      : await createCategory(payload);

    setSubmitting(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(editing ? "Category updated" : "Category created");
    cancel();
    startTransition(() => router.refresh());
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteCategory(deleteId);
    setDeleteId(null);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Category deleted");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-4">
      {!showForm && (
        <Button
          onClick={startCreate}
          className="bg-brass hover:bg-brass/90 text-ink font-semibold w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="font-display text-xl sm:text-2xl">
              {editing ? "Edit Category" : "New Category"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={cancel}
              className="shrink-0 -mt-1 sm:mt-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cat-name">Name *</Label>
                  <Input
                    id="cat-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Electric Guitars"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-slug">Slug (optional)</Label>
                  <Input
                    id="cat-slug"
                    value={form.slug || ""}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value })
                    }
                    placeholder="auto-generated if empty"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea
                  id="cat-desc"
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  placeholder="Short description for the category page"
                />
              </div>

              <div>
                <Label>Category Image</Label>
                <ImageUploader
                  bucket="site-assets"
                  value={images}
                  onChange={setImages}
                  maxImages={1}
                />
              </div>

              <div>
                <Label htmlFor="cat-order">Sort Order</Label>
                <Input
                  id="cat-order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sort_order: Number(e.target.value),
                    })
                  }
                  className="w-full max-w-none sm:max-w-[140px]"
                />
                <p className="text-xs text-ink/50 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-brass hover:bg-brass/90 text-ink font-semibold w-full sm:w-auto justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editing ? "Save Changes" : "Create"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancel}
                  className="w-full sm:w-auto justify-center"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category list */}
      <div className="space-y-3">
        {categories.length === 0 && !showForm && (
          <div className="text-center py-16 px-4 rounded-xl bg-cream/50">
            <p className="text-ink/60 text-sm sm:text-base">
              No categories yet. Add your first one to organize products.
            </p>
          </div>
        )}

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-black/5 bg-white"
          >
            {/* Image */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-cream/50 border border-black/5 shrink-0">
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 56px, 64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/20">
                  <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink text-sm sm:text-base truncate">
                    {cat.name}
                  </p>
                  <p className="text-xs text-ink/50 truncate">
                    /{cat.slug} · order: {cat.sort_order}
                  </p>
                </div>

                {/* Actions — pinned top-right on mobile, inline on desktop */}
                <div className="flex gap-1 shrink-0 sm:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEdit(cat)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteId(cat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {cat.description && (
                <p className="text-xs sm:text-sm text-ink/60 line-clamp-2 sm:line-clamp-1 mt-1">
                  {cat.description}
                </p>
              )}
            </div>

            {/* Actions — desktop only, inline at right */}
            <div className="hidden sm:flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEdit(cat)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(cat.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              Products in this category will not be deleted — they'll just
              become uncategorized. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}