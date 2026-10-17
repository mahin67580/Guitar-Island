import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  ImageIcon,
  MessageCircle,
  Package,
  Printer,
  Receipt,
  Truck,
  Wallet,
} from "lucide-react";
import { getOrderByNumber } from "@/lib/orders/fetch";
import { buildOrderWhatsAppUrl } from "@/lib/orders/whatsapp";
import { getStoreSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props) {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} — Guitar Island`,
  };
}

const STATUS_STEPS = [
  { key: "new", label: "Placed", icon: Receipt },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;

  const [order, settings] = await Promise.all([
    getOrderByNumber(orderNumber),
    getStoreSettings(),
  ]);

  if (!order) notFound();

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  const whatsappUrl = buildOrderWhatsAppUrl(
    settings.whatsapp,
    order.order_number,
    order.customer_name,
    order.total,
    itemCount
  );

  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.status
  );

  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Success banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">
          Order Placed!
        </h1>
        <p className="text-ink/60 max-w-md mx-auto">
          Thank you, {order.customer_name}. We&apos;ve received your order and
          will contact you shortly to confirm.
        </p>
      </div>

      {/* Order summary card */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-cream/50 px-6 py-5 border-b border-black/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
                Order Number
              </p>
              <p className="font-display text-2xl text-ink">
                {order.order_number}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
                Placed On
              </p>
              <p className="text-ink">
                {format(new Date(order.created_at), "MMMM d, yyyy · h:mm a")}
              </p>
            </div>
          </div>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <div className="px-6 py-6 border-b border-black/5">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isComplete = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div
                    key={step.key}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    {/* Connector line */}
                    {i > 0 && (
                      <div
                        className={`absolute top-5 right-1/2 w-full h-0.5 ${
                          isComplete ? "bg-brass" : "bg-black/10"
                        }`}
                        style={{ left: "-50%" }}
                      />
                    )}

                    {/* Circle */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isComplete
                          ? "bg-brass border-brass text-ink"
                          : "bg-white border-black/15 text-ink/30"
                      } ${isCurrent ? "ring-4 ring-brass/20" : ""}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Label */}
                    <p
                      className={`text-xs mt-2 text-center ${
                        isComplete
                          ? "text-ink font-medium"
                          : "text-ink/40"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled state */}
        {isCancelled && (
          <div className="px-6 py-5 bg-red-50 border-b border-red-100">
            <p className="text-sm text-red-800 font-medium">
              This order has been cancelled.
            </p>
            <p className="text-xs text-red-700 mt-1">
              If this was a mistake, please contact us on WhatsApp.
            </p>
          </div>
        )}

        {/* Items */}
        <div className="p-6 border-b border-black/5">
          <h2 className="font-display text-lg text-ink mb-4">
            Order Items ({itemCount})
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 py-2"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream/50 border border-black/5 shrink-0">
                  {item.product_image ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/20">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink line-clamp-2">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    ৳{Number(item.unit_price).toLocaleString()} ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-ink">
                    ৳{Number(item.subtotal).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment + Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/5">
          {/* Payment */}
          <div className="p-6">
            <h3 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
              Payment
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {order.payment_method === "cod" ? (
                <>
                  <Truck className="w-4 h-4 text-brass" />
                  <p className="text-sm font-medium text-ink">
                    Cash on Delivery
                  </p>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-brass" />
                  <p className="text-sm font-medium text-ink">bKash</p>
                </>
              )}
            </div>
            {order.payment_method === "bkash" && order.payment_reference && (
              <p className="text-xs text-ink/60">
                TrxID: <span className="font-mono">{order.payment_reference}</span>
              </p>
            )}
            <p className="text-xs text-ink/60 mt-2">
              Status:{" "}
              <span className="font-medium capitalize">
                {order.payment_status}
              </span>
            </p>
          </div>

          {/* Delivery */}
          <div className="p-6">
            <h3 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
              Delivery To
            </h3>
            <p className="text-sm text-ink font-medium">
              {order.customer_name}
            </p>
            <p className="text-sm text-ink/60">{order.phone}</p>
            <p className="text-sm text-ink/60 mt-1 whitespace-pre-line">
              {order.address}
              {order.city && `\n${order.city}`}
              {order.district && `, ${order.district}`}
              {order.postal_code && ` ${order.postal_code}`}
            </p>
          </div>
        </div>

        {/* Totals */}
        <div className="p-6 bg-cream/30">
          <div className="space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span className="text-ink">
                ৳{Number(order.subtotal).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Delivery</span>
              <span className="text-ink">
                ৳{Number(order.delivery_fee).toLocaleString()}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-baseline">
              <span className="font-medium text-ink">Total</span>
              <span className="font-display text-xl text-ink">
                ৳{Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What's next */}
      <div className="bg-brass/5 border border-brass/20 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-brass shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-lg text-ink mb-1">
              What happens next?
            </h3>
            <p className="text-sm text-ink/70 mb-3">
              We&apos;ll call or message you at{" "}
              <strong>{order.phone}</strong> within 24 hours to confirm your
              order.
              {order.payment_method === "bkash" &&
                " We'll also verify your bKash payment."}
            </p>
            <p className="text-sm text-ink/70">
              Estimated delivery: 2–5 business days after confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          asChild
          size="lg"
          className="bg-[#25D366] hover:bg-[#1da851] text-white font-semibold"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Confirm on WhatsApp
          </a>
        </Button>

        <Button asChild size="lg" variant="outline">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-ink/40 mt-8">
        Bookmark this page to check your order status anytime:{" "}
        <span className="font-mono text-ink/60">
          /order/{order.order_number}
        </span>
      </p>
    </div>
  );
}