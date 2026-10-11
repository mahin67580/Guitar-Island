import Link from "next/link";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: string;
  href?: string;
  trend?: { value: number; label?: string };
  sublabel?: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "text-brass bg-brass/10",
  href,
  trend,
  sublabel,
}: Props) {
  const content = (
    <div className="bg-white rounded-xl border border-black/5 p-5 hover:shadow-lg transition-shadow h-full">
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            accent
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.value >= 0
                ? "text-green-700 bg-green-50"
                : "text-red-700 bg-red-50"
            )}
          >
            {trend.value >= 0 ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}
            {trend.label && (
              <span className="text-ink/50 ml-0.5">{trend.label}</span>
            )}
          </div>
        )}
      </div>
      <p className="font-display text-3xl text-ink mb-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-ink/60">{label}</p>
      {sublabel && (
        <p className="text-xs text-ink/40 mt-1">{sublabel}</p>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}