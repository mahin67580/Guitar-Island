import Image from "next/image";
import Link from "next/link";
import { Calendar, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SectionHeading from "@/components/public/SectionHeading";
import type { BlogPost } from "@/lib/types";
import { format } from "date-fns";

export default async function LatestBlogPosts() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, cover_image, excerpt, created_at, category")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!posts || posts.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading
          title="From the Blog"
          subtitle="Guitar tips, gear reviews, and stories from the shop."
          viewAllHref="/blog"
        />
        <div className="text-center py-12 rounded-2xl bg-cream/50">
          <p className="text-ink/60">
            No blog posts yet. Check back soon for guitar tips and stories!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream/40 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="From the Blog"
          subtitle="Guitar tips, gear reviews, and stories from the shop."
          viewAllHref="/blog"
          viewAllLabel="All posts"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(posts as Partial<BlogPost>[]).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-all"
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
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                {post.category && (
                  <span className="absolute top-3 left-3 bg-ink/80 text-cream text-xs px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-ink/50 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.created_at
                    ? format(new Date(post.created_at), "MMM d, yyyy")
                    : ""}
                </div>
                <h3 className="font-medium text-ink line-clamp-2 group-hover:text-brass transition-colors mb-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-ink/60 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}