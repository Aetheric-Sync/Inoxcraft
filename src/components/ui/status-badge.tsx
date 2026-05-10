import { cn } from "@/lib/utils/cn";
import type { ProjectStatus } from "@/types";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; dot: string; bg: string; text: string; ring: string }
> = {
  draft: {
    label: "Draft",
    dot:   "bg-blue-400",
    bg:    "bg-blue-50  dark:bg-blue-900/20",
    text:  "text-blue-700 dark:text-blue-300",
    ring:  "ring-blue-200/60 dark:ring-blue-700/40",
  },
  quoted: {
    label: "Quoted",
    dot:   "bg-amber-400",
    bg:    "bg-amber-50  dark:bg-amber-900/20",
    text:  "text-amber-700 dark:text-amber-300",
    ring:  "ring-amber-200/60 dark:ring-amber-700/40",
  },
  accepted: {
    label: "Accepted",
    dot:   "bg-emerald-400",
    bg:    "bg-emerald-50  dark:bg-emerald-900/20",
    text:  "text-emerald-700 dark:text-emerald-300",
    ring:  "ring-emerald-200/60 dark:ring-emerald-700/40",
  },
  rejected: {
    label: "Rejected",
    dot:   "bg-red-400",
    bg:    "bg-red-50  dark:bg-red-900/20",
    text:  "text-red-700 dark:text-red-300",
    ring:  "ring-red-200/60 dark:ring-red-700/40",
  },
  completed: {
    label: "Completed",
    dot:   "bg-inox-500",
    bg:    "bg-inox-50  dark:bg-inox-900/30",
    text:  "text-inox-700 dark:text-inox-300",
    ring:  "ring-inox-200/60 dark:ring-inox-700/40",
  },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-xs font-medium ring-1",
        c.bg, c.text, c.ring
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}
