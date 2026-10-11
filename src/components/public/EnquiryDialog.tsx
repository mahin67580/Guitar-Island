"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Phone } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  customer_name: z.string().min(2, "Please enter your full name"),
  phone: z
    .string()
    .min(6, "Please enter a valid phone number")
    .max(20, "Phone number too long"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  preferred_time: z.string().optional(),
  preferred_visit_date: z.string().optional(),
  message: z.string().max(1000, "Message too long").optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  productId: string;
  productName: string;
  trigger?: React.ReactNode;
};

export default function EnquiryDialog({
  productId,
  productName,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      preferred_time: "",
      preferred_visit_date: "",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("enquiries").insert({
        product_id: productId,
        product_name: productName,
        customer_name: values.customer_name,
        phone: values.phone,
        email: values.email || null,
        preferred_time: values.preferred_time || null,
        preferred_visit_date: values.preferred_visit_date || null,
        message: values.message || null,
        quantity: 1,
      });

      if (error) throw error;

      toast.success(
        "Enquiry sent! We'll call you within 24 hours to confirm and schedule your visit."
      );
      form.reset();
      setOpen(false);
    } catch (err) {
      console.error("Enquiry submission error:", err);
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="lg"
            className="bg-brass hover:bg-brass/90 text-ink font-semibold w-full sm:w-auto"
          >
            <Phone className="w-5 h-5 mr-2" />
            Enquire About This Guitar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Enquire About This Guitar
          </DialogTitle>
          <DialogDescription>
            Fill in your details and we&apos;ll call you back within 24 hours to
            confirm availability and schedule a store visit.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-cream/60 rounded-lg px-4 py-3 mb-2">
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-0.5">
            Product
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
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
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

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="preferred_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Best time to call</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Morning (10am-1pm)">
                          Morning
                        </SelectItem>
                        <SelectItem value="Afternoon (1pm-5pm)">
                          Afternoon
                        </SelectItem>
                        <SelectItem value="Evening (5pm-9pm)">
                          Evening
                        </SelectItem>
                        <SelectItem value="Any time">Any time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_visit_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred visit date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any questions or specific requests?"
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
              className="w-full bg-brass hover:bg-brass/90 text-ink font-semibold h-11"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Enquiry"
              )}
            </Button>

            <p className="text-xs text-ink/50 text-center">
              We&apos;ll never share your details. This is only used to contact
              you about this enquiry.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}