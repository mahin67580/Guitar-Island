import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import GalleryGrid from "@/components/public/gallery/GalleryGrid";
import type { GalleryAlbum, GalleryImage } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_albums")
    .select("name, description, cover_image")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return { title: "Album not found — Guitar Island" };

  return {
    title: `${data.name} — Gallery — Guitar Island`,
    description: data.description || `Photos from ${data.name}`,
    openGraph: {
      title: data.name,
      description: data.description || undefined,
      images: data.cover_image ? [data.cover_image] : undefined,
    },
  };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: album } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!album) notFound();

  const { data: imagesData } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("album_id", album.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const images = (imagesData as GalleryImage[]) || [];
  const a = album as GalleryAlbum;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-20">
      {/* Back */}
      <Link
        href="/gallery"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-brass transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All albums
      </Link>

      {/* Header */}
      <div className="mb-10 max-w-3xl">
        
        <h1 className="font-display text-brass text-4xl md:text-5xl   mb-3">
          {a.name}
        </h1>
        {a.description && (
          <p className="text-ink/60 leading-relaxed">{a.description}</p>
        )}
        <p className="text-sm text-ink/40 mt-3">
          {images.length} photo{images.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Grid with lightbox */}
      {images.length === 0 ? (
        <div className="text-center py-24 rounded-2xl bg-cream/50">
          <p className="text-ink/60">
            No photos in this album yet. Check back soon!
          </p>
        </div>
      ) : (
        <GalleryGrid images={images} albumName={a.name} />
      )}
    </div>
  );
}