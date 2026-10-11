"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  createBlogPost,
  updateBlogPost,
  type BlogInput,
} from "@/lib/admin/blog-actions";
import type { BlogPost } from "@/lib/types";

type Props = { initialPost?: BlogPost };

export default function BlogForm({ initialPost }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [cover, setCover] = useState<string[]>(
    initialPost?.cover_image ? [initialPost.cover_image] : []
  );

  const [form, setForm] = useState<Omit<BlogInput, "cover_image" | "tags">>({
    title: initialPost?.title || "",
    slug: initialPost?.slug || "",
    excerpt: initialPost?.excerpt || "",
    content: initialPost?.content || "",
    category: initialPost?.category || "",
    is_published: initialPost?.is_published ?? false,
    meta_title: initialPost?.meta_title || "",
    meta_description: initialPost?.meta_description || "",
    author: initialPost?.author || "",
  });

  const [tagsInput, setTagsInput] = useState(
    (initialPost?.tags || []).join(", ")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: BlogInput = {
      ...form,
      tags,
      cover_image: cover[0] || null,
    };

    const res = initialPost
      ? await updateBlogPost(initialPost.id, payload)
      : await createBlogPost(payload);

    setSubmitting(false);

    if ("error" in res && res.error) {
      toast.error(res.error);
      return;
    }

    toast.success(initialPost ? "Post updated" : "Post created");
    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Post Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 5 Tips for Choosing Your First Electric Guitar"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Slug (optional)</Label>
              <Input
                value={form.slug || ""}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto from title"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={form.category || ""}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="e.g. Guides, Reviews"
              />
            </div>
          </div>

          <div>
            <Label>Excerpt</Label>
            <Textarea
              value={form.excerpt || ""}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              placeholder="Short summary shown in the blog list"
            />
          </div>

          <div>
            <Label>Content</Label>
            <Textarea
              value={form.content || ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={12}
              placeholder="Write your post here. Separate paragraphs with a blank line."
              className="font-mono text-sm"
            />
            <p className="text-xs text-ink/50 mt-1">
              Tip: press Enter twice between paragraphs
            </p>
          </div>

          <div>
            <Label>Cover Image</Label>
            <ImageUploader
              bucket="blogs"
              value={cover}
              onChange={setCover}
              maxImages={1}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Author</Label>
              <Input
                value={form.author || ""}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="e.g. Guitar Island Team"
              />
            </div>
            <div>
              <Label>Tags</Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Comma separated"
              />
            </div>
          </div>

          <div>
            <Label>Meta Title (SEO)</Label>
            <Input
              value={form.meta_title || ""}
              onChange={(e) =>
                setForm({ ...form, meta_title: e.target.value })
              }
              placeholder="Defaults to post title"
            />
          </div>

          <div>
            <Label>Meta Description (SEO)</Label>
            <Textarea
              value={form.meta_description || ""}
              onChange={(e) =>
                setForm({ ...form, meta_description: e.target.value })
              }
              rows={2}
              placeholder="Defaults to excerpt"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-black/5 p-4">
            <div>
              <Label className="text-base">Publish</Label>
              <p className="text-xs text-ink/50">
                Make visible on the public blog
              </p>
            </div>
            <Switch
              checked={form.is_published}
              onCheckedChange={(c) => setForm({ ...form, is_published: c })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-brass hover:bg-brass/90 text-ink font-semibold"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {initialPost ? "Save Changes" : "Create Post"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/blog")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}