import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
          {badge && (
            <span className="bg-inox-100 text-inox-700 dark:bg-inox-900/40 dark:text-inox-300 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
