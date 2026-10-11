"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  Check,
  Clock,
  ExternalLink,
  ImageIcon,
  Loader2,
  MessageCircle,
  Phone,
  Trash2,
  User,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  deleteEnquiry,
  updateEnquiryNotes,
  updateEnquiryStatus,
  type EnquiryStatus,
} from "@/lib/admin/enquiries";
import { ENQUIRY_STATUSES, getEnquiryStatusConfig } from "@/lib/admin/status";
import { cn } from "@/lib/utils";
import type { Enquiry } from "@/lib/types";

type Props = {
  enquiry: Enquiry | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
  } | null;
  open: boolean;
  onClose: () => void;
};

export default function EnquiryDetailDrawer({
  enquiry,
  product,
  open,
  onClose,
}: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Sync form state when enquiry changes
  useEffect(() => {
    if (enquiry) {
      setNotes(enquiry.internal_notes || "");
      setFollowUp(enquiry.follow_up_date || "");
    }
  }, [enquiry]);

  if (!enquiry) return null;

  const statusConfig = getEnquiryStatusConfig(
    enquiry.status as EnquiryStatus
  );

  // Clean phone for wa.me link
  const cleanPhone = enquiry.phone.replace(/[^\d]/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hello ${enquiry.customer_name}! This is Guitar Island. We received your enquiry about ${
      enquiry.product_name || "a guitar"
    }. When would be a good time to chat?`
  );
  const whatsappHref = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;
  const telHref = `tel:${enquiry.phone}`;

  const handleStatusChange = async (status: EnquiryStatus) => {
    setUpdatingStatus(true);
    const res = await updateEnquiryStatus(enquiry.id, status);
    setUpdatingStatus(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(`Marked as ${getEnquiryStatusConfig(status).label}`);
    startTransition(() => router.refresh());
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    const res = await updateEnquiryNotes(
      enquiry.id,
      notes,
      followUp || null
    );
    setSavingNotes(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Notes saved");
    startTransition(() => router.refresh());
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    const res = await deleteEnquiry(enquiry.id);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Enquiry deleted");
    onClose();
    startTransition(() => router.refresh());
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full sm:max-w-xl p-0 overflow-y-auto">
          {/* Header */}
          <SheetHeader className="sticky top-0 bg-white border-b border-black/5 px-6 py-4 z-10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle className="font-display text-2xl text-left">
                  {enquiry.customer_name}
                </SheetTitle>
                <p className="text-xs text-ink/50 mt-1 text-left">
                  Received {format(new Date(enquiry.created_at), "MMM d, yyyy · h:mm a")}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn("shrink-0", statusConfig.color)}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5",
                    statusConfig.dotColor
                  )}
                />
                {statusConfig.label}
              </Badge>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-6">
            {/* Contact quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brass hover:bg-brass/90 text-ink font-semibold h-12"
              >
                <a href={telHref}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-[#25D366] hover:bg-[#1da851] text-white font-semibold h-12"
              >
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </Button>
            </div>

            {/* Customer info */}
            <section>
              <h3 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
                Customer Details
              </h3>
              <div className="space-y-3 p-4 rounded-xl bg-cream/40 border border-black/5">
                <Row icon={User} label="Name" value={enquiry.customer_name} />
                <Row icon={Phone} label="Phone" value={enquiry.phone} />
                {enquiry.email && (
                  <Row
                    icon={ExternalLink}
                    label="Email"
                    value={
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="text-brass hover:underline"
                      >
                        {enquiry.email}
                      </a>
                    }
                  />
                )}
              </div>
            </section>

            {/* Enquiry details */}
            <section>
              <h3 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
                Enquiry Details
              </h3>
              <div className="space-y-3 p-4 rounded-xl bg-cream/40 border border-black/5">
                <Row
                  icon={Clock}
                  label="Best time to call"
                  value={enquiry.preferred_time || "Any time"}
                />
                <Row
                  icon={Calendar}
                  label="Preferred visit date"
                  value={
                    enquiry.preferred_visit_date
                      ? format(
                          new Date(enquiry.preferred_visit_date),
                          "EEEE, MMM d, yyyy"
                        )
                      : "Not specified"
                  }
                />
                {enquiry.message && (
                  <div>
                    <p className="text-xs text-ink/50 mb-1">Message</p>
                    <p className="text-sm text-ink whitespace-pre-line bg-white p-3 rounded-lg border border-black/5">
                      {enquiry.message}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Product */}
            {(product || enquiry.product_name) && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-ink/50 mb-3">
                  Product
                </h3>
                <div className="rounded-xl border border-black/5 overflow-hidden bg-white">
                  <div className="flex gap-4 p-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-cream/50 border border-black/5 shrink-0">
                      {product?.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
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
                      <p className="font-medium text-ink line-clamp-2">
                        {product?.name || enquiry.product_name}
                      </p>
                      {product && (
                        <p className="text-sm text-ink/60 mt-1">
                          ৳{Number(product.price).toLocaleString()}
                        </p>
                      )}
                      {product && (
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-brass hover:underline mt-2"
                        >
                          View on site
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <Separator />

            {/* Status workflow */}
            <section>
              <Label className="text-xs uppercase tracking-widest text-ink/50 mb-3 block">
                Update Status
              </Label>
              <Select
                value={enquiry.status}
                onValueChange={(v) => handleStatusChange(v as EnquiryStatus)}
                disabled={updatingStatus}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            s.dotColor
                          )}
                        />
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            {/* Notes + follow-up */}
            <section>
              <Label className="text-xs uppercase tracking-widest text-ink/50 mb-3 block">
                Internal Notes
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this customer — what you discussed, pricing, etc."
                rows={4}
                className="mb-3"
              />

              <Label className="text-xs uppercase tracking-widest text-ink/50 mb-2 block">
                Follow-up Date
              </Label>
              <Input
                type="date"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                className="mb-3"
              />

              <Button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="w-full bg-brass hover:bg-brass/90 text-ink font-semibold"
              >
                {savingNotes ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Notes
                  </>
                )}
              </Button>
            </section>

            <Separator />

            {/* Danger zone */}
            <section className="pb-4">
              <Button
                variant="ghost"
                onClick={() => setDeleteOpen(true)}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Enquiry
              </Button>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the enquiry from{" "}
              <strong>{enquiry.customer_name}</strong>. This cannot be undone.
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

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-ink/40 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink/50">{label}</p>
        <p className="text-sm text-ink break-words">{value}</p>
      </div>
    </div>
  );
}