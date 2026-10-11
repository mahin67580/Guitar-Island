import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  center?: boolean;
  className?: string;
};

export default function SectionHeading({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
  center = false,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10",
        center && "md:flex-col md:items-center md:text-center",
        className
      )}
    >
      <div className={cn(center && "text-center")}>
        <h2 className="font-display text-3xl md:text-4xl text-ink">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-ink/60 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-brass hover:text-ink transition-colors group"
        >
          {viewAllLabel}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}