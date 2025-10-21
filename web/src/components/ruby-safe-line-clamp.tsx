import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type RubySafeLineClampProps = {
  text?: string | null;
  maxLength?: number;
  lineClamp?: number;
} & Omit<HTMLAttributes<HTMLParagraphElement>, "children">;

/**
 * Applies a CSS line clamp but disables it when ruby annotations are present.
 * Safari does not support clamping ruby content, so we fall back to plain wrapping.
 */
export function RubySafeLineClamp({
  text,
  maxLength,
  lineClamp = 4,
  className,
  ...paragraphProps
}: RubySafeLineClampProps) {
  if (!text) {
    return null;
  }

  const displayText =
    typeof maxLength === "number" && maxLength > 0 && text.length > maxLength
      ? `${text.slice(0, maxLength)}…`
      : text;

  return (
    <p
      className={cn(
        "has-[ruby]:line-clamp-none",
        resolveLineClampClass(lineClamp),
        className
      )}
      {...paragraphProps}
    >
      {displayText}
    </p>
  );
}

// Tailwind needs static class names, so we map the supported clamp levels manually.
const LINE_CLAMP_CLASS_MAP: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

function resolveLineClampClass(lineClamp?: number): string | undefined {
  if (typeof lineClamp !== "number" || lineClamp <= 0) {
    return undefined;
  }

  return LINE_CLAMP_CLASS_MAP[lineClamp];
}
