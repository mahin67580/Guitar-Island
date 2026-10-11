"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  customer_name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  upcomingProductId: string;
  productName: string;
};

export default function NotifyMeDialog({
  upcomingProductId,
  productName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customer_name: "", phone: "", email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("notify_requests").insert({
        upcoming_product_id: upcomingProductId,
        customer_name: values.customer_name,
        phone: values.phone,
        email: values.email || null,
      });

      if (error) throw error;

      toast.success(
        `Got it! We'll let you know when the ${productName} arrives.`
      );
      form.reset();
      setOpen(false);
    } catch (err) {
      console.error("Notify request error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-brass hover:bg-brass/90 text-ink font-semibold">
          <Bell className="w-4 h-4 mr-2" />
          Notify Me When Available
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Get Notified
          </DialogTitle>
          <DialogDescription>
            Leave your details and we&apos;ll contact you as soon as this
            arrives at the shop.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-cream/60 rounded-lg px-4 py-3 mb-2">
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-0.5">
            Coming soon
          </p>
          <p className="font-medium text-ink">{productName}</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
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

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-brass hover:bg-brass/90 text-ink font-semibold h-11"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Notify Me"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}