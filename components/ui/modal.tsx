import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ModalProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
}

export function Modal({ children, open, onClose, className }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/55 px-4 py-6 backdrop-blur-sm">
      <button
        aria-label="Close modal"
        className="absolute inset-0"
        type="button"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center">
        <div
          className={cn(
            "relative z-10 my-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-panel",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
