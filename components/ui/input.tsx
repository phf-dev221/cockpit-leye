import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted-foreground focus:border-pine focus:ring-2 focus:ring-pine/10",
        className
      )}
      {...props}
    />
  );
}
