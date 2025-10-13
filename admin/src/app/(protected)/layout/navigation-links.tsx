"use client";

import { FileText, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationLinks = [
  { href: "/bills", label: "議案管理", icon: FileText },
  { href: "/diet-sessions", label: "国会会期管理", icon: Tag },
  { href: "/tags", label: "タグ管理", icon: Tag },
];

export function NavigationLinks() {
  const pathname = usePathname();

  return (
    <nav>
      <div className="flex space-x-8">
        {navigationLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-2 px-1 py-4 text-sm border-b-2 transition-colors",
                isActive
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
