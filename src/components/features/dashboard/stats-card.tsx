"use client";

import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Minus, FolderOpen, BarChart2, Users } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface StatsCardProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon: "projects" | "revenue" | "month" | "users";
  iconColor?: string;
  description?: string;
  animateCount?: boolean;
  countFrom?: number;
}

const ICON_MAP = {
  projects: FolderOpen,
  revenue: TrendingUp,
  month: BarChart2,
  users: Users,
};

export function StatsCard({
  label,
  value,
  prefix,
  suffix,
  delta,
  deltaType = "neutral",
  icon,
  iconColor = "text-inox-600",
  description,
  animateCount = false,
  countFrom = 0,
}: StatsCardProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const Icon = ICON_MAP[icon];

  const DeltaIcon =
    deltaType === "positive" ? TrendingUp : deltaType === "negative" ? TrendingDown : Minus;

  return (
    <div
      ref={ref}
      className={cn(
        "group border-border bg-card shadow-card relative overflow-hidden rounded-xl border p-5",
        "hover:shadow-card-md transition-all duration-300 hover:-translate-y-0.5",
      )}
    >
      {/* subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* top row */}
      <div className="mb-4 flex items-start justify-between">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            "bg-inox-50 dark:bg-inox-900/30",
            "ring-inox-200/60 dark:ring-inox-700/40 ring-1",
            "transition-transform duration-300 group-hover:scale-110",
          )}
        >
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>

      {/* value */}
      <div className="mb-1 flex items-baseline gap-1">
        {prefix && <span className="text-muted-foreground text-base font-medium">{prefix}</span>}
        {animateCount && typeof value === "number" && inView ? (
          <CountUp
            start={countFrom}
            end={value}
            duration={1.8}
            separator=","
            className="text-foreground text-2xl font-bold tracking-tight"
          />
        ) : (
          <span className="text-foreground text-2xl font-bold tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        )}
        {suffix && <span className="text-muted-foreground text-sm font-medium">{suffix}</span>}
      </div>

      {/* delta */}
      {delta && (
        <div className="flex items-center gap-1.5">
          <DeltaIcon
            className={cn(
              "h-3.5 w-3.5",
              deltaType === "positive" && "text-emerald-500",
              deltaType === "negative" && "text-red-500",
              deltaType === "neutral" && "text-muted-foreground",
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              deltaType === "positive" && "text-emerald-600 dark:text-emerald-400",
              deltaType === "negative" && "text-red-600 dark:text-red-400",
              deltaType === "neutral" && "text-muted-foreground",
            )}
          >
            {delta}
          </span>
        </div>
      )}

      {description && !delta && <p className="text-muted-foreground text-xs">{description}</p>}

      {/* bottom accent line */}
      <div className="bg-inox-gradient absolute right-0 bottom-0 left-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}
