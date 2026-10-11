"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CalendarClock,
  Edit,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  createUpcoming,
  deleteUpcoming,
  updateUpcoming,
  type UpcomingInput,
} from "@/lib/admin/upcoming-actions";
import type { UpcomingProduct } from "@/lib/types";

const empty: UpcomingInput = {
  name: "",
  image_url: null,
  expected_date: null,
  description: "",
  is_published: true,
};

export default function UpcomingClient({
  items,
}: {
  items: UpcomingProduct[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<UpcomingProduct | null>(null);
  const [form, setForm] = useState<UpcomingInput>(empty);
  const [images, setImages] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setImages([]);
    setShowForm(true);
  };

  const startEdit = (item: UpcomingProduct) => {
    setEditing(item);
    setForm({
      name: item.name,
      image_url: item.image_url || null,
      expected_date: item.expected_date || null,
      description: item.description || "",
      is_published: item.is_published,
    });
    setImages(item.image_url ? [item.image_url] : []);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm(empty);
    setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSubmitting(true);
    const payload = { ...form, image_url: images[0] || null };
    const res = editing
      ? await updateUpcoming(editing.id, payload)
      : await createUpcoming(payload);
    setSubmitting(false);
    if (res.error) return toast.error(res.error);
    toast.success(editing ? "Updated" : "Created");
    cancel();
    startTransition(() => router.refresh());
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteUpcoming(deleteId);
    setDeleteId(null);
    if (res.error) return toast.error(res.error);
    toast.success("Deleted");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-4">
      {!showForm && (
        <Button
          onClick={startCreate}
          className="bg-brass hover:bg-brass/90 text-ink font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Upcoming Product
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">
              {editing ? "Edit" : "New"} Upcoming Product
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={cancel}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. PRS SE Custom 24"
                />
              </div>

              <div>
                <Label>Expected Date</Label>
                <Input
                  type="date"
                  value={form.expected_date || ""}
                  onChange={(e) =>
                    setForm({ ...form, expected_date: e.target.value || null })
                  }
                  className="max-w-[220px]"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>Image</Label>
                <ImageUploader
                  bucket="upcoming"
                  value={images}
                  onChange={setImages}
                  maxImages={1}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-black/5 p-4">
                <div>
                  <Label className="text-base">Published</Label>
                  <p className="text-xs text-ink/50">
                    Show on the public /upcoming page
                  </p>
                </div>
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(c) =>
                    setForm({ ...form, is_published: c })
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-brass hover:bg-brass/90 text-ink font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editing ? "Save Changes" : "Create"}
                </Button>
                <Button type="button" variant="ghost" onClick={cancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {items.length === 0 && !showForm && (
          <div className="text-center py-16 rounded-xl bg-cream/50">
            <p className="text-ink/60">
              No upcoming products. Add one to tease your customers.
            </p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-black/5 bg-white"
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream/50 border border-black/5 shrink-0">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/20">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-ink">{item.name}</p>
                {item.is_published ? (
                  <Badge variant="secondary" className="text-[10px]">
                    <Eye className="w-3 h-3 mr-1" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Hidden
                  </Badge>
                )}
              </div>
              {item.expected_date && (
                <p className="text-xs text-ink/50 flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  {format(new Date(item.expected_date), "MMM d, yyyy")}
                </p>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEdit(item)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(item.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}