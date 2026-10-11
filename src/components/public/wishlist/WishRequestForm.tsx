"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  customer_name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  product_name: z
    .string()
    .min(2, "Tell us what you're looking for")
    .max(200, "Name too long"),
  brand: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function WishRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      product_name: "",
      brand: "",
      budget: "",
      notes: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("wish_requests").insert({
        customer_name: values.customer_name,
        phone: values.phone,
        email: values.email || null,
        product_name: values.product_name,
        brand: values.brand || null,
        budget: values.budget || null,
        notes: values.notes || null,
      });

      if (error) throw error;

      toast.success(
        "Wish request sent! We'll try our best to source it for you and get back to you soon."
      );
      form.reset();
    } catch (err) {
      console.error("Wish request error:", err);
      toast.error(
        "Something went wrong. Please try again or call us directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6 md:p-8">
      <div className="flex items-start gap-3 mb-6">
        <div className="shrink-0 w-10 h-10 rounded-full bg-brass/10 text-brass flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-ink mb-1">
            Can't find what you're looking for?
          </h2>
          <p className="text-ink/60 text-sm">
            Tell us what guitar you dream of. We'll try our best to source it
            for you.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+880 1XXX-XXXXXX"
                      type="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What guitar are you looking for? *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Fender Telecaster American Pro II"
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
                  <FormLabel>Brand (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Fender, Gibson, Ibanez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ৳50,000 - ৳80,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Color, condition, specific features, timeframe..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-brass hover:bg-brass/90 text-ink font-semibold h-11 px-6"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Wish Request
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}