import Link from "next/link";
import Image from "next/image";
import { Camera, ImageIcon, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { GalleryAlbum } from "@/lib/types";

export const metadata = {
  title: "Gallery — Guitar Island",
  description:
    "Photos of happy customers, in-store events, and moments from Guitar Island.",
};

export default async function GalleryPage() {
  const supabase = await createClient();

  const [{ data: albumsData }, { data: imagesData }] = await Promise.all([
    supabase
      .from("gallery_albums")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("gallery_images")
      .select("album_id, image_url")
      .eq("is_published", true),
  ]);

  const albums = (albumsData as GalleryAlbum[]) || [];
  const allImages = imagesData || [];

  const albumsWithCounts = albums.map((album) => ({
    ...album,
    image_count: allImages.filter((i) => i.album_id === album.id).length,
  }));

  const totalImages = allImages.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-brass text-sm mb-3">
          <Camera className="w-4 h-4" />
          <span className="uppercase tracking-widest">Our Gallery</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-3">
          Moments from Guitar Island
        </h1>
        <p className="text-ink/60 max-w-2xl mx-auto">
          Happy customers with their new guitars, in-store events, and behind
          the scenes from our shop.
        </p>
        {/* {totalImages > 0 && (
          <p className="text-sm text-ink/40 mt-3">
            {totalImages} photos across {albumsWithCounts.length}{" "}
            {albumsWithCounts.length === 1 ? "album" : "albums"}
          </p>
        )} */}
      </div>

      {/* Empty state */}
      {albumsWithCounts.length === 0 && (
        <div className="text-center py-24 rounded-2xl bg-cream/50">
          <ImageIcon className="w-16 h-16 text-ink/20 mx-auto mb-4" />
          <h3 className="font-display text-2xl text-ink mb-2">
            No photos yet
          </h3>
          <p className="text-ink/60 max-w-md mx-auto">
            Check back soon — we&apos;ll be adding photos of customers and
            events.
          </p>
        </div>
      )}

      {/* Albums grid */}
      {albumsWithCounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {albumsWithCounts.map((album) => {
            const firstImage = allImages.find(
              (i) => i.album_id === album.id
            )?.image_url;
            const coverUrl = album.cover_image || firstImage;

            return (
              <Link
                key={album.id}
                href={`/gallery/${album.slug}`}
                className=" bg-cream/40 group rounded-2xl overflow-hidden border border-black/5 hover:shadow-2xl transition-all"
              >
                <div className="relative aspect-[4/3] bg-cream/50 overflow-hidden">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={album.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-ink/20">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <Badge className="bg-white/90 hover:bg-white text-ink">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {album.image_count} photo
                      {album.image_count === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-xl text-ink mb-2 group-hover:text-brass transition-colors">
                    {album.name}
                  </h3>
                  {album.description && (
                    <p className="text-sm text-ink/60 line-clamp-2">
                      {album.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}