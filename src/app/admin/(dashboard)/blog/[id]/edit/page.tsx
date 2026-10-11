import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import BlogForm from "@/components/admin/BlogForm";
import type { BlogPost } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Edit Post — Admin" };

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  await requireAdmin();
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-brass transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to posts
        </Link>
        <h1 className="font-display text-3xl text-ink">Edit Post</h1>
      </div>
      <BlogForm initialPost={post as BlogPost} />
    </div>
  );
}