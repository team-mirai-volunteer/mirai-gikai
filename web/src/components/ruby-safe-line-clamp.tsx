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
        lineClamp ? `line-clamp-${lineClamp}` : undefined,
        className
      )}
      {...paragraphProps}
    >
      {displayText}
    </p>
  );
}
