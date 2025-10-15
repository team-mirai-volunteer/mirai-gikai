import Link from "next/link";
import type React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  targetId?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SkipLink({
  targetId = "main-content",
  className,
  children = "本文へスキップ",
}: SkipLinkProps) {
  return (
    <Link
      href={`#${targetId}`}
      role="button"
      className={cn(
        "fixed left-1/2 top-3 z-[999] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-500",
        "transition-opacity duration-150 ease-in-out opacity-0 focus-visible:opacity-100",
        className
      )}
    >
      {children}
    </Link>
  );
}
