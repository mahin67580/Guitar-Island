"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/admin/ImageUploader";
import { createProduct, updateProduct } from "@/lib/admin/products";
import type { Category, Product } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  slug: z.string().optional(),
  sku: z.string().optional(),
  category_id: z.string().optional(),
  brand: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  discount_price: z
    .union([z.coerce.number().min(0), z.null(), z.literal("")])
    .optional(),
  quantity: z.coerce.number().int().min(0),
  low_stock_threshold: z.coerce.number().int().min(0),
  condition: z.enum(["New", "Used"]),
  status: z.enum(["active", "draft", "sold_out"]),
  short_description: z.string().optional(),
  description: z.string().optional(),
  specs: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
  images: z.array(z.string()),
  tags: z.string().optional(),
  is_featured: z.boolean(),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

type Props = {
  categories: Category[];
  initialProduct?: Product;
  prefill?: {
    name?: string;
    brand?: string;
    description?: string;
  };
};

export default function ProductForm({
  categories,
  initialProduct,
  prefill,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initialProduct;

  const defaultSpecs = initialProduct?.specs
    ? Object.entries(initialProduct.specs).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    : [];

  const form = useForm<FormValues, any, FormOutput>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: initialProduct?.name ?? prefill?.name ?? "",
      slug: initialProduct?.slug ?? "",
      sku: initialProduct?.sku ?? "",
      category_id: initialProduct?.category_id ?? "",
      brand: initialProduct?.brand ?? prefill?.brand ?? "",
      price: initialProduct?.price ?? 0,
      discount_price: initialProduct?.discount_price ?? null,
      quantity: initialProduct?.quantity ?? 0,
      low_stock_threshold: initialProduct?.low_stock_threshold ?? 3,
      condition: (initialProduct?.condition as "New" | "Used") ?? "New",
      status:
        (initialProduct?.status as "active" | "draft" | "sold_out") ?? "draft",
      short_description: initialProduct?.short_description ?? "",
      description: initialProduct?.description ?? prefill?.description ?? "",
      specs: defaultSpecs,
      images: initialProduct?.images ?? [],
      tags: initialProduct?.tags?.join(", ") ?? "",
      is_featured: initialProduct?.is_featured ?? false,
    },
  });

  const specsField = useFieldArray({
    control: form.control,
    name: "specs",
  });

  const onSubmit = async (values: FormOutput) => {
    setSubmitting(true);

    // Convert specs array → object
    const specsObject: Record<string, string> = {};
    values.specs.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) specsObject[key.trim()] = value.trim();
    });

    // Parse tags from comma-separated string
    const tags = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const payload = {
      name: values.name,
      slug: values.slug || "",
      sku: values.sku || null,
      category_id: values.category_id || null,
      brand: values.brand || null,
      price: values.price,
      discount_price:
  values.discount_price === "" ||
  values.discount_price === null ||
  values.discount_price === undefined
    ? null
    : Number(values.discount_price),
      quantity: values.quantity,
      low_stock_threshold: values.low_stock_threshold,
      condition: values.condition,
      status: values.status,
      short_description: values.short_description || null,
      description: values.description || null,
      specs: specsObject,
      images: values.images,
      tags,
      is_featured: values.is_featured,
    };

    const result = isEdit
      ? await updateProduct(initialProduct!.id, payload)
      : await createProduct(payload);

    setSubmitting(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Product updated" : "Product created");
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-5xl"
      >
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Fender Player Stratocaster"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Fender" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU / Product Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. FEN-STRAT-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Auto-generated from name if left empty"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank to auto-generate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="One-line summary for cards (max 300 chars)"
                      rows={2}
                      maxLength={300}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full description shown on the product page"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Images</CardTitle>
          </CardHeader>
          <CardContent>
           <FormField
  control={form.control}
  name="images"
  render={({ field }) => (
    <FormItem>
      <ImageUploader
        bucket="products"
        value={field.value || []}
        onChange={field.onChange}
      />
      <FormMessage />
    </FormItem>
  )}
/>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
  control={form.control}
  name="price"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Price (৳) *</FormLabel>
      <FormControl>
        <Input
          type="number"
          min={0}
          step="1"
          {...field}
          value={(field.value as string | number | undefined) ?? ""}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

              <FormField
  control={form.control}
  name="discount_price"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Discount Price (৳) — optional</FormLabel>
      <FormControl>
        <Input
          type="number"
          min={0}
          step="1"
          placeholder="Leave empty if no discount"
          value={(field.value as string | number | undefined) ?? ""}
          onChange={(e) =>
            field.onChange(e.target.value === "" ? "" : e.target.value)
          }
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
  control={form.control}
  name="quantity"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Quantity in Stock *</FormLabel>
      <FormControl>
        <Input
          type="number"
          min={0}
          step="1"
          {...field}
          value={(field.value as string | number | undefined) ?? ""}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

            <FormField
  control={form.control}
  name="low_stock_threshold"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Low Stock Alert At</FormLabel>
      <FormControl>
        <Input
          type="number"
          min={0}
          step="1"
          {...field}
          value={(field.value as string | number | undefined) ?? ""}
        />
      </FormControl>
      <FormDescription>
        Show &quot;Only X left&quot; badge below this quantity
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Used">Used</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active (visible)</SelectItem>
                        <SelectItem value="draft">Draft (hidden)</SelectItem>
                        <SelectItem value="sold_out">Sold Out</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Comma separated: strat, electric, beginner"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Used for search. Separate with commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-black/5 p-4">
                  <div>
                    <FormLabel className="text-base cursor-pointer">
                      Feature on Home Page
                    </FormLabel>
                    <FormDescription>
                      Show this product in &quot;Featured Guitars&quot;
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Specs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Specifications</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => specsField.append({ key: "", value: "" })}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Spec
            </Button>
          </CardHeader>
          <CardContent>
            {specsField.fields.length === 0 ? (
              <p className="text-sm text-ink/50 text-center py-6">
                No specs yet. Click &quot;Add Spec&quot; to add details like
                Body, Neck, Pickups, etc.
              </p>
            ) : (
              <div className="space-y-3">
                {specsField.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start"
                  >
                    <FormField
                      control={form.control}
                      name={`specs.${index}.key`}
                      render={({ field }) => (
                        <Input placeholder="e.g. Body" {...field} />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`specs.${index}.value`}
                      render={({ field }) => (
                        <Input placeholder="e.g. Alder" {...field} />
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => specsField.remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-cream/95 backdrop-blur p-4 rounded-xl border border-black/5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/products")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-brass hover:bg-brass/90 text-ink font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Save Changes" : "Create Product"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}