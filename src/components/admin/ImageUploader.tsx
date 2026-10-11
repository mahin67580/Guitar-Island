"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  bucket?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
};

export default function ImageUploader({
  bucket = "products",
  value,
  onChange,
  maxImages = 6,
  maxSizeMB = 5,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      if (value.length + fileArray.length > maxImages) {
        toast.error(`You can upload up to ${maxImages} images.`);
        return;
      }

      setUploading(true);
      const uploadedUrls: string[] = [];

      try {
        for (const file of fileArray) {
          // Validate type
          if (!file.type.startsWith("image/")) {
            toast.error(`"${file.name}" is not an image.`);
            continue;
          }

          // Validate size
          if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`"${file.name}" is larger than ${maxSizeMB}MB.`);
            continue;
          }

          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const filename = `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}.${ext}`;
          const path = `${filename}`;

          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file, { cacheControl: "3600", upsert: false });

          if (uploadError) {
            toast.error(`Failed to upload "${file.name}": ${uploadError.message}`);
            continue;
          }

          const { data } = supabase.storage.from(bucket).getPublicUrl(path);
          uploadedUrls.push(data.publicUrl);
        }

        if (uploadedUrls.length > 0) {
          onChange([...value, ...uploadedUrls]);
          toast.success(
            `${uploadedUrls.length} image${
              uploadedUrls.length > 1 ? "s" : ""
            } uploaded`
          );
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [bucket, maxImages, maxSizeMB, onChange, supabase, value]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (url: string) => {
    onChange(value.filter((v) => v !== url));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          dragging
            ? "border-brass bg-brass/5"
            : "border-ink/15 hover:border-brass/50 hover:bg-cream/50",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
          }}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-ink/70">
            <Loader2 className="w-8 h-8 animate-spin text-brass" />
            <p className="text-sm">Uploading...</p>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brass/10 text-brass mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <p className="font-medium text-ink mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-ink/50">
              PNG, JPG, WEBP up to {maxSizeMB}MB · Max {maxImages} images
            </p>
          </>
        )}
      </div>

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {value.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square rounded-lg overflow-hidden border border-black/5 bg-cream/50"
            >
              <Image
                src={url}
                alt={`Image ${i + 1}`}
                fill
                sizes="200px"
                className="object-cover"
              />

              {/* Primary badge */}
              {i === 0 && (
                <span className="absolute top-2 left-2 bg-brass text-ink text-[10px] font-semibold px-2 py-0.5 rounded">
                  Primary
                </span>
              )}

              {/* Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(i, i - 1)}
                    className="h-8 w-8 p-0"
                    title="Move left"
                  >
                    ←
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(url)}
                  className="h-8 w-8 p-0"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </Button>
                {i < value.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(i, i + 1)}
                    className="h-8 w-8 p-0"
                    title="Move right"
                  >
                    →
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}