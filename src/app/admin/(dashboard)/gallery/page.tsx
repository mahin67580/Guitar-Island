import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import GalleryAdminClient from "@/components/admin/GalleryAdminClient";
import type { GalleryAlbum, GalleryImage } from "@/lib/types";

export const metadata = { title: "Gallery — Admin" };

export default async function AdminGalleryPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: albums }, { data: images }] = await Promise.all([
    supabase
      .from("gallery_albums")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  // Attach image count to each album
  const albumList = (albums as GalleryAlbum[]) || [];
  const imageList = (images as GalleryImage[]) || [];

  const albumsWithCount = albumList.map((a) => ({
    ...a,
    image_count: imageList.filter((img) => img.album_id === a.id).length,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Gallery</h1>
        <p className="text-ink/60 text-sm">
          Upload photos of happy customers, in-store events, and more.
          Organize them into albums.
        </p>
      </div>

      <GalleryAdminClient
        albums={albumsWithCount}
        images={imageList}
      />
    </div>
  );
}