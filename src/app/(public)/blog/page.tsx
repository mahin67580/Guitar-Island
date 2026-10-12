import Image from "next/image";
import Link from "next/link";
import { Calendar, ImageIcon, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { BlogPost } from "@/lib/types";

export const metadata = {
  title: "Blog — Guitar Island",
  description:
    "Guitar tips, gear reviews, and stories from the Guitar Island shop.",
};

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, cover_image, excerpt, category, created_at, author")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const list = (posts as Partial<BlogPost>[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-15">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-brass text-sm mb-3">
          <Newspaper className="w-4 h-4" />
          <span className="uppercase tracking-widest">From the Blog</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-3">
          Guitar Stories & Tips
        </h1>
        <p className="text-ink/60 max-w-2xl mx-auto">
          Gear reviews, playing tips, and stories from our shop.
        </p>
      </div>

      {/* Empty */}
      {list.length === 0 && (
        <div className="text-center py-24 rounded-2xl bg-cream/50">
          <Newspaper className="w-16 h-16 text-ink/20 mx-auto mb-4" />
          <h3 className="font-display text-2xl text-ink mb-2">
            No blog posts yet
          </h3>
          <p className="text-ink/60 max-w-md mx-auto">
            We&apos;re working on some great content. Check back soon!
          </p>
        </div>
      )}

      {/* Grid */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-cream/50 overflow-hidden">
                {post.cover_image ? (
                  <Image
                    src={post.cover_image}
                    alt={post.title || ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-ink/20">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                )}
                {post.category && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-ink/80 hover:bg-ink text-cream">
                      {post.category}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-ink/50 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.created_at
                    ? format(new Date(post.created_at), "MMM d, yyyy")
                    : ""}
                  {post.author && (
                    <>
                      <span>·</span>
                      <span>{post.author}</span>
                    </>
                  )}
                </div>
                <h2 className="font-display text-xl text-ink mb-2 line-clamp-2 group-hover:text-brass transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-ink/60 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-4 text-sm font-medium text-brass">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}