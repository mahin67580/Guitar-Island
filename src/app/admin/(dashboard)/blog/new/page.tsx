import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/helpers";
import BlogForm from "@/components/admin/BlogForm";

export const metadata = { title: "New Post — Admin" };

export default async function NewBlogPostPage() {
  await requireAdmin();
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
        <h1 className="font-display text-3xl text-ink">New Blog Post</h1>
      </div>
      <BlogForm />
    </div>
  );
}