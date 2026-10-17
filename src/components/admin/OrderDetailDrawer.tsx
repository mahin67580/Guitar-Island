"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowLeft,
    Check,
    Copy,
    ImageIcon,
    Loader2,
    MessageCircle,
    Phone,
    Save,
    Trash2,
    Wallet,
    X,
} from "lucide-react";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
    deleteOrder,
    updateOrderNotes,
    updateOrderStatus,
    updatePaymentStatus,
    type OrderStatus,
    type PaymentStatus,
} from "@/lib/admin/orders-actions";
import {
    ORDER_STATUSES,
    PAYMENT_STATUSES,
    getOrderStatusConfig,
    getPaymentStatusConfig,
} from "@/lib/admin/order-status";
import { cn } from "@/lib/utils";

export type OrderItem = {
    id: string;
    product_id: string | null;
    product_name: string;
    product_image: string | null;
    unit_price: number;
    quantity: number;
    subtotal: number;
};

export type Order = {
    id: string;
    order_number: string;
    customer_name: string;
    phone: string;
    email: string | null;
    address: string;
    city: string | null;
    district: string | null;
    postal_code: string | null;
    notes: string | null;
    payment_method: "cod" | "bkash";
    payment_status: string;
    payment_reference: string | null;
    subtotal: number;
    delivery_fee: number;
    total: number;
    status: OrderStatus;
    admin_notes: string | null;
    created_at: string;
    items: OrderItem[];
};

type Props = {
    order: Order | null;
    open: boolean;
    onClose: () => void;
};

export default function OrderDetailDrawer({ order, open, onClose }: Props) {
    const router = useRouter();
    const [notes, setNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingPayment, setUpdatingPayment] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        if (order) setNotes(order.admin_notes || "");
    }, [order]);

    if (!order) return null;

    const sc = getOrderStatusConfig(order.status);
    const ps = getPaymentStatusConfig(order.payment_status as PaymentStatus);

    const cleanPhone = order.phone.replace(/[^\d]/g, "");
    const waMessage = encodeURIComponent(
        `Hello ${order.customer_name}! Guitar Island here. About your order #${order.order_number}...`
    );
    const whatsappHref = `https://wa.me/${cleanPhone}?text=${waMessage}`;

    const handleStatusChange = async (status: OrderStatus) => {
        if (
            status === "cancelled" &&
            !confirm(
                "Cancel this order? Stock will be restored and this cannot be undone."
            )
        ) {
            return;
        }
        setUpdatingStatus(true);
        const res = await updateOrderStatus(order.id, status);
        setUpdatingStatus(false);
        if ("error" in res && res.error) {
            toast.error(res.error);
            return;
        }
        toast.success(`Order marked as ${getOrderStatusConfig(status).label}`);
        startTransition(() => router.refresh());
    };

    const handlePaymentChange = async (status: PaymentStatus) => {
        setUpdatingPayment(true);
        const res = await updatePaymentStatus(order.id, status);
        setUpdatingPayment(false);
        if ("error" in res && res.error) {
            toast.error(res.error);
            return;
        }
        toast.success(`Payment marked as ${getPaymentStatusConfig(status).label}`);
        startTransition(() => router.refresh());
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        const res = await updateOrderNotes(order.id, notes);
        setSavingNotes(false);
        if ("error" in res && res.error) {
            toast.error(res.error);
            return;
        }
        toast.success("Notes saved");
        startTransition(() => router.refresh());
    };

    const handleDelete = async () => {
        setDeleteOpen(false);
        const res = await deleteOrder(order.id);
        if ("error" in res && res.error) {
            toast.error(res.error);
            return;
        }
        toast.success("Order deleted");
        onClose();
        startTransition(() => router.refresh());
    };

    const copyTrxId = () => {
        if (order.payment_reference) {
            navigator.clipboard.writeText(order.payment_reference);
            toast.success("TrxID copied");
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
                <SheetContent className="w-full sm:max-w-xl p-0 overflow-y-auto [&>button]:hidden">
                    {/* Header */}
                    <SheetHeader className="sticky top-0 bg-white border-b border-black/5 px-4 sm:px-6 py-4 z-10">
                        {/* Mobile Back Button */}
                        <div className="flex sm:hidden items-center mb-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="-ml-2 text-ink/70 hover:text-ink"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Orders
                            </Button>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
                                    Order
                                </p>
                                <SheetTitle className="font-display text-2xl text-left font-mono">
                                    {order.order_number}
                                </SheetTitle>
                                <p className="text-xs text-ink/50 mt-1">
                                    {format(
                                        new Date(order.created_at),
                                        "MMMM d, yyyy · h:mm a"
                                    )}
                                </p>
                            </div>

                            {/* Desktop Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="hidden sm:flex shrink-0 -mr-2 -mt-2"
                            >
                                <X className="w-4 h-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                            <Badge variant="outline" className={cn("shrink-0", sc.color)}>
                                <span
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full mr-1.5",
                                        sc.dotColor
                                    )}
                                />
                                {sc.label}
                            </Badge>
                            <Badge variant="outline" className={cn("shrink-0", ps.color)}>
                                {order.payment_method === "bkash" ? "bKash" : "COD"} ·{" "}
                                {ps.label}
                            </Badge>
                        </div>
                    </SheetHeader>

                    <div className="p-4 sm:p-6 space-y-6">
                        {/* Quick contact */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="bg-brass hover:bg-brass/90 text-ink font-semibold h-12"
                            >
                                <a href={`tel:${order.phone}`}>
                                    <Phone className="w-5 h-5 mr-2" />
                                    Call
                                </a>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                className="bg-[#25D366] hover:bg-[#1da851] text-white font-semibold h-12"
                            >
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    WhatsApp
                                </a>
                            </Button>
                        </div>

                        {/* Customer */}
                        <section>
                            <h3 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
                                Customer
                            </h3>
                            <div className="space-y-2 p-4 rounded-xl bg-cream/40 border border-black/5">
                                <p className="font-medium text-ink">{order.customer_name}</p>
                                <p className="text-sm text-ink/70">{order.phone}</p>
                                {order.email && (
                                    <p className="text-sm text-ink/70 break-all">{order.email}</p>
                                )}
                                <div className="pt-2 border-t border-black/5 mt-2">
                                    <p className="text-xs text-ink/50 mb-1">Delivery Address</p>
                                    <p className="text-sm text-ink whitespace-pre-line">
                                        {order.address}
                                        {order.city && `\n${order.city}`}
                                        {order.district && `, ${order.district}`}
                                        {order.postal_code && ` ${order.postal_code}`}
                                    </p>
                                </div>
                                {order.notes && (
                                    <div className="pt-2 border-t border-black/5">
                                        <p className="text-xs text-ink/50 mb-1">
                                            Customer Notes
                                        </p>
                                        <p className="text-sm text-ink">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* bKash verification */}
                        {order.payment_method === "bkash" && (
                            <section>
                                <h3 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
                                    bKash Payment
                                </h3>
                                <div className="p-4 rounded-xl bg-pink-50 border border-pink-200">
                                    <p className="text-xs text-pink-700 mb-1">
                                        Transaction ID
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono font-medium text-ink flex-1 break-all">
                                            {order.payment_reference || "—"}
                                        </p>
                                        {order.payment_reference && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0"
                                                onClick={copyTrxId}
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-ink/60 mt-2">
                                        Verify this in your bKash app, then update payment status
                                        below.
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Items */}
                        <section>
                            <h3 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
                                Items ({order.items?.length || 0})
                            </h3>
                            <div className="space-y-2">
                                {order.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 p-2 rounded-lg bg-white border border-black/5"
                                    >
                                        <div className="relative w-14 h-14 rounded-md overflow-hidden bg-cream/50 border border-black/5 shrink-0">
                                            {item.product_image ? (
                                                <Image
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    fill
                                                    sizes="56px"
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
                                        <p className="text-sm font-medium text-ink shrink-0">
                                            ৳{(Number(item.unit_price) * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-3 p-4 rounded-lg bg-cream/40 space-y-1.5 text-sm">
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
                                <Separator className="my-1" />
                                <div className="flex justify-between items-baseline">
                                    <span className="font-medium text-ink">Total</span>
                                    <span className="font-display text-lg text-ink">
                                        ৳{Number(order.total).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Status workflow */}
                        <section>
                            <Label className="text-xs uppercase tracking-widest text-ink/50 mb-3 block">
                                Order Status
                            </Label>
                            <Select
                                value={order.status}
                                onValueChange={(v) => handleStatusChange(v as OrderStatus)}
                                disabled={updatingStatus}
                            >
                                <SelectTrigger className="h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ORDER_STATUSES.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className={cn("w-2 h-2 rounded-full", s.dotColor)}
                                                />
                                                {s.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </section>

                        {/* Payment status */}
                        <section>
                            <Label className="text-xs uppercase tracking-widest text-ink/50 mb-3 block">
                                <Wallet className="w-3.5 h-3.5 inline mr-1" />
                                Payment Status
                            </Label>
                            <Select
                                value={order.payment_status}
                                onValueChange={(v) =>
                                    handlePaymentChange(v as PaymentStatus)
                                }
                                disabled={updatingPayment}
                            >
                                <SelectTrigger className="h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_STATUSES.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {order.payment_method === "bkash" &&
                                order.payment_status === "pending" && (
                                    <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                        ⚠️ Verify the bKash payment in your app before marking
                                        as Verified.
                                    </p>
                                )}
                        </section>

                        {/* Admin notes */}
                        <section>
                            <Label className="text-xs uppercase tracking-widest text-ink/50 mb-2 block">
                                Internal Notes
                            </Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Called customer, confirmed delivery for Saturday..."
                                className="mb-2"
                            />
                            <Button
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                className="w-full bg-brass hover:bg-brass/90 text-ink font-semibold"
                            >
                                {savingNotes ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4 mr-2" />
                                )}
                                Save Notes
                            </Button>
                        </section>

                        <Separator />

                        {/* Delete */}
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteOpen(true)}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Order
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes the order from{" "}
                            <strong>{order.customer_name}</strong>. The stock won&apos;t be
                            restored unless you cancel it first. This cannot be undone.
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