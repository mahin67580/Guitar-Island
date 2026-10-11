"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Edit, Eye, EyeOff, ImageIcon, Newspaper, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { deleteBlogPost } from "@/lib/admin/blog-actions";
import type { BlogPost } from "@/lib/types";

type Props = {
  posts: BlogPost[];
};

export default function BlogListClient({ posts }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteBlogPost(deleteId);
    setDeleteId(null);
    if ("error" in res && res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Post deleted");
    startTransition(() => router.refresh());
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl bg-cream/50">
        <Newspaper className="w-12 h-12 mx-auto mb-3 text-ink/20" />
        <p className="text-ink/60 mb-4">No posts yet.</p>
        <Button asChild className="bg-brass hover:bg-brass/90 text-ink">
          <Link href="/admin/blog/new">Write your first post</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-black/5 bg-white"
          >
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-cream/50 border border-black/5 shrink-0">
              {post.cover_image ? (
                <Image
                  src={post.cover_image}
                  alt={post.title}
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

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-ink line-clamp-1">
                  {post.title}
                </p>
                {post.is_published ? (
                  <Badge variant="secondary" className="text-[10px]">
                    <Eye className="w-3 h-3 mr-1" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Draft
                  </Badge>
                )}
                {post.category && (
                  <Badge variant="outline" className="text-[10px]">
                    {post.category}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-ink/50">
                {format(new Date(post.created_at), "MMM d, yyyy")}
                {post.author && ` · ${post.author}`}
              </p>
              {post.excerpt && (
                <p className="text-sm text-ink/60 line-clamp-1 mt-1">
                  {post.excerpt}
                </p>
              )}
            </div>

            <div className="flex gap-1">
              <Button asChild variant="ghost" size="icon">
                <Link href={`/admin/blog/${post.id}/edit`}>
                  <Edit className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(post.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}