"use client";

import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Minus, FolderOpen, BarChart2, Users } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface StatsCardProps {
  label:       string;
  value:       string | number;
  prefix?:     string;
  suffix?:     string;
  delta?:      string;
  deltaType?:  "positive" | "negative" | "neutral";
  icon:        "projects" | "revenue" | "month" | "users";
  iconColor?:  string;
  description?: string;
  animateCount?: boolean;
  countFrom?:  number;
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
    deltaType === "positive"
      ? TrendingUp
      : deltaType === "negative"
      ? TrendingDown
      : Minus;

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card",
        "transition-all duration-300 hover:shadow-card-md hover:-translate-y-0.5"
      )}
    >
      {/* subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* top row */}
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            "bg-inox-50 dark:bg-inox-900/30",
            "ring-1 ring-inox-200/60 dark:ring-inox-700/40",
            "transition-transform duration-300 group-hover:scale-110"
          )}
        >
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>

      {/* value */}
      <div className="mb-1 flex items-baseline gap-1">
        {prefix && (
          <span className="text-base font-medium text-muted-foreground">
            {prefix}
          </span>
        )}
        {animateCount && typeof value === "number" && inView ? (
          <CountUp
            start={countFrom}
            end={value}
            duration={1.8}
            separator=","
            className="text-2xl font-bold tracking-tight text-foreground"
          />
        ) : (
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        )}
        {suffix && (
          <span className="text-sm font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>

      {/* delta */}
      {delta && (
        <div className="flex items-center gap-1.5">
          <DeltaIcon
            className={cn(
              "h-3.5 w-3.5",
              deltaType === "positive" && "text-emerald-500",
              deltaType === "negative" && "text-red-500",
              deltaType === "neutral"  && "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              deltaType === "positive" && "text-emerald-600 dark:text-emerald-400",
              deltaType === "negative" && "text-red-600 dark:text-red-400",
              deltaType === "neutral"  && "text-muted-foreground"
            )}
          >
            {delta}
          </span>
        </div>
      )}

      {description && !delta && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 bg-inox-gradient transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}
