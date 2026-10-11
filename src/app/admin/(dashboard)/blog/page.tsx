import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import BlogListClient from "@/components/admin/BlogListClient";
import type { BlogPost } from "@/lib/types";

export const metadata = { title: "Blog — Admin" };

export default async function AdminBlogPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Blog Posts</h1>
          <p className="text-ink/60 text-sm">
            Write and publish articles for your shop.
          </p>
        </div>
        <Button
          asChild
          className="bg-brass hover:bg-brass/90 text-ink font-semibold"
        >
          <Link href="/admin/blog/new">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>
      <BlogListClient posts={(data as BlogPost[]) || []} />
    </div>
  );
}