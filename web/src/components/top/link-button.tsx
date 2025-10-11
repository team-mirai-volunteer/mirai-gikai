import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface LinkButtonProps {
  href: string;
  icon: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  children: ReactNode;
  target?: string;
  rel?: string;
}

export function LinkButton({
  href,
  icon,
  children,
  target = "_blank",
  rel = "noopener noreferrer",
}: LinkButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      className="w-fit rounded-full px-6 py-3 h-auto bg-white border-black hover:bg-gray-50"
    >
      <a href={href} target={target} rel={rel}>
        <Image
          src={icon.src}
          alt={icon.alt}
          width={icon.width}
          height={icon.height}
          className="flex-shrink-0"
        />
        <span className="text-[15px] font-bold">{children}</span>
        <Image
          src="/icons/arrow-right.svg"
          alt=""
          width={16}
          height={15}
          className="flex-shrink-0"
        />
      </a>
    </Button>
  );
}
