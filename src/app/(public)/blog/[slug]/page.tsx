import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, ImageIcon, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { BlogPost } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, meta_title, meta_description")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return { title: "Post not found — Guitar Island" };

  return {
    title: data.meta_title || `${data.title} — Guitar Island`,
    description: data.meta_description || data.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  const p = post as BlogPost;

  // Fetch related posts (same category, excluding self)
  const { data: related } = p.category
    ? await supabase
        .from("blog_posts")
        .select("id, title, slug, cover_image, created_at")
        .eq("is_published", true)
        .eq("category", p.category)
        .neq("id", p.id)
        .limit(3)
    : { data: [] };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-15">
      {/* Back */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-brass transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All posts
      </Link>

      {/* Category + meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {p.category && <Badge variant="secondary">{p.category}</Badge>}
        <div className="flex items-center gap-1.5 text-xs text-ink/50">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(p.created_at), "MMMM d, yyyy")}
        </div>
        {p.author && (
          <div className="flex items-center gap-1.5 text-xs text-ink/50">
            <User className="w-3.5 h-3.5" />
            {p.author}
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="font-display text-4xl md:text-5xl text-ink mb-6 leading-tight">
        {p.title}
      </h1>

      {/* Excerpt */}
      {p.excerpt && (
        <p className="text-lg text-ink/70 mb-8 leading-relaxed">
          {p.excerpt}
        </p>
      )}

      {/* Cover */}
      {p.cover_image && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-cream/50">
          <Image
            src={p.cover_image}
            alt={p.title}
            fill
            sizes="(max-width: 1024px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      {p.content ? (
        <div className="prose-content text-ink/80 leading-relaxed text-lg space-y-5">
          {p.content.split("\n\n").map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl bg-cream/50">
          <ImageIcon className="w-12 h-12 text-ink/20 mx-auto mb-3" />
          <p className="text-ink/60">Content coming soon.</p>
        </div>
      )}

      {/* Related */}
      {related && related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-black/5">
          <h2 className="font-display text-2xl text-ink mb-6">
            Related Posts
          </h2>
          <div className="space-y-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="flex gap-4 p-3 rounded-lg hover:bg-cream/60 transition-colors group"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-cream/50 shrink-0">
                  {r.cover_image ? (
                    <Image
                      src={r.cover_image}
                      alt={r.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/20">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-ink group-hover:text-brass transition-colors line-clamp-2 mb-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-ink/50">
                    {format(new Date(r.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}