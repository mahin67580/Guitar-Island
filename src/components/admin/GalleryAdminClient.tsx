"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  FolderOpen,
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  addGalleryImages,
  createAlbum,
  deleteAlbum,
  deleteGalleryImage,
  toggleAlbumPublished,
  updateAlbum,
  updateGalleryImage,
  type AlbumInput,
} from "@/lib/admin/gallery-actions";
import { cn } from "@/lib/utils";
import type { GalleryAlbum, GalleryImage } from "@/lib/types";

type Props = {
  albums: GalleryAlbum[];
  images: GalleryImage[];
};

const emptyAlbum: AlbumInput = {
  name: "",
  slug: "",
  description: "",
  cover_image: null,
  sort_order: 0,
  is_published: true,
};

export default function GalleryAdminClient({ albums, images }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(
    albums[0]?.id ?? null
  );
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [albumForm, setAlbumForm] = useState<AlbumInput>(emptyAlbum);
  const [cover, setCover] = useState<string[]>([]);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteAlbumId, setDeleteAlbumId] = useState<string | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  // ─── Album form ───

  const startCreateAlbum = () => {
    setEditingAlbum(null);
    setAlbumForm(emptyAlbum);
    setCover([]);
    setShowAlbumForm(true);
  };

  const startEditAlbum = (album: GalleryAlbum) => {
    setEditingAlbum(album);
    setAlbumForm({
      name: album.name,
      slug: album.slug,
      description: album.description || "",
      cover_image: album.cover_image || null,
      sort_order: album.sort_order,
      is_published: album.is_published,
    });
    setCover(album.cover_image ? [album.cover_image] : []);
    setShowAlbumForm(true);
  };

  const cancelAlbumForm = () => {
    setShowAlbumForm(false);
    setEditingAlbum(null);
    setAlbumForm(emptyAlbum);
    setCover([]);
  };

  const submitAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumForm.name.trim()) {
      toast.error("Album name is required");
      return;
    }
    setSubmitting(true);

    const payload: AlbumInput = {
      ...albumForm,
      cover_image: cover[0] || null,
    };

    const res = editingAlbum
      ? await updateAlbum(editingAlbum.id, payload)
      : await createAlbum(payload);

    setSubmitting(false);
    if ("error" in res && res.error) return toast.error(res.error);

    toast.success(editingAlbum ? "Album updated" : "Album created");
    cancelAlbumForm();
    refresh();
  };

  const handleDeleteAlbum = async () => {
    if (!deleteAlbumId) return;
    const res = await deleteAlbum(deleteAlbumId);
    setDeleteAlbumId(null);
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success("Album deleted");
    refresh();
  };

  const handleTogglePublish = async (
    album: GalleryAlbum,
    published: boolean
  ) => {
    const res = await toggleAlbumPublished(album.id, published);
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success(published ? "Album published" : "Album hidden");
    refresh();
  };

  // ─── Images inside album ───

  const handleAddImages = async (albumId: string, urls: string[]) => {
    if (urls.length === 0) return;
    const res = await addGalleryImages(albumId, urls);
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} added`);
    refresh();
  };

  const handleToggleImage = async (
    image: GalleryImage,
    published: boolean
  ) => {
    const res = await updateGalleryImage(image.id, {
      is_published: published,
    });
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success(published ? "Image visible" : "Image hidden");
    refresh();
  };

  const handleDeleteImage = async () => {
    if (!deleteImageId) return;
    const res = await deleteGalleryImage(deleteImageId);
    setDeleteImageId(null);
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success("Image deleted");
    refresh();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Albums list header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-ink/60">
          {albums.length} album{albums.length === 1 ? "" : "s"} ·{" "}
          {images.length} image{images.length === 1 ? "" : "s"}
        </p>
        {!showAlbumForm && (
          <Button
            onClick={startCreateAlbum}
            className="bg-brass hover:bg-brass/90 text-ink font-semibold w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Album
          </Button>
        )}
      </div>

      {/* Album form */}
      {showAlbumForm && (
        <Card>
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="font-display text-xl sm:text-2xl">
              {editingAlbum ? "Edit Album" : "New Album"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelAlbumForm}
              className="shrink-0 -mt-1 sm:mt-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitAlbum} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={albumForm.name}
                    onChange={(e) =>
                      setAlbumForm({ ...albumForm, name: e.target.value })
                    }
                    placeholder="e.g. Happy Customers 2025"
                  />
                </div>
                <div>
                  <Label>Slug (optional)</Label>
                  <Input
                    value={albumForm.slug || ""}
                    onChange={(e) =>
                      setAlbumForm({ ...albumForm, slug: e.target.value })
                    }
                    placeholder="auto from name"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={albumForm.description || ""}
                  onChange={(e) =>
                    setAlbumForm({
                      ...albumForm,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="Short description for the album page"
                />
              </div>

              <div>
                <Label>Cover Image</Label>
                <ImageUploader
                  bucket="gallery"
                  value={cover}
                  onChange={setCover}
                  maxImages={1}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-end">
                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={albumForm.sort_order}
                    onChange={(e) =>
                      setAlbumForm({
                        ...albumForm,
                        sort_order: Number(e.target.value),
                      })
                    }
                    className="w-full md:max-w-[140px]"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-black/5 p-3">
                  <Label className="text-sm">Published</Label>
                  <Switch
                    checked={albumForm.is_published}
                    onCheckedChange={(c) =>
                      setAlbumForm({ ...albumForm, is_published: c })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-brass hover:bg-brass/90 text-ink font-semibold w-full sm:w-auto justify-center"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingAlbum ? "Save Changes" : "Create Album"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelAlbumForm}
                  className="w-full sm:w-auto justify-center"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {albums.length === 0 && !showAlbumForm && (
        <div className="text-center py-16 px-4 rounded-xl bg-cream/50">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-ink/20" />
          <p className="text-ink/60 mb-4 text-sm sm:text-base">
            No albums yet. Create your first one to start adding images.
          </p>
        </div>
      )}

      {/* Albums with expandable images */}
      {albums.map((album) => {
        const albumImages = images.filter((i) => i.album_id === album.id);
        const isOpen = expanded === album.id;
        return (
          <div
            key={album.id}
            className="rounded-xl border border-black/5 bg-white overflow-hidden"
          >
            {/* Album header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
              {/* Row 1 on mobile: chevron + cover + info */}
              <button
                onClick={() => setExpanded(isOpen ? null : album.id)}
                className="flex items-center gap-3 flex-1 text-left min-w-0"
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-ink/50 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-ink/50 shrink-0" />
                )}

                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-cream/50 border border-black/5 shrink-0">
                  {album.cover_image ? (
                    <Image
                      src={album.cover_image}
                      alt={album.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/20">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-medium text-ink truncate text-sm sm:text-base">
                      {album.name}
                    </p>
                    {album.is_published ? (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        <Eye className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-ink/50 truncate">
                    /{album.slug} · {albumImages.length} image
                    {albumImages.length === 1 ? "" : "s"}
                  </p>
                </div>
              </button>

              {/* Actions — full row on mobile, inline on desktop */}
              <div className="flex gap-1 shrink-0 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTogglePublish(album, !album.is_published)}
                  title={album.is_published ? "Hide album" : "Publish album"}
                  className="h-9 w-9"
                >
                  {album.is_published ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditAlbum(album)}
                  className="h-9"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteAlbumId(album.id)}
                  className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Expanded images */}
            {isOpen && (
              <div className="border-t border-black/5 p-3 sm:p-4 bg-cream/20">
                {/* Add images */}
                <div className="mb-4">
                  <Label className="mb-2 block text-sm">
                    Add images to this album
                  </Label>
                  <BulkImageAdder
                    albumId={album.id}
                    onAdd={(urls) => handleAddImages(album.id, urls)}
                  />
                </div>

                {/* Images grid */}
                {albumImages.length === 0 ? (
                  <p className="text-center py-8 text-sm text-ink/50">
                    No images yet. Upload some above.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {albumImages.map((image) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-black/5 bg-cream/50"
                      >
                        <Image
                          src={image.image_url}
                          alt={image.caption || ""}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className={cn(
                            "object-cover",
                            !image.is_published && "opacity-40"
                          )}
                        />

                        {/* Hover overlay (desktop) */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 sm:group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handleToggleImage(image, !image.is_published)
                            }
                            className="h-8 w-8 p-0"
                            title={
                              image.is_published ? "Hide image" : "Show image"
                            }
                          >
                            {image.is_published ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteImageId(image.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Always-visible action buttons on mobile */}
                        <div className="sm:hidden absolute bottom-1.5 right-1.5 flex gap-1">
                          <button
                            onClick={() =>
                              handleToggleImage(image, !image.is_published)
                            }
                            aria-label={
                              image.is_published ? "Hide image" : "Show image"
                            }
                            className="h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center"
                          >
                            {image.is_published ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteImageId(image.id)}
                            aria-label="Delete image"
                            className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Status pill */}
                        {!image.is_published && (
                          <span className="absolute top-2 left-2 bg-ink/80 text-cream text-[10px] px-2 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Delete album confirm */}
      <AlertDialog
        open={!!deleteAlbumId}
        onOpenChange={(o) => !o && setDeleteAlbumId(null)}
      >
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this album?</AlertDialogTitle>
            <AlertDialogDescription>
              All images in this album will also be deleted. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAlbum}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete image confirm */}
      <AlertDialog
        open={!!deleteImageId}
        onOpenChange={(o) => !o && setDeleteImageId(null)}
      >
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
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

/**
 * Bulk image adder — same as ImageUploader but auto-adds to album on upload
 */
function BulkImageAdder({
  albumId,
  onAdd,
}: {
  albumId: string;
  onAdd: (urls: string[]) => void;
}) {
  const [urls, setUrls] = useState<string[]>([]);

  const handleChange = (next: string[]) => {
    const added = next.filter((u) => !urls.includes(u));
    setUrls(next);
    if (added.length > 0) {
      onAdd(added);
      setTimeout(() => setUrls([]), 100);
    }
  };

  return (
    <ImageUploader
      bucket="gallery"
      value={urls}
      onChange={handleChange}
      maxImages={20}
    />
  );
}