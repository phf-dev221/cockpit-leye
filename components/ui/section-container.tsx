import type { HTMLAttributes, ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionContainerProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionContainer({
  eyebrow,
  title,
  description,
  action,
  className,
  children,
  ...props
}: SectionContainerProps) {
  return (
    <Card className={cn("space-y-5", className)} {...props}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{eyebrow}</p>
          ) : null}
          <h3 className="mt-2 text-2xl font-semibold text-ink">{title}</h3>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/68">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
