"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = ["draft", "quoted", "accepted", "rejected", "completed"] as const;

interface Props {
  projectId: string;
  currentStatus: string;
}

export function ProjectStatusUpdater({ projectId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to update status");
      } else {
        toast.success(`Status updated to ${status}`);
        router.refresh();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
      <Select
        defaultValue={currentStatus}
        onValueChange={(v) => {
          if (v) void handleChange(v);
        }}
      >
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
