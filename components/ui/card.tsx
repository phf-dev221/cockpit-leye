import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-white/60 bg-white/82 p-5 text-ink shadow-panel backdrop-blur-sm sm:p-6",
        className
      )}
      {...props}
    />
  );
}
