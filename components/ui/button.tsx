import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
        variant === "primary" && "bg-primary text-primary-foreground shadow-panel",
        variant === "secondary" && "bg-muted text-ink",
        variant === "ghost" && "border border-border bg-white/60 text-ink",
        variant === "danger" && "bg-danger text-white",
        className
      )}
      {...props}
    />
  );
}
