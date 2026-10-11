import type { EnquiryStatus } from "./enquiries";

export const ENQUIRY_STATUSES: {
  value: EnquiryStatus;
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
    value: "contacted",
    label: "Contacted",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  {
    value: "scheduled",
    label: "Visit Scheduled",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
  },
  {
    value: "completed",
    label: "Completed",
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

export function getEnquiryStatusConfig(status: EnquiryStatus) {
  return (
    ENQUIRY_STATUSES.find((s) => s.value === status) || ENQUIRY_STATUSES[0]
  );
}