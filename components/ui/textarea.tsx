import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-3xl border border-border bg-white/80 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted-foreground focus:border-pine focus:ring-2 focus:ring-pine/10",
        className
      )}
      {...props}
    />
  );
}
