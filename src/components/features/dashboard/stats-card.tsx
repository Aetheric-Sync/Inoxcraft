import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

export function StatsCard({ label, value, delta, deltaType = "neutral", icon }: StatsCardProps) {
  const deltaColors = {
    positive: "bg-green-100 text-green-700 hover:bg-green-100",
    negative: "bg-red-100 text-red-700 hover:bg-red-100",
    neutral: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium tracking-wider text-slate-500 uppercase">
          {label}
        </CardTitle>
        {icon && <div className="text-inox-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          {delta && (
            <Badge
              variant="secondary"
              className={cn("px-2 py-0.5 text-xs font-semibold", deltaColors[deltaType])}
            >
              {delta}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
