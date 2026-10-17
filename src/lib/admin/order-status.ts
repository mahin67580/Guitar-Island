import type { OrderStatus, PaymentStatus } from "./orders-actions";

export const ORDER_STATUSES: {
  value: OrderStatus;
  label: string;
  color: string;
  dotColor: string;
}[] = [
  {
    value: "new",
    label: "New",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  {
    value: "shipped",
    label: "Shipped",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-50 text-green-700 border-green-200",
    dotColor: "bg-green-500",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    dotColor: "bg-gray-400",
  },
];

export const PAYMENT_STATUSES: {
  value: PaymentStatus;
  label: string;
  color: string;
}[] = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "paid",
    label: "Paid",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "verified",
    label: "Verified",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    value: "failed",
    label: "Failed",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    value: "refunded",
    label: "Refunded",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
];

export function getOrderStatusConfig(status: OrderStatus) {
  return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
}

export function getPaymentStatusConfig(status: PaymentStatus) {
  return (
    PAYMENT_STATUSES.find((s) => s.value === status) || PAYMENT_STATUSES[0]
  );
}