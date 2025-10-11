import Image from "next/image";
import type { ReactNode } from "react";

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
    <a
      href={href}
      target={target}
      rel={rel}
      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-black rounded-full hover:bg-gray-50 transition-colors w-fit"
    >
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
  );
}
