"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, Truck, Wallet } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { createOrder } from "@/lib/orders/actions";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 100;
const BKASH_NUMBER = "01680301577"; // replace with your real bKash number

const schema = z.object({
  customer_name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, "Please enter your full delivery address"),
  city: z.string().optional(),
  district: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().max(500).optional(),
  payment_method: z.enum(["cod", "bkash"]),
  payment_reference: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart, ready } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      district: "",
      postal_code: "",
      notes: "",
      payment_method: "cod",
      payment_reference: "",
    },
  });

  const paymentMethod = form.watch("payment_method");
  const total = subtotal + DELIVERY_FEE;

  const onSubmit = async (values: FormValues) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        customer_name: values.customer_name,
        phone: values.phone,
        email: values.email || undefined,
        address: values.address,
        city: values.city || undefined,
        district: values.district || undefined,
        postal_code: values.postal_code || undefined,
        notes: values.notes || undefined,
        payment_method: values.payment_method,
        payment_reference: values.payment_reference || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        delivery_fee: DELIVERY_FEE,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      localStorage.setItem("gi_last_order", result.orderNumber);

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order/${result.orderNumber}`);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Wait until cart loaded from localStorage
  if (!ready) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-brass" />
        <p className="text-sm text-ink/50 mt-2">Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/60 mb-4">
          Your cart is empty. Add some products to checkout.
        </p>
        <Button asChild className="bg-brass hover:bg-brass/90 text-ink">
          <a href="/shop">Browse Shop</a>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8"
      >
        {/* Left: Customer info */}
        <div className="space-y-8">
          {/* Contact */}
          <section className="bg-white rounded-2xl border border-black/5 p-6">
            <h2 className="font-display text-xl text-ink mb-4">
              1. Contact Information
            </h2>
            <div className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="01XXXXXXXXX"
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
              </div>
            </div>
          </section>

          {/* Delivery */}
          <section className="bg-white rounded-2xl border border-black/5 p-6">
            <h2 className="font-display text-xl text-ink mb-4">
              2. Delivery Address
            </h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="House, road, area, landmark"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Comilla" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Comilla" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="3500" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Preferred delivery time, special instructions..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white rounded-2xl border border-black/5 p-6">
            <h2 className="font-display text-xl text-ink mb-4">
              3. Payment Method
            </h2>

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      {/* COD */}
                      <label
                        htmlFor="pm-cod"
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
                          field.value === "cod"
                            ? "border-brass bg-brass/5"
                            : "border-black/10 hover:border-black/20"
                        )}
                      >
                        <RadioGroupItem value="cod" id="pm-cod" className="mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-ink flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Cash on Delivery
                          </p>
                          <p className="text-sm text-ink/60 mt-1">
                            Pay in cash when your order arrives
                          </p>
                        </div>
                      </label>

                      {/* bKash */}
                      <label
                        htmlFor="pm-bkash"
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
                          field.value === "bkash"
                            ? "border-brass bg-brass/5"
                            : "border-black/10 hover:border-black/20"
                        )}
                      >
                        <RadioGroupItem
                          value="bkash"
                          id="pm-bkash"
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-ink flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            bKash
                          </p>
                          <p className="text-sm text-ink/60 mt-1">
                            Send payment, then enter your transaction ID
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* bKash instructions + TrxID input */}
            {paymentMethod === "bkash" && (
              <div className="mt-5 p-4 rounded-xl bg-pink-50 border border-pink-200">
                <p className="text-sm font-medium text-ink mb-2">
                  How to pay with bKash:
                </p>
                <ol className="text-sm text-ink/70 space-y-1.5 list-decimal list-inside mb-4">
                  <li>
                    Open the bKash app or dial <strong>*247#</strong>
                  </li>
                  <li>
                    Choose <strong>Send Money</strong>
                  </li>
                  <li>
                    Send <strong>৳{total.toLocaleString()}</strong> to:{" "}
                    <strong className="text-pink-700">{BKASH_NUMBER}</strong>
                  </li>
                  <li>Copy the Transaction ID (TrxID) from the confirmation SMS</li>
                  <li>Paste the TrxID below and place your order</li>
                </ol>

                <FormField
                  control={form.control}
                  name="payment_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        bKash Transaction ID *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 8N7A2B3C4D"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        We&apos;ll verify the payment and confirm your order.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </section>
        </div>

        {/* Right: Order summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="p-6 rounded-2xl border border-black/5 bg-white">
            <h2 className="font-display text-xl text-ink mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4 max-h-[280px] overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 text-sm">
                  <span className="text-ink/50 shrink-0">
                    {item.quantity}×
                  </span>
                  <span className="flex-1 text-ink line-clamp-2">
                    {item.name}
                  </span>
                  <span className="text-ink shrink-0">
                    ৳{(item.unitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/60">Subtotal</span>
                <span className="text-ink">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Delivery</span>
                <span className="text-ink">
                  ৳{DELIVERY_FEE.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-baseline mb-6">
              <span className="font-medium text-ink">Total</span>
              <span className="font-display text-2xl text-ink">
                ৳{total.toLocaleString()}
              </span>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full bg-brass hover:bg-brass/90 text-ink font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing order...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Place Order · ৳{total.toLocaleString()}
                </>
              )}
            </Button>

            <p className="text-xs text-ink/50 text-center mt-3">
              By placing your order you agree to our terms of service.
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
}